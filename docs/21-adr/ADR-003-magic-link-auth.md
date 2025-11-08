# ADR-003: Magic Link Authentication

**Status:** Accepted  
**Date:** 2025-11-08  
**Deciders:** Development Team

---

## Context

Users need to authenticate to onboard as providers and admins need secure access to the dashboard. Traditional authentication uses passwords, but this creates UX and security challenges:
- Users forget passwords
- Weak passwords are security risks
- Password resets add complexity
- Password storage requires careful handling

---

## Decision

Use magic link (passwordless) authentication via Supabase Auth instead of traditional password-based login.

---

## Rationale

**Why magic links:**
- **Better UX** - No passwords to remember or type
- **More secure** - No password database to breach
- **Simpler** - No password reset flow needed
- **Mobile-friendly** - Easy to click link from email
- **Built-in** - Supabase provides out-of-the-box

**Why not passwords:**
- Users forget them (support burden)
- Weak passwords are common
- Must implement password reset
- Must hash and store securely
- Vulnerable to credential stuffing

---

## Consequences

**Positive:**
- Zero password management overhead
- Better security (no password database)
- Simpler user experience
- Less code to write and maintain
- Works great on mobile devices

**Negative:**
- Requires email access (can't login without email)
- Slightly slower (must check email)
- Email deliverability issues can block login
- Users unfamiliar with concept may be confused

**Neutral:**
- Must configure email provider (Supabase handles this)
- Link expiration must be reasonable (default: 1 hour)

---

## Implementation

### User Flow

1. User enters email on login page
2. Supabase sends magic link to email
3. User clicks link in email
4. Supabase validates link and creates session
5. User redirected to app (authenticated)

### Code Example

```typescript
// Send magic link
const { error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: 'https://vipra-sethu.com/auth/callback'
  }
});

// Handle callback (automatic via Supabase)
// Session created and stored in cookies
```

### Security Considerations

- Links expire after 1 hour (configurable)
- One-time use only (can't reuse link)
- HTTPS required (prevents link interception)
- Rate limiting on email sends (prevents spam)

---

## Alternatives Considered

### 1. Password Authentication

**Pros:**
- Familiar to all users
- Works offline (after initial login)
- No email dependency

**Cons:**
- Users forget passwords
- Must implement password reset
- Security risks (weak passwords, breaches)
- More code to maintain

**Why rejected:** Poor UX, security risks

### 2. Social OAuth (Google, Facebook)

**Pros:**
- One-click login
- No password management
- Familiar to users

**Cons:**
- Privacy concerns (tracking)
- Requires multiple provider integrations
- Users without social accounts excluded
- Vendor lock-in

**Why rejected:** Privacy concerns, complexity

### 3. SMS OTP

**Pros:**
- Fast (no email check needed)
- Works for users without email
- Familiar pattern

**Cons:**
- Costs money per SMS
- Phone number required (privacy concern)
- Doesn't work internationally well
- SMS can be intercepted

**Why rejected:** Cost, privacy, reliability

---

## Related Decisions

- [ADR-004: Supabase as Backend](./ADR-004-supabase-backend.md) - Provides magic link auth
- [ADR-008: Email Allowlist for Admins](./ADR-008-admin-email-allowlist.md) - Admins also use magic links + MFA

---

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Magic Links Explained](https://auth0.com/blog/magic-links/)
- [Passwordless Authentication](https://www.w3.org/TR/webauthn/)
