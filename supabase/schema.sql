-- WasfaIQ database schema.
-- Run once in Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE).

-- One row per signed-up user. Mirrors auth.users.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade
);

-- One row per saved recipe adaptation.
create table if not exists public.recipes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  source_url   text,
  source_type  text not null check (source_type in ('url', 'tiktok', 'instagram')),
  original_json  jsonb not null,
  adapted_json   jsonb not null,
  created_at   timestamptz not null default now()
);

create index if not exists recipes_user_id_idx on public.recipes (user_id, created_at desc);

-- Row Level Security (RLS).
-- RLS means: even though the anon key is public, users can only read/write
-- their own rows. Supabase enforces this automatically on every query.
alter table public.profiles enable row level security;
alter table public.recipes  enable row level security;

-- Users can only see and edit their own profile.
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Users can only see and edit their own recipes.
drop policy if exists "own recipes" on public.recipes;
create policy "own recipes" on public.recipes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row when a new user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
