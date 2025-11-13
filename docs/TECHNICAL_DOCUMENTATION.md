# Vipra Sethu — Technical Documentation

Last updated: 2025-11-12

## 0. Pages (relative to Home "/")
- **/** — Home
- **/about** — About page
- **/login** — Login (magic link)
- **/providers** — Provider listing
- **/providers/[id]** — Provider profile detail
- **/providers/debug** — Debug page
- **/onboard** — Provider onboarding (multi-step)
- **/admin** — Admin dashboard
- **/admin/master-data** — Admin master-data index
- **/admin/master-data/categories** — Manage categories
- **/admin/master-data/sampradayas** — Manage sampradayas
- **/admin/master-data/experience-levels** — Manage experience levels
- **/admin/master-data/languages** — Manage languages
- **/admin/master-data/mapping** — Mappings page
- **/admin/master-data/service-radius** — Manage service radius presets
- **/admin/master-data/terms** — Terms list
- **/admin/master-data/experience-levels/[id]** — Experience level detail
- **/admin/master-data/languages/[code]** — Language detail
- **/admin/master-data/sampradayas/[code]** — Sampradaya detail
- **/admin/master-data/service-radius/[id]** — Service radius detail
- **/admin/mfa-setup** — Admin MFA setup
- **/admin/mfa-verify** — Admin MFA verify
- **/auth/callback** — Auth callback handler
- **/auth/logout** — Logout handler
- **/api/auth/check-email** — Server-side check if a user exists by email (uses Supabase service role; returns { exists })
- **/test-analytics** — Analytics test page
- **/test-sentry** — Sentry test page
- **/_not-found** — 404 page

API routes (App Router):
- **/api/admin/providers** — Admin list providers (query: status, page, pageSize, category, search, locale)
- **/api/admin/providers/[id]** — Admin provider detail
- **/api/admin/metrics** — Admin metrics (pendingCount, approvedThisMonth, avgReviewHours)
- **/api/admin/categories** — Localized categories (query: locale)
- **/api/providers/search** — Public search
- **/api/providers/[id]** — Public provider detail
- **/api/onboard** — Onboarding (submit/update)
- **/api/master-data/*** — Public master data
- **/api/test-sentry-error** — Sentry error test

Note: /api/providers/search uses request.url and is dynamic during build (Next.js warns during SSG), but functions as on-demand server-rendered route at runtime.

---

## 3.1 Update (2025-11-12)

- DailyShloka i18n
  - Switched component to use `landing` namespace for keys like `dailyInspirationTitle` and `share`.
  - Added missing Kannada `landing` keys so localized strings render correctly.

- Auth modal flows (Supabase email)
  - Single component supports two distinct journeys:
    - Signup: uses `auth.signInWithOtp` with `shouldCreateUser = true`.
    - Signin: uses `auth.signInWithOtp` with `shouldCreateUser = false`.
  - Non-enumerating UX: success screen and copy do not reveal whether an email is registered.
  - Panel variant retained (`variant="panelRight"`).

- Profile completion flow
  - Server action `updateProfile` now uses a Supabase Admin client to `upsert` into `profiles` with `onConflict: 'id'` to avoid RLS policy recursion.
  - After saving, it calls `revalidatePath('/')`, `/home`, and `/complete-profile` to prevent stale UI.
  - It supports an optional `redirectTo` parameter for server-side navigation; the client additionally forces a full page reload to `/home` as a fallback.
  - Middleware logs onboarding gate decisions for troubleshooting.

---

## 1. Database Schema (Supabase)
This section reflects observed usage from application code and APIs. Where exact DDL is not in-repo, types are inferred based on usage. Use Supabase Dashboard to confirm/adjust.

### 1.1 auth.users (Supabase-managed)
- Primary key: id (uuid)
- Standard Supabase columns (email, created_at, etc.)

### 1.2 profiles
- Columns
  - id (uuid, PK, references auth.users.id)
  - full_name (text)
  - preferred_language (text, e.g., 'en' | 'kn')
  - is_admin (boolean, default false)
  - created_at (timestamptz)
  - updated_at (timestamptz)
- Primary key
  - id
- Foreign keys
  - id → auth.users.id
- Indexes
  - idx_profiles_is_admin (is_admin)
- RLS (inferred)
  - Users can select/update their own profile (auth.uid() = id)
  - Admins can manage all

### 1.3 providers
- Columns (observed from APIs/UI)
  - id (uuid, PK)
  - user_id (uuid, FK → auth.users.id) — optional if providers are user-owned
  - name (text)
  - category_code (text) — FK → categories.code
  - sampradaya_code (text) — FK → sampradayas.code
  - phone (text)
  - email (text)
  - location_text (text)
  - years_experience (int)
  - about (text)
  - languages (text[]) — array of language codes or names
  - status (text) — 'pending' | 'pending_review' | 'approved' | 'rejected'
  - rejection_reason (text)
  - service_radius_km (int)
  - availability_notes (text)
  - travel_notes (text)
  - expectations (text[])
  - response_time_hours (int)
  - profile_photo_url (text)
  - photo_url (text)
  - created_at (timestamptz)
  - approved_at (timestamptz)
- Primary key
  - id
- Foreign keys
  - category_code → categories.code
  - sampradaya_code → sampradayas.code
  - user_id → auth.users.id (if present)
- Indexes
  - idx_providers_status (status)
  - idx_providers_category (category_code)
  - idx_providers_sampradaya (sampradaya_code)
  - idx_providers_created_at (created_at)
- RLS (inferred)
  - Anonymous/public can read approved providers
  - Owners and admins can read their own (pending/approved) records
  - Admins can update status, rejection_reason, approved_at

### 1.4 categories
- Columns
  - code (text, PK)
  - name (text)
  - name_translations (jsonb: { en?: string, kn?: string, ... })
  - created_at (timestamptz)
- Primary key: code
- Indexes
  - none required beyond PK
- RLS
  - Public read; Admin write

### 1.5 sampradayas
- Columns
  - code (text, PK)
  - name (text)
  - name_translations (jsonb)
  - created_at (timestamptz)
- RLS
  - Public read; Admin write

### 1.6 experience_levels
- Columns
  - id (int/bigint, PK)
  - name (text)
  - name_translations (jsonb)

### 1.7 service_radius
- Columns
  - id (int/bigint, PK)
  - km (int)
  - label (text)
  - label_translations (jsonb)

### 1.8 languages (master)
- Columns
  - code (text, PK)
  - name (text)
  - name_translations (jsonb)

### 1.9 reviews (potential/future)
- Suggested Columns
  - id (uuid, PK)
  - provider_id (uuid, FK → providers.id)
  - reviewer_user_id (uuid, FK → auth.users.id)
  - rating (int)
  - comment (text)
  - created_at (timestamptz)
- RLS
  - Public read on approved; writers are authenticated

### 1.10 bookings / appointments (potential/future)
- Suggested Columns
  - id (uuid, PK)
  - provider_id (uuid, FK)
  - user_id (uuid, FK)
  - start_at, end_at (timestamptz)
  - status (text)
  - notes (text)

### 1.11 notifications (potential/future)
- Suggested Columns
  - id (uuid, PK)
  - user_id (uuid, FK)
  - type (text)
  - payload (jsonb)
  - read_at (timestamptz)
  - created_at (timestamptz)

Sample provider JSON (as returned by Admin APIs):
```json
{
  "id": "uuid",
  "name": "Sharma",
  "category_code": "purohit",
  "sampradaya_code": "smartha",
  "phone": "+91...",
  "email": "...",
  "location_text": "Bengaluru",
  "years_experience": 12,
  "languages": ["kn", "en"],
  "about": "",
  "status": "pending_review",
  "created_at": "2025-11-10T08:12:34Z",
  "approved_at": null
}
```

---

## 2. Codebase Structure

Monorepo-like layout:
- apps/web — Next.js 14 (App Router)
- supabase/config.toml — Local dev Supabase CLI config
- docs — Project docs

Key directories under apps/web:
- app — Next App Router pages and API routes
  - admin, providers, onboard, login, auth, test-* folders
  - api — route handlers
- components — UI and feature components
  - navigation/TopNav, ui/* (Button, Badge, Drawer, EmptyState, step-form, etc.)
  - LanguageSelector
- lib — Utilities
  - analytics (PostHog provider), storage.ts, i18n/actions.ts
- messages — i18n message catalogs (en.json, kn.json)
- middleware.ts — Auth/session and admin protection

### Key Implementation Details
- **Authentication flow**
  - Supabase Auth (magic link). Login page constructs emailRedirectTo using window.location.origin. Auth callback validates same-origin redirect and finalizes session.
  - Middleware guards admin routes; redirects via new URL('/login', req.url) etc. (origin-safe).
  - Signup UX: Before sending magic link, client calls `/api/auth/check-email`.
    - If exists → show `accountExists` message and do not send email.
    - If not exists → send magic link with `shouldCreateUser = true`.
  - Signin UX: Always uses `shouldCreateUser = false` and neutral success copy (non-enumerating).

- **API route structure**
  - Admin APIs: /api/admin/providers, /api/admin/providers/[id], /api/admin/categories, /api/admin/metrics
  - Public APIs: /api/providers/*, /api/master-data/*
  - Use request-derived locale for localization in APIs (e.g., categories)

- **Component patterns**
  - Client components for interactive pages ("use client").
  - Functional components with hooks (useEffect, useState, useTransition).
  - Reusable UI primitives in components/ui.

- **State management**
  - React local state and hooks. No global state lib. Server endpoints handle pagination and filtering; client manages search/category/page parameters.

- **Form handling**
  - Onboarding uses react-hook-form + zod (observed). Multi-step UI via components/ui/step-form.tsx.

- **UI library**
  - shadcn/ui-style primitives (Button, Badge, Drawer, etc. in components/ui) with TailwindCSS.

- **Internationalization (next-intl)**
  - Cookie-based locale. Root layout reads cookies().get('locale') and loads messages/en.json or messages/kn.json accordingly.
  - NextIntlClientProvider receives locale and messages; <html lang> is set.
  - LanguageSelector calls a server action setUserLocale to set the cookie, then reloads.
  - Admin APIs can accept locale to localize taxonomy names.

- **Analytics/Monitoring**
  - PostHog provider and @vercel/analytics/react.
  - Sentry client/server/edge configs imported at layout level.

---

## 3. Current Features Implemented
- [x] User login via magic link (Supabase)
- [x] Provider listings (public)
- [x] Search/filtering (public + admin filtering)
- [x] Provider profiles (public detail)
- [ ] Booking system
- [ ] Reviews/ratings
- [x] Admin dashboard (pending/approved/rejected tabs, filters, metrics)
- [ ] User dashboard (not observed)
- [ ] Notifications (not observed)
- [x] Multi-language support (English/Kannada) via next-intl
- [ ] Payments (not observed)
- [x] Onboarding multi-step flow
- [x] Master data management pages (admin)

Notes:
- Admin Approve button limited to pending/pending_review.
- Admin Drawer shows provider details and localized badges.

---

## 4. Feature Status & Technical Debt

- **Partially implemented**
  - Public search API exists but flagged as dynamic during SSG; fine at runtime.
  - Profiles table usage inferred; consolidate role/permissions strategy (admin flag) if not finalized.

- **Known issues**
  - Build warning: /api/providers/search uses request.url; Next flags as dynamic during SSG. Acceptable or refactor to dynamic = 'force-dynamic'.
  - Locale cookie: server action sets long-lived cookie; consider session-only if desired.

- **Performance**
  - Admin list is server-paginated; OK. Ensure indexes on providers.status/created_at.
  - Image handling via signed URLs; confirm caching headers.

- **Security**
  - Avoid using session user from getSession() unchecked; prefer supabase.auth.getUser() (warning seen during dev).
  - Middleware protects /admin. Validate RLS for providers (approved vs private records).
  - auth/callback validates same-origin redirects.

- **Refactoring areas**
  - Centralize taxonomy localization (categories/sampradayas) to avoid duplicate fallback maps.
  - Consolidate message keys and remove duplicates.
  - Extract Admin list row and Drawer into smaller components.

---

## 5. Deployment & Infrastructure

- **Hosting**
  - Vercel for apps/web. No hardcoded localhost in runtime; origins derived from request.url.

- **Environment variables**
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY (server-only)
  - SENTRY_* (if configured)
  - POSTHOG_* (if configured)

- **Supabase**
  - supabase/config.toml for local dev (localhost URLs). Production URLs set in Supabase Dashboard.

- **CI/CD**
  - GitHub + Vercel automatic builds on push. Recommendation (followed in practice): always run pnpm build locally before pushing.

- **Monitoring/Logging**
  - Vercel Analytics + PostHog + Sentry instrumentation.

- **Migrations**
  - SQL migrations not present in-repo. Manage via Supabase Dashboard or bring migrations into version control in a future iteration.

---

## Key Code Patterns

- **Locale-aware layout**
```tsx
// apps/web/app/layout.tsx (excerpt)
const cookieLocale = cookies().get('locale')?.value ?? 'en'
const locale = cookieLocale === 'kn' ? 'kn' : 'en'
const messages = (await import(`@/messages/${locale}.json`)).default

<html lang={locale}>
  <NextIntlClientProvider locale={locale} messages={messages}>
    {/* app */}
  </NextIntlClientProvider>
</html>
```

- **Approve button visibility**
```tsx
{(['pending','pending_review'].includes(provider.status)) && (
  <form onSubmit={(e)=>{e.preventDefault(); handleApprove(provider.id)}}>
    <Button type="submit" className="bg-green-700 text-white">Approve</Button>
  </form>
)}
```

- **Localized taxonomy badge with fallbacks**
```tsx
<Badge variant="default">
  { (isKn ? mapCatKn(provider.category_code) : undefined)
    || provider.category_name
    || (typeof provider.category === 'object' ? provider.category?.name : provider.category)
    || (categories.find(c=>c.code===provider.category_code)?.name)
    || provider.category_code }
</Badge>
```

- **Auth redirect safety**
```ts
// apps/web/app/auth/callback/route.ts (concept)
const { origin } = new URL(request.url)
const next = searchParams.get('next') || '/'
const nextUrl = new URL(next, origin)
if (nextUrl.origin !== origin) return NextResponse.redirect(origin)
```

---

If you need deeper DB parity (exact DDL, RLS), I can export from Supabase or add typed generated clients to reflect exact schema.
