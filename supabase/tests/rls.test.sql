begin;
select plan(11);

-- Données de A (créées en superutilisateur)
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@test.fr'),
  ('22222222-2222-2222-2222-222222222222', 'b@test.fr');
insert into accounts (id, user_id, name, color, style, content_focus, lesson_format)
  values ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Compte A', '#2DD4BF', 'animation_3d', 'x', 'verset');
insert into characters (id, user_id, account_id, name, description, color, position)
  values ('cccccccc-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 'Gaspard', 'crabe rouge', '#E5484D', 1);
insert into episodes (id, user_id, account_id, number, title)
  values ('eeeeeeee-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 1, 'Épisode de A');
insert into scenes (user_id, episode_id, position, start_s, duration_s, visual)
  values ('11111111-1111-1111-1111-111111111111', 'eeeeeeee-0000-0000-0000-000000000001', 1, 0, 8, 'plage');
insert into storage.objects (bucket_id, name, owner)
  values ('clips', '11111111-1111-1111-1111-111111111111/eeeeeeee-0000-0000-0000-000000000001/s1.mp4', '11111111-1111-1111-1111-111111111111');

-- B se connecte
set local role authenticated;
set local request.jwt.claims to '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';

select is((select count(*)::int from accounts), 0, 'B ne voit aucun compte de A');
select is((select count(*)::int from characters), 0, 'B ne voit aucun personnage de A');
select is((select count(*)::int from episodes), 0, 'B ne voit aucun épisode de A');
select is((select count(*)::int from scenes), 0, 'B ne voit aucune scène de A');
with u as (update episodes set title = 'pirate' returning 1) select is(count(*)::int, 0, 'B ne modifie rien chez A') from u;
with d as (delete from accounts returning 1) select is(count(*)::int, 0, 'B ne supprime rien chez A') from d;
select throws_ok(
  $$ insert into accounts (user_id, name, color, style, content_focus, lesson_format) values ('11111111-1111-1111-1111-111111111111', 'x', '#000000', 'realiste', 'x', 'verset') $$,
  '42501', null, 'B ne peut pas écrire au nom de A');
select throws_ok(
  $$ insert into characters (account_id, name) values ('aaaaaaaa-0000-0000-0000-000000000001', 'Intrus') $$,
  '42501', null, 'B ne peut pas ajouter un personnage dans le compte de A');
select is((select count(*)::int from storage.objects where bucket_id = 'clips'), 0, 'B ne voit aucun clip de A');

-- A se connecte : il voit bien ses données (les zéros ci-dessus ne sont pas dus à une table vide)
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select is((select count(*)::int from accounts), 1, 'A voit son compte');
select is((select count(*)::int from storage.objects where bucket_id = 'clips'), 1, 'A voit son clip');

select * from finish();
rollback;
