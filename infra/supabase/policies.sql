
alter table providers enable row level security;
alter table admin_actions enable row level security;
alter table admins enable row level security;
create policy providers_public_read on providers for select using (status='approved');
create policy providers_self_rw on providers for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy providers_admin_all on providers for all using (exists(select 1 from admins a where a.user_email = auth.jwt() ->> 'email')) with check (exists(select 1 from admins a where a.user_email = auth.jwt() ->> 'email'));
create policy admin_actions_admin on admin_actions for all using (exists(select 1 from admins a where a.user_email = auth.jwt() ->> 'email')) with check (exists(select 1 from admins a where a.user_email = auth.jwt() ->> 'email'));
-- NOTE: Do NOT reference the admins table from within its own policy to avoid recursion.
-- This policy allows a user to read only their own admins row based on JWT email.
create policy admins_self_read on admins for select using (user_email = (auth.jwt() ->> 'email'));
