-- ============================================================
-- Historicache Database Schema
-- Run this in the Supabase SQL editor (Dashboard > SQL editor)
-- ============================================================

-- Sites: historical locations with photo and coordinates
create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  photo_url text,
  lat double precision not null,
  lng double precision not null,
  points_value integer not null default 10,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Check-ins: one per user per site
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  unique(user_id, site_id)
);

-- User profiles: username + running score
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  total_score integer not null default 0,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.sites enable row level security;
alter table public.checkins enable row level security;
alter table public.profiles enable row level security;

-- Sites: anyone can read; authenticated users can insert; owners can update/delete
create policy "sites_select" on public.sites for select using (true);
create policy "sites_insert" on public.sites for insert with check (auth.uid() = created_by);
create policy "sites_update" on public.sites for update using (auth.uid() = created_by);
create policy "sites_delete" on public.sites for delete using (auth.uid() = created_by);

-- Check-ins: users manage their own
create policy "checkins_select" on public.checkins for select using (auth.uid() = user_id);
create policy "checkins_insert" on public.checkins for insert with check (auth.uid() = user_id);

-- Profiles: anyone can read; owner can update
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);

-- ============================================================
-- RPC: Atomic score increment (called from client after check-in)
-- ============================================================

create or replace function public.increment_score(p_user_id uuid, p_amount integer)
returns void
language sql
security definer
set search_path = public
as $$
  update profiles
  set total_score = total_score + p_amount,
      updated_at = now()
  where id = p_user_id;
$$;

-- ============================================================
-- Storage bucket for site photos
-- Run these in Dashboard > Storage, or via the API:
--   1. Create a public bucket named "site-photos"
--   2. Add an upload policy for authenticated users:
--      (bucket_id = 'site-photos' AND auth.role() = 'authenticated')
-- ============================================================
