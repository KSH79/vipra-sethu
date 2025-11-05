-- Migration: Create taxonomy tables (categories, sampradayas) and link to providers
-- Description: Normalizes provider category and sampradaya fields using lookup tables
-- Order: Run after 05_*.sql

-- ============================================================================
-- 1) Create taxonomy tables
-- ============================================================================
create table if not exists categories (
  code text primary key,               -- machine-readable code (e.g., 'purohit')
  name text not null,                  -- display name (e.g., 'Vedic Purohit')
  description text,                    -- optional
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists sampradayas (
  code text primary key,               -- machine-readable code (e.g., 'madhwa')
  name text not null,                  -- display name (e.g., 'Madhwa')
  description text,                    -- optional
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

comment on table categories is 'Service categories taxonomy for providers';
comment on table sampradayas is 'Religious tradition taxonomy for providers';

create index if not exists idx_categories_active_order on categories(active, sort_order);
create index if not exists idx_sampradayas_active_order on sampradayas(active, sort_order);

-- ============================================================================
-- 2) Seed initial values (idempotent)
-- ============================================================================
insert into categories (code, name, description, sort_order)
values
  ('purohit', 'Vedic Purohit', 'Traditional Vedic priest services', 10),
  ('cook', 'Cook', 'Traditional vegetarian cooking for rituals and events', 20),
  ('essentials', 'Essentials', 'Puja essentials and materials', 30),
  ('senior-care', 'Senior Care', 'Support and care services for seniors', 40),
  ('pilgrimage', 'Pilgrimage Guide', 'Guides and assistance for pilgrimages', 50),
  ('other', 'Other', 'Other services', 90)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into sampradayas (code, name, description, sort_order)
values
  ('madhwa', 'Madhwa', null, 10),
  ('smarta', 'Smarta', null, 20),
  ('vaishnava', 'Vaishnava', null, 30),
  ('shaivite', 'Shaivite', null, 40),
  ('other', 'Other', null, 90)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- ============================================================================
-- 3) Add FK columns to providers (backward-compatible)
-- ============================================================================
alter table providers
  add column if not exists category_code text references categories(code),
  add column if not exists sampradaya_code text references sampradayas(code);

create index if not exists idx_providers_category_code on providers(category_code);
create index if not exists idx_providers_sampradaya_code on providers(sampradaya_code);

-- Backfill from existing free-text columns where possible (case-insensitive)
update providers p set category_code = c.code
from categories c
where p.category is not null
  and lower(p.category) in (
    'purohit', 'vedic purohit', 'cook', 'essentials', 'senior-care', 'senior care', 'pilgrimage', 'pilgrimage guide', 'other'
  )
  and (
    (lower(p.category) like 'vedic purohit' and c.code='purohit') or
    (lower(p.category) like 'purohit' and c.code='purohit') or
    (lower(p.category) like 'cook' and c.code='cook') or
    (lower(p.category) like 'essentials' and c.code='essentials') or
    (lower(p.category) in ('senior care','senior-care') and c.code='senior-care') or
    (lower(p.category) in ('pilgrimage','pilgrimage guide') and c.code='pilgrimage') or
    (lower(p.category) like 'other' and c.code='other')
  );

update providers p set sampradaya_code = s.code
from sampradayas s
where p.sampradaya is not null
  and lower(p.sampradaya) in ('madhwa','smarta','vaishnava','shaivite','other')
  and s.code = lower(p.sampradaya);

-- NOTE: Keep legacy text columns for now to preserve API/UI compatibility.
-- A future migration can remove providers.category and providers.sampradaya
-- after the frontend is updated to use the *_code columns.

-- ============================================================================
-- 4) RLS policies for taxonomy tables
-- ============================================================================
alter table categories enable row level security;
alter table sampradayas enable row level security;

-- Public read
create policy if not exists categories_public_read on categories for select using (true);
create policy if not exists sampradayas_public_read on sampradayas for select using (true);

-- Admin full access
create policy if not exists categories_admin_all on categories for all
  using (exists (select 1 from admins a where a.user_email = auth.jwt() ->> 'email'))
  with check (exists (select 1 from admins a where a.user_email = auth.jwt() ->> 'email'));

create policy if not exists sampradayas_admin_all on sampradayas for all
  using (exists (select 1 from admins a where a.user_email = auth.jwt() ->> 'email'))
  with check (exists (select 1 from admins a where a.user_email = auth.jwt() ->> 'email'));

-- ============================================================================
-- 5) Optional: enforce providers to use codes going forward (soft enforcement)
-- ============================================================================
-- You can choose to enforce that when category_code/sampradaya_code is set,
-- it must reference an active taxonomy entry.
-- The FK already ensures reference integrity; active status is a business rule
-- and can be enforced in the application or via a deferred trigger if needed.

comment on column providers.category_code is 'Normalized category reference (FK to categories.code)';
comment on column providers.sampradaya_code is 'Normalized sampradaya reference (FK to sampradayas.code)';
