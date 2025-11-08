# ADR-001: Row Level Security for Authorization

**Status:** Accepted  
**Date:** 2025-11-08  
**Deciders:** Development Team

---

## Context

We need to control who can read, create, update, and delete data in our application. Traditional approaches include:
- Application-level authorization (check permissions in API code)
- Middleware authorization (check before reaching database)
- Database-level authorization (Row Level Security)

The application handles sensitive data (provider information, admin actions) that must be protected from unauthorized access.

---

## Decision

Use Supabase Row Level Security (RLS) as the primary authorization mechanism instead of application-level checks.

---

## Rationale

**Why RLS:**
- **Security by default** - Even if application code has bugs, database enforces rules
- **Simpler code** - No need to add authorization checks in every API endpoint
- **Consistent** - Same rules apply regardless of how data is accessed (API, SQL, dashboard)
- **Performance** - Database can optimize queries with security rules built-in
- **Audit-friendly** - Policies are declarative and easy to review

**Why not application-level:**
- Requires checking permissions in every endpoint (easy to forget)
- Bugs in application code can bypass security
- Harder to audit (logic scattered across codebase)
- Must maintain separate authorization layer

---

## Consequences

**Positive:**
- Security enforced at database level (defense in depth)
- Less application code to write and maintain
- Policies are declarative and version-controlled
- Works with Supabase client SDK automatically
- Can use service role key to bypass RLS when needed (admin operations)

**Negative:**
- Learning curve for developers unfamiliar with RLS
- Debugging can be harder (need to check both app and database)
- Complex policies can impact query performance
- Limited to PostgreSQL (vendor lock-in)

**Neutral:**
- Must write SQL policies for each table
- Need to test policies thoroughly
- Documentation required for policy logic

---

## Implementation

### Key Policies

**Public read approved providers:**
```sql
CREATE POLICY "Public read approved"
  ON providers FOR SELECT
  USING (status = 'approved');
```

**Users insert own provider:**
```sql
CREATE POLICY "Users insert own"
  ON providers FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Admins read/update all:**
```sql
CREATE POLICY "Admins read all"
  ON providers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE email = auth.email()
    )
  );
```

### Testing Strategy

- Unit tests for each policy using different user roles
- Integration tests for complete user journeys
- Manual testing with different authentication states
- Security audit of all policies before production

---

## Alternatives Considered

### 1. Application-Level Authorization

**Pros:**
- More flexible (can use any logic)
- Easier to debug (all in application code)
- No database vendor lock-in

**Cons:**
- Must implement in every endpoint
- Easy to forget or make mistakes
- Security bugs in application code bypass protection
- More code to maintain

**Why rejected:** Less secure, more code to maintain

### 2. Middleware Authorization

**Pros:**
- Centralized authorization logic
- Applies to all routes automatically
- Can use complex business logic

**Cons:**
- Still application-level (can be bypassed)
- Doesn't protect direct database access
- Adds latency to every request

**Why rejected:** Doesn't provide database-level protection

### 3. Hybrid Approach (RLS + Application)

**Pros:**
- Defense in depth (two layers)
- Application can provide better error messages
- Can optimize for common cases

**Cons:**
- Duplicate logic (must maintain both)
- More complex to understand and debug
- Slower development

**Why rejected:** Over-engineering for current scale

---

## Related Decisions

- [ADR-004: Supabase as Backend](./ADR-004-supabase-backend.md) - Enables RLS usage
- [ADR-008: Email Allowlist for Admins](./ADR-008-admin-email-allowlist.md) - Uses RLS for admin checks

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
