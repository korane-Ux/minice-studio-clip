begin;
select plan(4);

-- Limites des buckets alignées sur l'offre gratuite de Supabase (50 Mo par fichier).
select results_eq(
  $$ select id, file_size_limit from storage.buckets where id in ('refs', 'clips', 'videos') order by id $$,
  $$ values ('clips'::text, 52428800::bigint), ('refs', 5242880), ('videos', 52428800) $$,
  'taille maximale par bucket');
select is((select allowed_mime_types from storage.buckets where id = 'refs'), array['image/png', 'image/jpeg', 'image/webp'], 'images de référence');
select is((select allowed_mime_types from storage.buckets where id = 'clips'), array['video/mp4', 'video/webm', 'video/quicktime'], 'clips');

-- anon n'a aucun droit sur les tables ni sur les fonctions
set local role anon;
select throws_ok($$ select count(*) from accounts $$, '42501', null, 'anon ne lit pas les comptes');

select * from finish();
rollback;
