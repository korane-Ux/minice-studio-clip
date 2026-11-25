-- Droits explicites : depuis mai 2026, les nouveaux projets Supabase n'exposent plus
-- automatiquement les tables du schéma public. Seuls les utilisateurs connectés y ont accès,
-- et la RLS filtre ensuite ligne par ligne.

revoke all on public.accounts, public.characters, public.episodes, public.scenes from anon, public;
grant select, insert, update, delete on public.accounts, public.characters, public.episodes, public.scenes to authenticated;

revoke execute on function public.seed_default_accounts() from public, anon;
revoke execute on function public.import_script(uuid, jsonb) from public, anon;
revoke execute on function public.import_batch(uuid, jsonb) from public, anon;
grant execute on function public.seed_default_accounts() to authenticated;
grant execute on function public.import_script(uuid, jsonb) to authenticated;
grant execute on function public.import_batch(uuid, jsonb) to authenticated;

-- Limites des buckets (offre gratuite : 50 Mo par fichier) et types acceptés.
update storage.buckets set file_size_limit = 5242880, allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'] where id = 'refs';
update storage.buckets set file_size_limit = 52428800, allowed_mime_types = array['video/mp4', 'video/webm', 'video/quicktime'] where id = 'clips';
update storage.buckets set file_size_limit = 52428800, allowed_mime_types = array['video/mp4'] where id = 'videos';
