-- Ensure the bucket exists and is private
insert into storage.buckets (id, name, public)
values ('provider-photos', 'provider-photos', false)
on conflict (id) do nothing;

-- 1) Authenticated users can UPLOAD (INSERT) to this bucket
create policy "auth upload to provider-photos v2"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'provider-photos');

-- 2) Only ADMINS can UPDATE objects (based on your public.admins table & email in JWT)
create policy "admin update provider-photos v2"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'provider-photos'
  and exists (
    select 1
    from public.admins a
    where a.user_email = auth.jwt() ->> 'email'
  )
)
with check (
  bucket_id = 'provider-photos'
  and exists (
    select 1
    from public.admins a
    where a.user_email = auth.jwt() ->> 'email'
  )
);

-- 3) Only ADMINS can DELETE objects
create policy "admin delete provider-photos v2"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'provider-photos'
  and exists (
    select 1
    from public.admins a
    where a.user_email = auth.jwt() ->> 'email'
  )
);

-- 4) Allow READs (select) so signed URLs work for anyone who has them
-- (Signed URLs validate independently; this policy just scopes to the bucket.)
create policy "signed-url read provider-photos v2"
on storage.objects
for select
using (bucket_id = 'provider-photos');
