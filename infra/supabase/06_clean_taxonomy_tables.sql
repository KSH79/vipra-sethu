-- Migration: Create clean taxonomy tables (no backward compatibility needed)
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

comment on table categories is 'Service category taxonomy for providers';
comment on table sampradayas is 'Religious tradition taxonomy for providers';

create index if not exists idx_categories_active_order on categories(active, sort_order);
create index if not exists idx_sampradayas_active_order on sampradayas(active, sort_order);

-- ============================================================================
-- 2) Seed initial values
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
-- 3) Replace legacy text columns with FK columns
-- ============================================================================
-- First, if the old columns exist, migrate data then drop them
do $$
begin
  -- Add new FK columns if they don't exist
  if not exists (select 1 from information_schema.columns where table_name = 'providers' and column_name = 'category_code') then
    alter table providers add column category_code text references categories(code);
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'providers' and column_name = 'sampradaya_code') then
    alter table providers add column sampradaya_code text references sampradayas(code);
  end if;
  
  -- Migrate data if old columns exist
  if exists (select 1 from information_schema.columns where table_name = 'providers' and column_name = 'category') then
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
    
    -- Drop old category column
    alter table providers drop column category;
  end if;
  
  if exists (select 1 from information_schema.columns where table_name = 'providers' and column_name = 'sampradaya') then
    update providers p set sampradaya_code = s.code
    from sampradayas s
    where p.sampradaya is not null
      and lower(p.sampradaya) in ('madhwa','smarta','vaishnava','shaivite','other')
      and s.code = lower(p.sampradaya);
    
    -- Drop old sampradaya column
    alter table providers drop column sampradaya;
  end if;
end $$;

-- Make category_code NOT NULL since it's required
alter table providers alter column category_code set not null;

-- Add indexes for performance
create index if not exists idx_providers_category_code on providers(category_code);
create index if not exists idx_providers_sampradaya_code on providers(sampradaya_code);

-- ============================================================================
-- 4) RLS policies for taxonomy tables
-- ============================================================================
alter table categories enable row level security;
alter table sampradayas enable row level security;

-- Public read
create policy categories_public_read on categories for select using (true);
create policy sampradayas_public_read on sampradayas for select using (true);

-- Admin full access
create policy categories_admin_all on categories for all
  using (exists (select 1 from admins a where a.user_email = auth.jwt() ->> 'email'))
  with check (exists (select 1 from admins a where a.user_email = auth.jwt() ->> 'email'));

create policy sampradayas_admin_all on sampradayas for all
  using (exists (select 1 from admins a where a.user_email = auth.jwt() ->> 'email'))
  with check (exists (select 1 from admins a where a.user_email = auth.jwt() ->> 'email'));

comment on column providers.category_code is 'Normalized category reference (FK to categories.code)';
comment on column providers.sampradaya_code is 'Normalized sampradaya reference (FK to sampradayas.code)';
