-- ─────────────────────────────────────────────────────────────────────────────
-- WebGrid — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. PROFILES ──────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with app-specific data
create table if not exists public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  name            text not null default '',
  avatar_color    text not null default '#7C7FFF',
  is_pro          boolean not null default false,
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  stripe_price_id         text,
  subscription_status     text default 'inactive',  -- active | inactive | canceled | past_due
  current_period_end      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    '#7C7FFF'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ── 2. BOOKMARKS ─────────────────────────────────────────────────────────────
create table if not exists public.bookmarks (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  site_slug   text not null,                   -- matches webLinks[].slug
  site_title  text not null default '',
  site_url    text not null default '',
  site_cat    text not null default '',
  created_at  timestamptz not null default now(),
  unique(user_id, site_slug)                   -- one bookmark per site per user
);

create index if not exists bookmarks_user_id_idx on public.bookmarks(user_id);

-- ── 3. ROW LEVEL SECURITY (RLS) ──────────────────────────────────────────────
-- Enable RLS on all tables
alter table public.profiles  enable row level security;
alter table public.bookmarks enable row level security;

-- Profiles: users can read & update only their own row
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Bookmarks: full CRUD on own rows only
create policy "Users can view own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- Service role bypass (used by webhook API routes)
-- The service role key already bypasses RLS — no extra policy needed.

-- ── 4. HELPFUL VIEWS ─────────────────────────────────────────────────────────
-- Count bookmarks per user (used in dashboard stats)
create or replace view public.bookmark_counts as
  select user_id, count(*) as total
  from public.bookmarks
  group by user_id;

-- ── DONE ─────────────────────────────────────────────────────────────────────
-- After running this script:
-- 1. Enable Email auth in Supabase Dashboard → Authentication → Providers → Email
-- 2. (Optional) Enable Google / GitHub OAuth providers
-- 3. Copy your project URL and anon key into .env.local
