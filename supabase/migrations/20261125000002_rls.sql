-- Row Level Security : chaque utilisateur ne voit et ne modifie que ses propres lignes.
-- À l'insertion, le parent (compte ou épisode) doit aussi être visible par l'utilisateur.

alter table public.accounts enable row level security;
alter table public.characters enable row level security;
alter table public.episodes enable row level security;
alter table public.scenes enable row level security;

-- accounts
create policy accounts_select on public.accounts for select to authenticated using (user_id = (select auth.uid()));
create policy accounts_insert on public.accounts for insert to authenticated with check (user_id = (select auth.uid()));
create policy accounts_update on public.accounts for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy accounts_delete on public.accounts for delete to authenticated using (user_id = (select auth.uid()));

-- characters
create policy characters_select on public.characters for select to authenticated using (user_id = (select auth.uid()));
create policy characters_insert on public.characters for insert to authenticated with check (
  user_id = (select auth.uid()) and exists (select 1 from public.accounts a where a.id = account_id)
);
create policy characters_update on public.characters for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and exists (select 1 from public.accounts a where a.id = account_id));
create policy characters_delete on public.characters for delete to authenticated using (user_id = (select auth.uid()));

-- episodes
create policy episodes_select on public.episodes for select to authenticated using (user_id = (select auth.uid()));
create policy episodes_insert on public.episodes for insert to authenticated with check (
  user_id = (select auth.uid()) and exists (select 1 from public.accounts a where a.id = account_id)
);
create policy episodes_update on public.episodes for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and exists (select 1 from public.accounts a where a.id = account_id));
create policy episodes_delete on public.episodes for delete to authenticated using (user_id = (select auth.uid()));

-- scenes
create policy scenes_select on public.scenes for select to authenticated using (user_id = (select auth.uid()));
create policy scenes_insert on public.scenes for insert to authenticated with check (
  user_id = (select auth.uid()) and exists (select 1 from public.episodes e where e.id = episode_id)
);
create policy scenes_update on public.scenes for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and exists (select 1 from public.episodes e where e.id = episode_id));
create policy scenes_delete on public.scenes for delete to authenticated using (user_id = (select auth.uid()));
