-- Buckets privés. Chaque fichier est rangé sous un dossier qui porte l'id de son propriétaire :
-- refs/{user_id}/..., clips/{user_id}/..., videos/{user_id}/...

insert into storage.buckets (id, name, public) values
  ('refs', 'refs', false),
  ('clips', 'clips', false),
  ('videos', 'videos', false)
on conflict (id) do nothing;

create policy studio_files_select on storage.objects for select to authenticated using (
  bucket_id in ('refs', 'clips', 'videos') and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy studio_files_insert on storage.objects for insert to authenticated with check (
  bucket_id in ('refs', 'clips', 'videos') and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy studio_files_update on storage.objects for update to authenticated
  using (bucket_id in ('refs', 'clips', 'videos') and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id in ('refs', 'clips', 'videos') and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy studio_files_delete on storage.objects for delete to authenticated using (
  bucket_id in ('refs', 'clips', 'videos') and (storage.foldername(name))[1] = (select auth.uid())::text
);
