-- Fonctions appelées par l'appli. Toutes en "security invoker" : la RLS s'applique à l'intérieur.

-- Crée les 3 comptes de départ (spec, section 6) si l'utilisateur n'en a aucun.
create or replace function public.seed_default_accounts()
returns int
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_values text[] := array['humilité', 'honnêteté', 'pardon', 'famille', 'persévérance', 'foi'];
  v_exclusions text[] := array['adultère', 'vengeance cruelle', 'grossesses cachées', 'gore', 'scènes sexuelles'];
  v_tone text := 'Émouvant, respectueux, toujours une note d''espoir';
begin
  if auth.uid() is null then
    raise exception 'Utilisateur non connecté' using errcode = '42501';
  end if;
  if exists (select 1 from accounts where user_id = auth.uid()) then
    return 0;
  end if;
  insert into accounts (name, color, style, content_focus, lesson_format, themes, core_values, exclusions, tone, position) values
    ('Fables de la Mer', '#2DD4BF', 'animation_3d', 'Fables modernes : leçons de vie et valeurs', 'phrase_personnage',
      array['Fables modernes'], v_values, v_exclusions, v_tone, 1),
    ('Paraboles', '#FBBF24', 'anime_2d', 'Paraboles et récits bibliques mis en scène', 'verset',
      array['Paraboles de Jésus', 'Récits de l''Ancien Testament'], v_values, v_exclusions, v_tone, 2),
    ('Le Marché', '#F472B6', 'realiste', 'Sagas familiales et réussites méritées, avec une morale', 'phrase_personnage',
      array['Sagas familiales', 'Réussites méritées'], v_values, v_exclusions, v_tone, 3);
  return 3;
end;
$$;

-- Importe un script dans un épisode : métadonnées + scènes, en une seule transaction.
-- p_payload = {title, lesson, caption, hashtags[], scenes[{position, start_s, duration_s, visual, dialogue, character_ids[], prompt}]}
create or replace function public.import_script(p_episode_id uuid, p_payload jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (select 1 from episodes where id = p_episode_id) then
    raise exception 'Épisode introuvable' using errcode = 'P0002';
  end if;

  update episodes set
    title = p_payload ->> 'title',
    lesson = p_payload ->> 'lesson',
    caption = p_payload ->> 'caption',
    hashtags = coalesce(array(select jsonb_array_elements_text(p_payload -> 'hashtags')), '{}'),
    status = 'scenes'
  where id = p_episode_id;

  delete from scenes where episode_id = p_episode_id;

  insert into scenes (episode_id, position, start_s, duration_s, visual, dialogue, character_ids, prompt)
  select p_episode_id, s.position, s.start_s, s.duration_s, s.visual, coalesce(s.dialogue, ''),
         coalesce(s.character_ids, '{}'), coalesce(s.prompt, '')
  from jsonb_to_recordset(p_payload -> 'scenes') as s(
    position int, start_s numeric, duration_s numeric, visual text, dialogue text, character_ids uuid[], prompt text
  );
end;
$$;

-- Importe un lot d'épisodes, numérotés à la suite des épisodes existants du compte. Tout ou rien.
-- p_payload = {episodes: [payload de import_script, ...]}
create or replace function public.import_batch(p_account_id uuid, p_payload jsonb)
returns int
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_next int;
  v_item jsonb;
  v_episode_id uuid;
  v_count int := 0;
begin
  if not exists (select 1 from accounts where id = p_account_id) then
    raise exception 'Compte introuvable' using errcode = 'P0002';
  end if;
  select coalesce(max(number), 0) + 1 into v_next from episodes where account_id = p_account_id;

  for v_item in select value from jsonb_array_elements(p_payload -> 'episodes') loop
    insert into episodes (account_id, number) values (p_account_id, v_next + v_count) returning id into v_episode_id;
    perform import_script(v_episode_id, v_item);
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;
