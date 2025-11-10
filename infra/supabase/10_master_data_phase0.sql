-- Master Data Management System - Phase 0A (Schema + Seeds)
-- Safe to run multiple times (idempotent as far as possible).
-- This script adds governance fields, creates new master tables, mapping tables, RLS, indexes, and seeds.

-- =====================================================================================
-- 0) Helpers: existence checks
-- =====================================================================================
create or replace function _col_exists(p_table text, p_column text)
returns boolean language sql stable as $$
  select exists (
    select 1 from information_schema.columns 
    where table_name = p_table and column_name = p_column
  );
$$;

-- helper: check if a policy exists on a table in public schema
create or replace function _policy_exists(p_table text, p_policy text)
returns boolean language sql stable as $$
  select exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = p_table and policyname = p_policy
  );
$$;

-- =====================================================================================
-- 1) Extend existing taxonomy tables: categories, sampradayas
-- =====================================================================================
-- categories: add governance fields + new naming
do $$
begin
  if not _col_exists('categories','is_active') then
    alter table categories add column is_active boolean not null default true;
    update categories set is_active = coalesce(active, true);
  end if;
  if not _col_exists('categories','display_order') then
    alter table categories add column display_order integer not null default 0;
    update categories set display_order = coalesce(sort_order, 0);
  end if;
  if not _col_exists('categories','description') then
    alter table categories add column description text;
  end if;
  if not _col_exists('categories','icon') then
    alter table categories add column icon text;
  end if;
  if not _col_exists('categories','badge_color') then
    alter table categories add column badge_color text;
  end if;
  if not _col_exists('categories','created_by') then
    alter table categories add column created_by uuid;
  end if;
  if not _col_exists('categories','updated_at') then
    alter table categories add column updated_at timestamptz default now();
  end if;
  if not _col_exists('categories','updated_by') then
    alter table categories add column updated_by uuid;
  end if;
  if not _col_exists('categories','deleted_at') then
    alter table categories add column deleted_at timestamptz;
  end if;
end $$;

create index if not exists idx_categories_is_active_order on categories(is_active, display_order);
create index if not exists idx_categories_deleted_at on categories(deleted_at);

comment on column categories.is_active is 'Governance: replaces active (kept for compatibility)';
comment on column categories.display_order is 'Governance: replaces sort_order (kept for compatibility)';

-- sampradayas: add governance fields
DO $$
BEGIN
  if not _col_exists('sampradayas','is_active') then
    alter table sampradayas add column is_active boolean not null default true;
    update sampradayas set is_active = coalesce(active, true);
  end if;
  if not _col_exists('sampradayas','display_order') then
    alter table sampradayas add column display_order integer not null default 0;
    update sampradayas set display_order = coalesce(sort_order, 0);
  end if;
  if not _col_exists('sampradayas','description') then
    alter table sampradayas add column description text;
  end if;
  if not _col_exists('sampradayas','created_by') then
    alter table sampradayas add column created_by uuid;
  end if;
  if not _col_exists('sampradayas','updated_at') then
    alter table sampradayas add column updated_at timestamptz default now();
  end if;
  if not _col_exists('sampradayas','updated_by') then
    alter table sampradayas add column updated_by uuid;
  end if;
  if not _col_exists('sampradayas','deleted_at') then
    alter table sampradayas add column deleted_at timestamptz;
  end if;
END $$;

create index if not exists idx_sampradayas_is_active_order on sampradayas(is_active, display_order);
create index if not exists idx_sampradayas_deleted_at on sampradayas(deleted_at);

comment on column sampradayas.is_active is 'Governance: replaces active (kept for compatibility)';
comment on column sampradayas.display_order is 'Governance: replaces sort_order (kept for compatibility)';

-- =====================================================================================
-- 2) Mapping: which sampradayas apply to which categories
-- =====================================================================================
create table if not exists sampradaya_categories (
  sampradaya_code text references sampradayas(code) on delete cascade,
  category_code   text references categories(code) on delete cascade,
  created_at      timestamptz default now(),
  created_by      uuid,
  primary key (sampradaya_code, category_code)
);

-- =====================================================================================
-- 3) Languages + provider_languages
-- =====================================================================================
create table if not exists languages (
  code text primary key,          -- ISO 639-1, e.g. 'kn', 'en'
  name text not null,             -- English display name
  native_name text,               -- optional native label (future i18n)
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  created_by uuid,
  updated_at timestamptz default now(),
  updated_by uuid,
  deleted_at timestamptz
);

create index if not exists idx_languages_is_active_order on languages(is_active, display_order);
create index if not exists idx_languages_deleted_at on languages(deleted_at);

create table if not exists provider_languages (
  provider_id uuid references providers(id) on delete cascade,
  language_code text references languages(code) on delete restrict,
  created_at timestamptz default now(),
  created_by uuid,
  primary key (provider_id, language_code)
);

-- =====================================================================================
-- 4) Service radius options (no FK yet on providers)
-- =====================================================================================
create table if not exists service_radius_options (
  id uuid primary key default gen_random_uuid(),
  value_km integer,                -- null for non-numeric (e.g., Entire city)
  display_text text not null,      -- e.g., '5 km', '30+ km', 'Entire city'
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  created_by uuid,
  updated_at timestamptz default now(),
  updated_by uuid,
  deleted_at timestamptz
);

create index if not exists idx_service_radius_is_active_order on service_radius_options(is_active, display_order);
create index if not exists idx_service_radius_deleted_at on service_radius_options(deleted_at);

-- =====================================================================================
-- 5) Experience levels (optional FK later)
-- =====================================================================================
create table if not exists experience_levels (
  id uuid primary key default gen_random_uuid(),
  name text not null,              -- Beginner, Intermediate, Expert
  min_years integer,
  max_years integer,
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  created_by uuid,
  updated_at timestamptz default now(),
  updated_by uuid,
  deleted_at timestamptz
);

create index if not exists idx_experience_levels_is_active_order on experience_levels(is_active, display_order);
create index if not exists idx_experience_levels_deleted_at on experience_levels(deleted_at);

-- =====================================================================================
-- 6) Terms + provider_terms_acceptance
-- =====================================================================================
create table if not exists terms (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('user_terms','provider_terms','privacy_policy','other')),
  version text not null,
  content text not null,
  effective_date date,
  description text,
  is_active boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz default now(),
  created_by uuid,
  updated_at timestamptz default now(),
  updated_by uuid,
  deleted_at timestamptz
);

-- one active per type
create unique index if not exists uq_terms_active_per_type on terms(type) where is_active = true;

create table if not exists provider_terms_acceptance (
  provider_id uuid references providers(id) on delete cascade,
  terms_id uuid references terms(id) on delete restrict,
  accepted_at timestamptz not null default now(),
  snapshot_version text,          -- store version string at acceptance time
  primary key (provider_id, terms_id)
);

-- Indexes for terms
create index if not exists idx_terms_is_active_order on terms(is_active, display_order);
create index if not exists idx_terms_type on terms(type);
create index if not exists idx_terms_deleted_at on terms(deleted_at);

-- =====================================================================================
-- 7) Seeds
-- =====================================================================================
-- Languages (ISO 639-1)
insert into languages (code, name, native_name, display_order)
values
  ('kn','Kannada','ಕನ್ನಡ',10),
  ('hi','Hindi','हिन्दी',20),
  ('ta','Tamil','தமிழ்',30),
  ('en','English','English',40),
  ('te','Telugu','తెలుగు',50),
  ('mr','Marathi','मराठी',60)
on conflict (code) do update set
  name = excluded.name,
  native_name = excluded.native_name,
  display_order = excluded.display_order,
  deleted_at = null,
  is_active = true;

-- Service radius options
insert into service_radius_options (id, value_km, display_text, display_order, is_active)
values
  (gen_random_uuid(), 5, '5 km', 10, true),
  (gen_random_uuid(), 10, '10 km', 20, true),
  (gen_random_uuid(), 15, '15 km', 30, true),
  (gen_random_uuid(), 20, '20 km', 40, true),
  (gen_random_uuid(), 25, '25 km', 50, true),
  (gen_random_uuid(), 30, '30+ km', 60, true),
  (gen_random_uuid(), null, 'Entire city', 70, true)
on conflict do nothing;

-- Experience levels
insert into experience_levels (id, name, min_years, max_years, display_order, is_active)
values
  (gen_random_uuid(), 'Beginner', 0, 2, 10, true),
  (gen_random_uuid(), 'Intermediate', 3, 6, 20, true),
  (gen_random_uuid(), 'Expert', 7, null, 30, true)
on conflict do nothing;

-- Optional: initial sampradaya-category mappings (broad defaults)
insert into sampradaya_categories (sampradaya_code, category_code)
select s.code, c.code
from sampradayas s
cross join categories c
where s.code in ('madhwa','smarta','vaishnava','shaivite')
  and c.code in ('purohit','cook','senior-care','pilgrimage')
on conflict do nothing;

-- =====================================================================================
-- 8) RLS (public read, admin mutate) - add if not already present
-- =====================================================================================
-- languages
alter table languages enable row level security;
do $$ begin
  if not _policy_exists('languages','languages_public_read') then
    execute 'create policy languages_public_read on languages for select using (true)';
  end if;
  if not _policy_exists('languages','languages_admin_all') then
    execute 'create policy languages_admin_all on languages for all
      using (exists (select 1 from admins a where a.user_email = auth.jwt() ->> ''email''))
      with check (exists (select 1 from admins a where a.user_email = auth.jwt() ->> ''email''))';
  end if;
end $$;

-- service_radius_options
alter table service_radius_options enable row level security;
do $$ begin
  if not _policy_exists('service_radius_options','service_radius_public_read') then
    execute 'create policy service_radius_public_read on service_radius_options for select using (true)';
  end if;
  if not _policy_exists('service_radius_options','service_radius_admin_all') then
    execute 'create policy service_radius_admin_all on service_radius_options for all
      using (exists (select 1 from admins a where a.user_email = auth.jwt() ->> ''email''))
      with check (exists (select 1 from admins a where a.user_email = auth.jwt() ->> ''email''))';
  end if;
end $$;

-- experience_levels
alter table experience_levels enable row level security;
do $$ begin
  if not _policy_exists('experience_levels','experience_levels_public_read') then
    execute 'create policy experience_levels_public_read on experience_levels for select using (true)';
  end if;
  if not _policy_exists('experience_levels','experience_levels_admin_all') then
    execute 'create policy experience_levels_admin_all on experience_levels for all
      using (exists (select 1 from admins a where a.user_email = auth.jwt() ->> ''email''))
      with check (exists (select 1 from admins a where a.user_email = auth.jwt() ->> ''email''))';
  end if;
end $$;

-- terms
alter table terms enable row level security;
do $$ begin
  if not _policy_exists('terms','terms_public_read') then
    execute 'create policy terms_public_read on terms for select using (true)';
  end if;
  if not _policy_exists('terms','terms_admin_all') then
    execute 'create policy terms_admin_all on terms for all
      using (exists (select 1 from admins a where a.user_email = auth.jwt() ->> ''email''))
      with check (exists (select 1 from admins a where a.user_email = auth.jwt() ->> ''email''))';
  end if;
end $$;

-- provider_languages
alter table provider_languages enable row level security;
-- reads: public allowed for approved providers where acceptable in future; for now admin only
do $$ begin
  if not _policy_exists('provider_languages','provider_languages_admin_all') then
    execute 'create policy provider_languages_admin_all on provider_languages for all
      using (exists (select 1 from admins a where a.user_email = auth.jwt() ->> ''email''))
      with check (exists (select 1 from admins a where a.user_email = auth.jwt() ->> ''email''))';
  end if;
end $$;

-- sampradaya_categories
alter table sampradaya_categories enable row level security;
do $$ begin
  if not _policy_exists('sampradaya_categories','sampradaya_categories_public_read') then
    execute 'create policy sampradaya_categories_public_read on sampradaya_categories for select using (true)';
  end if;
  if not _policy_exists('sampradaya_categories','sampradaya_categories_admin_all') then
    execute 'create policy sampradaya_categories_admin_all on sampradaya_categories for all
      using (exists (select 1 from admins a where a.user_email = auth.jwt() ->> ''email''))
      with check (exists (select 1 from admins a where a.user_email = auth.jwt() ->> ''email''))';
  end if;
end $$;

-- provider_terms_acceptance
alter table provider_terms_acceptance enable row level security;
do $$ begin
  if not _policy_exists('provider_terms_acceptance','provider_terms_acceptance_admin_all') then
    execute 'create policy provider_terms_acceptance_admin_all on provider_terms_acceptance for all
      using (exists (select 1 from admins a where a.user_email = auth.jwt() ->> ''email''))
      with check (exists (select 1 from admins a where a.user_email = auth.jwt() ->> ''email''))';
  end if;
end $$;

-- =====================================================================================
-- 9) Notes
-- - We keep legacy columns (active, sort_order) for compatibility; plan deprecation.
-- - No FK wired yet from providers to service_radius_options or experience_levels.
-- - Language migration will move providers.languages -> provider_languages in Phase 0E.
-- =====================================================================================
