-- Phase 1.2 - Member Signup & Authentication
-- Reusable infra script. Idempotent and safe to re-run.

-- Ensure required extension for UUID helpers (used in preferences table)
create extension if not exists pgcrypto;

-- 0. Create profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean default false,
  preferred_language text,
  first_name text,
  last_name text,
  city text,
  phone text,
  role text default 'reader' check (role in ('reader','editor','admin')),
  onboarding_completed boolean default false,
  profile_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 1.1 Extend profiles
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists city text,
  add column if not exists phone text,
  add column if not exists role text default 'reader' check (role in ('reader','editor','admin')),
  add column if not exists onboarding_completed boolean default false,
  add column if not exists profile_completed boolean default false,
  add column if not exists preferred_language text;

-- Migrate existing admins to role = 'admin'
update public.profiles set role = 'admin'
where coalesce(is_admin, false) = true and role is distinct from 'admin';

-- Helpful indexes
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_onboarding on public.profiles(onboarding_completed);

-- 1.1 Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_locale text;
begin
  default_locale := coalesce(new.raw_user_meta_data->>'locale', 'en');

  insert into public.profiles (id, preferred_language, role, created_at)
  values (new.id, default_locale, 'reader', now())
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Drop and recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 1.2 Create user_preferences (flexible schema)
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  preference_key text not null,
  preference_value jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, preference_key)
);

create index if not exists idx_user_preferences_user_id on public.user_preferences(user_id);
create index if not exists idx_user_preferences_key on public.user_preferences(preference_key);

-- Seed default preferences for existing users
insert into public.user_preferences (user_id, preference_key, preference_value)
select id, 'notifications', jsonb_build_object(
  'email_newsletter', true,
  'sms_alerts', false,
  'daily_shloka', true,
  'event_reminders', true,
  'provider_updates', true
) from public.profiles
on conflict (user_id, preference_key) do nothing;

-- Helper: get_user_preferences
create or replace function public.get_user_preferences(p_user_id uuid)
returns jsonb as $$
declare prefs jsonb; begin
  select jsonb_object_agg(preference_key, preference_value)
  into prefs
  from public.user_preferences
  where user_id = p_user_id;
  return coalesce(prefs, '{}'::jsonb);
end; $$ language plpgsql;

-- Helper: update_user_preference
create or replace function public.update_user_preference(
  p_user_id uuid,
  p_key text,
  p_value jsonb
) returns void as $$
begin
  insert into public.user_preferences (user_id, preference_key, preference_value)
  values (p_user_id, p_key, p_value)
  on conflict (user_id, preference_key) do update
  set preference_value = excluded.preference_value,
      updated_at = now();
end; $$ language plpgsql;

-- 1.3 RLS
alter table public.profiles enable row level security;
-- users can read/update own profile
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can read own profile'
  ) then
    create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Users can update own profile'
  ) then
    create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='Admins can read all profiles'
  ) then
    create policy "Admins can read all profiles" on public.profiles for select using (
      exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    );
  end if;
end $$;

alter table public.user_preferences enable row level security;
-- users can manage own preferences
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='user_preferences' and policyname='Users can manage own preferences'
  ) then
    create policy "Users can manage own preferences" on public.user_preferences for all using (auth.uid() = user_id);
  end if;
end $$;
