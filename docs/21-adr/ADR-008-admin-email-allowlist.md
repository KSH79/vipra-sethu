# ADR-008: Email Allowlist for Admin Access

**Status:** Accepted  
**Date:** 08-Nov-2025
**Deciders:** Development Team

---

## Context

Need to control who can access the admin dashboard. Must be secure but simple to manage for small team.

---

## Decision

Use simple email allowlist in `admins` table instead of complex RBAC or SSO.

---

## Rationale

**Why email allowlist:**
- **Simple** - Just add email to table, no complex setup
- **Secure** - Combined with RLS, enforced at database level
- **Easy to audit** - SELECT * FROM admins shows all admins
- **No vendor lock-in** - Not tied to specific SSO provider
- **Works with magic links** - No separate admin login flow

**Why not RBAC:** Over-engineering for small team  
**Why not SSO:** Complex setup, vendor lock-in  
**Why not hardcoded list:** Can't change without code deploy

---

## Consequences

**Positive:**
- Zero setup complexity
- Easy to add/remove admins (database insert/delete)
- Works with existing auth (magic links + MFA)
- Clear audit trail

**Negative:**
- No role hierarchy (all admins have same permissions)
- Must manually add each admin
- No self-service admin registration

---

## Implementation

**admins table:**
```sql
CREATE TABLE admins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);
```

**Check if user is admin:**
```sql
CREATE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins
    WHERE email = auth.email()
  );
$$ LANGUAGE SQL SECURITY DEFINER;
```

**RLS policy:**
```sql
CREATE POLICY "Admins only"
  ON providers FOR ALL
  USING (is_admin());
```

---

## Future Enhancements

If team grows beyond 10 admins, consider:
- Role-based permissions (super_admin, moderator, viewer)
- SSO integration (Google Workspace, Okta)
- Admin invitation flow with email confirmation

---

## Related Decisions

- [ADR-001: RLS Security](./ADR-001-rls-security-model.md) - Admin checks via RLS
- [ADR-003: Magic Link Auth](./ADR-003-magic-link-auth.md) - Admins use same auth

---

## References

- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
