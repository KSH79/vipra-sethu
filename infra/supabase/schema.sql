
create extension if not exists pg_trgm;
create extension if not exists postgis;
create table if not exists providers(
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  phone text not null,
  whatsapp text,
  category text not null,
  languages text[],
  sampradaya text,
  photo_url text,
  status text default 'pending_review',
  location geography(point,4326),
  created_at timestamp default now()
);
create table if not exists admin_actions(
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references providers(id) on delete cascade,
  actor_id uuid,
  type text,
  notes text,
  at timestamp default now()
);
create table if not exists admins(user_email text primary key);
create index if not exists idx_providers_name_trgm on providers using gin(name gin_trgm_ops);
create index if not exists idx_providers_languages on providers using gin(languages);
create index if not exists idx_providers_geo on providers using gist(location);
