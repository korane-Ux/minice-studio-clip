begin;
select plan(11);

insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'a@test.fr');
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

-- seed_default_accounts
select is(seed_default_accounts(), 3, 'premier appel : 3 comptes créés');
select is(seed_default_accounts(), 0, 'deuxième appel : rien de plus');
select results_eq(
  $$ select name, color, style::text, lesson_format::text from accounts order by position $$,
  $$ values ('Fables de la Mer', '#2DD4BF', 'animation_3d', 'phrase_personnage'),
            ('Paraboles', '#FBBF24', 'anime_2d', 'verset'),
            ('Le Marché', '#F472B6', 'realiste', 'phrase_personnage') $$,
  'les 3 comptes du spec');
select is(
  (select core_values from accounts where name = 'Paraboles'),
  array['humilité', 'honnêteté', 'pardon', 'famille', 'persévérance', 'foi'],
  'valeurs par défaut');

-- import_script
insert into episodes (id, account_id, number) values
  ('eeeeeeee-0000-0000-0000-000000000009', (select id from accounts where position = 1), 1);

select throws_ok(
  $$ select import_script('eeeeeeee-0000-0000-0000-000000000009', '{"title":"t","lesson":"l","caption":"c","hashtags":["#a"],"scenes":[{"position":1,"start_s":0,"duration_s":9,"visual":"v","dialogue":"d","character_ids":[],"prompt":"p"}]}') $$,
  '23514', null, 'scène de 9 s refusée');
select is((select count(*)::int from scenes where episode_id = 'eeeeeeee-0000-0000-0000-000000000009'), 0, 'aucune scène après l’échec');

select lives_ok(
  $$ select import_script('eeeeeeee-0000-0000-0000-000000000009', '{"title":"Le crabe","lesson":"Partager","caption":"c","hashtags":["#fable","#partage"],"scenes":[
      {"position":1,"start_s":0,"duration_s":8,"visual":"v1","dialogue":"d1","character_ids":[],"prompt":"p1"},
      {"position":2,"start_s":8,"duration_s":8,"visual":"v2","dialogue":"","character_ids":[],"prompt":"p2"}]}') $$,
  'import valide');
select results_eq(
  $$ select title, status::text, hashtags, (select count(*)::int from scenes s where s.episode_id = e.id) from episodes e where id = 'eeeeeeee-0000-0000-0000-000000000009' $$,
  $$ values ('Le crabe', 'scenes', array['#fable','#partage'], 2) $$,
  'épisode mis à jour et scènes créées');

-- import_batch
select is(
  import_batch((select id from accounts where position = 1), '{"episodes":[
    {"title":"E2","lesson":"l","caption":"c","hashtags":[],"scenes":[{"position":1,"start_s":0,"duration_s":8,"visual":"v","dialogue":"","character_ids":[],"prompt":"p"}]},
    {"title":"E3","lesson":"l","caption":"c","hashtags":[],"scenes":[{"position":1,"start_s":0,"duration_s":8,"visual":"v","dialogue":"","character_ids":[],"prompt":"p"}]}]}'),
  2, 'lot de 2 épisodes importé');
select results_eq(
  $$ select number, title from episodes where account_id = (select id from accounts where position = 1) order by number $$,
  $$ values (1, 'Le crabe'), (2, 'E2'), (3, 'E3') $$,
  'numérotation à la suite');
select throws_ok(
  $$ select import_batch((select id from accounts where position = 1), '{"episodes":[
    {"title":"E4","lesson":"l","caption":"c","hashtags":[],"scenes":[{"position":1,"start_s":0,"duration_s":8,"visual":"v","dialogue":"","character_ids":[],"prompt":"p"}]},
    {"title":"E5","lesson":"l","caption":"c","hashtags":[],"scenes":[{"position":1,"start_s":0,"duration_s":12,"visual":"v","dialogue":"","character_ids":[],"prompt":"p"}]}]}') $$,
  '23514', null, 'un épisode invalide bloque tout le lot');

select * from finish();
rollback;
