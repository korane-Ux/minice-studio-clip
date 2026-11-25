-- Schéma de Minice Studio Clip V1.
-- Chaque ligne appartient à un utilisateur (user_id) ; la sécurité est dans 20261125000002_rls.sql.

create type public.account_style as enum ('animation_3d', 'anime_2d', 'realiste');
create type public.lesson_format as enum ('verset', 'phrase_personnage', 'phrase_ecran');
create type public.episode_status as enum ('idee', 'scenes', 'montage', 'a_valider', 'valide', 'publie', 'rejete');

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  color text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  tiktok_handle text,
  style public.account_style not null,
  content_focus text not null default '',
  tone text not null default '',
  target_duration_s int not null default 30 check (target_duration_s in (20, 30, 40)),
  lesson_format public.lesson_format not null default 'phrase_personnage',
  core_values text[] not null default '{}',
  themes text[] not null default '{}',
  exclusions text[] not null default '{}',
  series_summary text not null default '',
  autopilot_cadence int not null default 3 check (autopilot_cadence between 1 and 14),
  autopilot_confirm boolean not null default true,
  auto_check boolean not null default true,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index accounts_user_id_idx on public.accounts (user_id);

create table public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  description text not null default '',
  color text not null default '#8880F0' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  ref_image_path text,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index characters_account_id_idx on public.characters (account_id);

create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  number int not null check (number > 0),
  title text not null default '',
  idea jsonb not null default '{}',
  status public.episode_status not null default 'idee',
  lesson text not null default '',
  caption text not null default '',
  hashtags text[] not null default '{}',
  video_path text,
  validated_at timestamptz,
  published_at timestamptz,
  views int check (views >= 0),
  views_updated_at timestamptz,
  created_at timestamptz not null default now(),
  unique (account_id, number)
);
create index episodes_user_id_idx on public.episodes (user_id);

create table public.scenes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  episode_id uuid not null references public.episodes (id) on delete cascade,
  position int not null check (position between 1 and 5),
  start_s numeric not null check (start_s >= 0),
  duration_s numeric not null check (duration_s > 0 and duration_s <= 8),
  visual text not null,
  dialogue text not null default '',
  character_ids uuid[] not null default '{}',
  prompt text not null default '',
  clip_path text,
  created_at timestamptz not null default now(),
  unique (episode_id, position)
);
create index scenes_episode_id_idx on public.scenes (episode_id);
