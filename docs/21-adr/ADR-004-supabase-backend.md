# ADR-004: Supabase as Backend

**Status:** Accepted  
**Date:** 2025-11-08  
**Deciders:** Development Team

---

## Context

Need a backend to handle authentication, database, storage, and APIs. Options include building custom backend or using Backend-as-a-Service (BaaS).

---

## Decision

Use Supabase as the complete backend platform instead of building custom API.

---

## Rationale

**Why Supabase:**
- **PostgreSQL** - Full-featured relational database (not limited NoSQL)
- **Built-in Auth** - Magic links, MFA, RLS ready to use
- **Storage** - File uploads with signed URLs
- **Real-time** - WebSocket subscriptions (future feature)
- **RPC Functions** - Write complex logic in SQL
- **Fast development** - No backend code to write

**Why not custom backend:**
- Weeks of development time
- Must maintain auth, storage, database layers
- More infrastructure to manage
- Slower iteration speed

---

## Consequences

**Positive:**
- 10x faster development (no backend code)
- PostgreSQL power (complex queries, transactions)
- Built-in security (RLS, auth)
- Generous free tier
- Auto-scaling infrastructure

**Negative:**
- Vendor lock-in (migration would be complex)
- Limited to PostgreSQL (can't use other databases)
- Must learn Supabase-specific patterns
- Some features require workarounds

---

## Alternatives Considered

**Custom Node.js/Express API:** More control, more work  
**Firebase:** Easier but NoSQL limitations  
**AWS Amplify:** More complex, steeper learning curve  
**Hasura:** GraphQL-only, less flexible

**Why Supabase won:** Best balance of power and simplicity

---

## Related Decisions

- [ADR-001: RLS Security](./ADR-001-rls-security-model.md)
- [ADR-003: Magic Link Auth](./ADR-003-magic-link-auth.md)
- [ADR-007: Signed URLs](./ADR-007-signed-urls-photos.md)

---

## References

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL vs NoSQL](https://www.postgresql.org/about/)
