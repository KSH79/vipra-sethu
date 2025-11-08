-- provider_photos table for original and thumbnail paths
-- Up/forward migration

create table if not exists public.provider_photos (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  original_path text not null,
  thumbnail_path text,
  mime_type text,
  size_bytes int,
  width int,
  height int,
  created_at timestamptz not null default now()
);

create index if not exists idx_provider_photos_provider_id on public.provider_photos(provider_id);

-- Enable RLS
alter table public.provider_photos enable row level security;

-- Policies
-- Read access controlled via signed URLs from Storage; no anonymous selects needed.
-- Allow admins full access
create policy if not exists provider_photos_admin_all on public.provider_photos
  for all to authenticated using (
    exists (
      select 1 from public.admins a where a.user_email = (auth.jwt() ->> 'email')
    )
  );

-- Providers can insert their own photo metadata; match on phone/email if such linkage exists later.
-- For now, limit insert to authenticated users only; app enforces association on server side.
create policy if not exists provider_photos_insert_authenticated on public.provider_photos
  for insert to authenticated with check (true);

-- Optional: owners can select their own records (if needed by app); keep restricted for now
-- create policy provider_photos_select_self on public.provider_photos for select to authenticated using (provider_id = provider_id);

-- Down migration (optional)
-- drop table if exists public.provider_photos;
