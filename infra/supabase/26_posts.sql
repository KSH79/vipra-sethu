-- Community Posts schema, RLS, and seed data
-- Run in Supabase SQL editor or via CLI. Idempotent where possible.

-- Ensure pgcrypto for gen_random_uuid
create extension if not exists pgcrypto;

-- Table: posts
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),

  -- Core fields
  type text not null check (type in ('event','announcement','obituary','resource','request','temple')),
  title text not null,
  body text not null,

  -- Metadata
  tags text[] default '{}'::text[],
  languages text[] default '{}'::text[],
  location text,

  -- Temporal
  starts_at timestamptz,
  ends_at timestamptz,

  -- Rich content
  links text[] default '{}'::text[],
  media jsonb default '[]'::jsonb, -- [{type:'image'|'video', url, caption?}]

  -- Type-specific
  meta jsonb default '{}'::jsonb,

  -- Workflow
  created_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft','pending','approved','published','rejected')),
  rejection_reason text,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,

  -- Housekeeping
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_posts_type on posts(type);
create index if not exists idx_posts_status on posts(status);
create index if not exists idx_posts_created_by on posts(created_by);
create index if not exists idx_posts_created_at on posts(created_at desc);
create index if not exists idx_posts_starts_at on posts(starts_at) where starts_at is not null;
create index if not exists idx_posts_type_status on posts(type, status);
create index if not exists idx_posts_tags on posts using gin(tags);
create index if not exists idx_posts_languages on posts using gin(languages);
create index if not exists idx_posts_published on posts(type, created_at desc) where status = 'published';

-- updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_posts_updated_at on posts;
create trigger update_posts_updated_at
  before update on posts
  for each row execute function update_updated_at_column();

-- Profiles table uses a single role column: 'reader' | 'editor' | 'admin'

-- RLS
alter table posts enable row level security;

-- Public can read published
drop policy if exists "Public can view published posts" on posts;
create policy "Public can view published posts"
  on posts for select
  using (status = 'published');

-- Authors can read their own
drop policy if exists "Authors can view own posts" on posts;
create policy "Authors can view own posts"
  on posts for select
  using (auth.uid() = created_by);

-- Editors can create
drop policy if exists "Editors can create posts" on posts;
create policy "Editors can create posts"
  on posts for insert
  with check (
    auth.uid() = created_by and
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('editor','admin')
    )
  );

-- Authors can update own drafts/pending
drop policy if exists "Authors can update own posts" on posts;
create policy "Authors can update own posts"
  on posts for update
  using (
    auth.uid() = created_by and
    status in ('draft','pending')
  );

-- Authors can delete own drafts
drop policy if exists "Authors can delete own drafts" on posts;
create policy "Authors can delete own drafts"
  on posts for delete
  using (
    auth.uid() = created_by and
    status = 'draft'
  );

-- Admins can view all
drop policy if exists "Admins can view all posts" on posts;
create policy "Admins can view all posts"
  on posts for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- Admins can update all
drop policy if exists "Admins can update all posts" on posts;
create policy "Admins can update all posts"
  on posts for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- Admins can delete any
drop policy if exists "Admins can delete any post" on posts;
create policy "Admins can delete any post"
  on posts for delete
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- Seed sample posts (safe guards to avoid duplicate titles on repeated runs)
-- Choose an arbitrary user as author (replace in prod)
with author as (
  select id from auth.users order by created_at asc limit 1
)
insert into posts (type, title, body, starts_at, ends_at, languages, tags, meta, created_by, status)
select 'event',
  'Satyanarayana Puja at Pete Venkataramana Temple',
  'Join us for the monthly Satyanarayana Puja at Pete Venkataramana Temple. All community members are welcome. Prasadam will be served after the puja.',
  timestamp with time zone '2025-11-17 10:00:00+00',
  timestamp with time zone '2025-11-17 13:00:00+00',
  array['en','kn']::text[],
  array['puja','temple','satyanarayana','koteshwara']::text[],
  '{"venue": "Pete Venkataramana Temple, Koteshwara", "organizer_name": "Temple Committee", "organizer_phone": "+919876543210", "rsvp_method": "call", "ritual_context": "Monthly Satyanarayana Vratam"}'::jsonb,
  author.id,
  'published'
from author
where not exists (select 1 from posts where title = 'Satyanarayana Puja at Pete Venkataramana Temple');

with author as (
  select id from auth.users order by created_at asc limit 1
)
insert into posts (type, title, body, languages, tags, meta, created_by, status)
select 'announcement',
  'Birth Announcement - Baby Boy',
  'We are blessed with a baby boy on November 10, 2025. Namakarana ceremony will be held on November 24th. All are invited.',
  array['en','kn']::text[],
  array['birth','namakarana','celebration']::text[],
  '{"announcement_type": "birth", "contact": "Sharma Family, +919876543211"}'::jsonb,
  author.id,
  'published'
from author
where not exists (select 1 from posts where title = 'Birth Announcement - Baby Boy');

with author as (
  select id from auth.users order by created_at asc limit 1
)
insert into posts (type, title, body, starts_at, languages, tags, meta, created_by, status)
select 'obituary',
  'Remembering Sri Ramachandra Bhat',
  'With profound grief, we inform the passing of our beloved Sri Ramachandra Bhat on November 9, 2025. Vaikuntha Samaradhane will be held on November 12th.',
  timestamp with time zone '2025-11-12 08:00:00+00',
  array['en','kn']::text[],
  array['obituary','vaikuntha-samaradhane']::text[],
  '{"full_name": "Sri Ramachandra Bhat", "age": 78, "date_of_passing": "2025-11-09", "rites_schedule": "Vaikuntha Samaradhane on Nov 12, 8:00 AM at residence", "family_contacts": [{"name": "Son: Suresh Bhat", "phone": "+919876543212", "masked": true}], "consent_given": true}'::jsonb,
  author.id,
  'published'
from author
where not exists (select 1 from posts where title = 'Remembering Sri Ramachandra Bhat');
