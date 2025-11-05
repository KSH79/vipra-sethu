-- Migration: Fix recursive admins policy causing RPC 500s
-- Context:
--   Postgres logs showed: "infinite recursion detected in policy for relation 'admins'".
--   The prior policy on admins used an EXISTS subquery referencing the admins table
--   itself, which is evaluated during policy checks and leads to recursion.
-- Change:
--   Replace the recursive policy with a non-recursive self-filter using JWT email.
-- Impact:
--   Unblocks RPCs and direct table reads that perform admin checks via policies.
--   Safer and simpler: a user can read only their own admins row.

BEGIN;

DROP POLICY IF EXISTS admins_read ON public.admins;
DROP POLICY IF EXISTS admins_self_read ON public.admins;

CREATE POLICY admins_self_read ON public.admins
FOR SELECT
TO public
USING (user_email = (auth.jwt() ->> 'email'));

COMMIT;
