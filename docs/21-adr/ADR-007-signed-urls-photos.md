# ADR-007: Signed URLs for Provider Photos

**Status:** Accepted  
**Date:** 2025-11-08  
**Deciders:** Development Team

---

## Context

Provider photos need to be stored and displayed. Must balance accessibility with privacy and security.

---

## Decision

Store photos in private Supabase Storage bucket and generate signed URLs with 15-minute expiry instead of using public bucket.

---

## Rationale

**Why private bucket + signed URLs:**
- **Privacy control** - Only approved providers' photos accessible
- **Revocable access** - Can disable access by not generating URLs
- **Prevents hotlinking** - Can't embed photos on other sites
- **Audit trail** - Know when photos are accessed
- **Flexible** - Can add watermarks or transformations later

**Why not public bucket:**
- Anyone can access any photo if they guess the URL
- Can't revoke access once uploaded
- Photos of pending/rejected providers would be public

---

## Consequences

**Positive:**
- Full control over photo access
- Can revoke access anytime
- Prevents unauthorized use
- Supports future features (watermarks, analytics)

**Negative:**
- Must generate URLs on-demand (slight performance cost)
- URLs expire (must regenerate for long sessions)
- More complex than public bucket

---

## Implementation

**Upload photo:**
```typescript
const { data, error } = await supabase.storage
  .from('provider-photos')  // Private bucket
  .upload(`${providerId}/${filename}`, file);
```

**Generate signed URL:**
```typescript
const { data } = await supabase.storage
  .from('provider-photos')
  .createSignedUrl(path, 900);  // 900 seconds = 15 minutes
```

**Storage policy:**
```sql
-- Only service role can generate signed URLs
CREATE POLICY "Service role only"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'provider-photos' AND auth.role() = 'service_role');
```

---

## Related Decisions

- [ADR-001: RLS Security](./ADR-001-rls-security-model.md) - Storage policies similar to RLS
- [ADR-004: Supabase Backend](./ADR-004-supabase-backend.md) - Provides storage

---

## References

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Signed URLs Explained](https://supabase.com/docs/guides/storage/serving/downloads#downloading-files)
