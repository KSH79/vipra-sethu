# Development Roadmap

## Vipra Sethu development plan and task tracking

**Last Updated:** 10-Nov-2025 (Admin Dashboard + Onboarding i18n fixes)

---

## Milestone 4: Kannada Backend Ready

Goal: Backend returns translated data and Kannada content is populated. App remains English by default (language switching comes in Milestone 5).

### Phase 4A: Backend Translation Integration
**Branch:** `feature/i18n-backend-integration`

**Analysis Summary:**
- API structure (Next.js App Router):
  - Admin master data APIs under `apps/web/app/api/admin/master-data/*` (languages, service-radius, experience-levels, categories, sampradayas, mapping, terms)
  - Admin dashboard/helper APIs under `apps/web/app/api/admin/*` (categories, providers, providers/[id], metrics)
  - Public provider APIs under `apps/web/app/api/providers/*` (search, [id])
- Data fetching patterns:
  - Client pages call App Router APIs via `fetch` (e.g., providers listing, admin dashboard)
  - Some pages use service functions in `apps/web/lib/services/taxonomy.ts` for consolidated provider search/details
- Master data queries used by:
  - Providers listing and detail (category_name, sampradaya_name, etc.)
  - Admin dashboard filters and list badges
  - Admin master data CRUD pages
- Translation helpers (Milestone 2):
  - `apps/web/lib/translations/db-helpers.ts` (getTranslation, buildTranslation, updateTranslation, coverage helpers)
  - JSONB columns added for all master data tables; English backfilled under `en`

**Current State:**
- API endpoints (relevant):
  - Public: `/api/providers/search`, `/api/providers/[id]`
  - Admin: `/api/admin/providers`, `/api/admin/providers/[id]`, `/api/admin/categories`, `/api/admin/metrics`
  - Master data: `/api/admin/master-data/{languages,service-radius,experience-levels,categories,sampradayas,terms}`, mapping endpoints
- Data fetching patterns:
  - Client pages use `fetch` (Admin dashboard, Master Data managers)
  - Public pages use `lib/services/taxonomy.ts`
- Master data queries:
  - Category and sampradaya names displayed in Providers, Admin dashboard; terms pages retrieve content

**High-Level Tasks:**
- [x] Design locale flow end-to-end (request -> API -> query -> transformation -> response)
- [x] Add locale acceptance/validation to all master data APIs
- [x] Update master data CRUD APIs to read/write JSONB translations (use buildTranslation/updateTranslation)
- [x] Update public provider APIs to return translated category/sampradaya fields
- [x] Update admin provider APIs to return translated fields for badges/filters
- [x] Update `lib/services/taxonomy.ts` to accept `locale` and map translated fields with fallbacks
- [x] Create helper(s) for extracting/validating locale from Request (cookies/header/query), defaulting to `en`
- [x] Ensure English fallback when translation missing
- [ ] Add unit/integration tests for translation mapping and locale handling

**Files to Modify:**
- APIs: `apps/web/app/api/admin/master-data/**/*`, `apps/web/app/api/admin/{providers,providers/[id],categories,metrics}/route.ts`, `apps/web/app/api/providers/{search,[id]}/route.ts`
- Services: `apps/web/lib/services/taxonomy.ts`
- Helpers: `apps/web/lib/translations/db-helpers.ts` (if needed), `apps/web/lib/i18n/{config,request,constants}.ts` (locale utils)

**Testing Strategy:**
- Unit: translation helpers, locale extraction/validation, services mapping
- Integration: API endpoints with `?locale=en|kn`, invalid locale falls back to `en`
- E2E: providers listing/detail show translated master data; admin dashboard badges/filters translated
- Performance: verify JSONB lookups and joins remain fast (indexes from M2)

---

### Phase 4B: Kannada Translations - Content
**Branch:** `feature/kannada-translations`
**Note:** Can run in parallel with Phase 4A

**Analysis Summary:**
- UI strings: mirror `apps/web/messages/en.json` into `apps/web/messages/kn.json`
- Master data: ensure Kannada values for categories, sampradayas, experience levels, service radius, languages; terms content as available

**High-Level Tasks:**
- [x] Prepare export of `en.json` for translators; create `kn.json` skeleton
- [x] Populate DB JSONB Kannada fields (seed script with guards)
- [x] Load Kannada font (Noto Sans Kannada) and verify rendering/spacing
- [ ] Populate `kn.json` fully and review with native speakers
- [ ] Coverage scripts (UI + DB), missing key finder, export/import helpers — deferred to next milestone
- [ ] QA pass with native speakers; iterate

**Translation Requirements:**
- UI strings to translate: mirror count of `en.json` (current size in repo)
- Master data records: categories, sampradayas, languages, service radius, experience levels, terms (counts from DB)

**Testing Strategy:**
- Visual: temporarily force `kn` to validate rendering and layout
- Functional: search/filters/forms with Kannada values
- Coverage: report % translated in UI and DB; ensure fallbacks when missing

**Notes:**
- Seed script added: `infra/supabase/seed_kn_master_data.sql` (idempotent, guarded). Executed successfully.
- Coverage tooling deferred to next milestone per decision.

---

### Milestone 4 Completion Criteria:
- [x] All relevant APIs accept locale and return translated data with English fallback
- [x] Service functions accept locale and map translated fields consistently
- [x] Provider list/detail and Admin dashboard show translated master data when `locale=kn`
- [ ] `apps/web/messages/kn.json` complete and validated by native speakers (ongoing)
- [x] DB master data has Kannada translations populated (seed script executed)
- [x] Noto Sans Kannada loaded; Kannada renders correctly with no layout issues
- [ ] Unit/integration/E2E tests passing; performance acceptable (to be finalized)
- [x] Documentation updated (backend translation patterns, translation process/tools)

---

## Milestone 5: Full Multilingual Launch

### Phase 6: Language Selector & User Preference
**Branch:** `feature/language-selector-active`

**Analysis Summary:**
- The language selector exists and is wired to a server action that sets a `locale` cookie and updates `profiles.preferred_language` when authenticated. UI is basic and desktop-only (present in `TopNav`); mobile nav doesn’t render it.
- Server action `setUserLocale` currently sets a cookie; for this milestone we will make it a session-only cookie and remove profile updates.
- Locale detection for APIs: helper `getLocaleFromRequest` reads `?locale` then cookie, else default `en` (used in master-data/provider APIs). Good.
- App layout now reads `locale` cookie and passes it to `NextIntlClientProvider` and `<html lang>`. Footer translations respect locale.
- Middleware focuses on auth/admin; no explicit locale handling. No automatic cookie initialization when missing.

**Current State:**
- Language selector component: `apps/web/components/LanguageSelector.tsx`
  - Uses `useLocale()` from `next-intl`, calls `setUserLocale(locale)`, then reloads window.
  - Desktop dropdown in `TopNav`. Not included in mobile menu.
- User preference storage:
  - Cookie: `locale`
  - Database: `profiles.preferred_language` updated if authenticated
- Locale detection flow:
  - APIs: `lib/i18n/locale-server.ts` → query param > cookie > default
  - UI: `app/layout.tsx` sets `NextIntlClientProvider` with `locale="en"` and `html lang="en"` (needs fix)
  - `lib/i18n/config.ts` returns default locale; `lib/i18n/request.ts` exists but not wired into layout
- Backend translation support: Verified in Milestone 4A/4B and working via API locale parameter

**High-Level Tasks:**
- [x] Refactor i18n provider wiring in `app/layout.tsx`
  - Use `getLocale()` and `getMessages()` from `next-intl/server`
  - Set `<html lang={locale}>` and pass `locale={locale}` into `NextIntlClientProvider`
- [ ] Consolidate `lib/i18n/config.ts` and `lib/i18n/request.ts`
  - Implement `getUserLocale()` to read `cookies().get('locale')`; fallback to `defaultLocale`. No browser Accept-Language.
  - Ensure server-side message loading respects cookie.
- [ ] Adjust `setUserLocale`
  - Set session cookie (no `maxAge`) with `sameSite: 'lax'`, `path: '/'`; add `secure` in production
  - Remove profile update (no persistence beyond current browser session)
- [ ] Enhance LanguageSelector UX
  - Use `router.refresh()` instead of full reload
  - Add ARIA labels/data-testids, loading state, and include in mobile menu
  - Show English/Kannada labels with clear current selection
- [ ] Optional: Middleware default cookie not needed (default to English if missing)
- [ ] Add settings UI (optional)
  - Surface preferred language in a settings/profile page using same action
- [ ] Tests
  - Unit: `setUserLocale` validation and cookie behavior
  - Integration: API calls with locale and profile update path
  - E2E: language switching/persistence/anonymous vs authenticated flows
  - Visual regression: key pages in both languages

**Files to Modify:**
- `apps/web/app/layout.tsx`
- `apps/web/components/LanguageSelector.tsx`
- `apps/web/components/navigation/TopNav.tsx` (mobile placement)
- `apps/web/lib/i18n/actions.ts`
- `apps/web/lib/i18n/config.ts` and/or `apps/web/lib/i18n/request.ts` (consolidate to cookie-aware)
- `apps/web/middleware.ts` (optional cookie default)
- Settings page (if available) for preference control

**Testing Strategy:**
- E2E:
  - Anonymous user switches to Kannada; persists during the current browser session (tab/app lifetime)
  - No profile persistence; new sessions default to English
  - Admin dashboard and provider flows render in chosen language
- Integration:
  - Verify APIs return translated data for both locales
  - Verify cookie-only behavior; no profile updates
- Unit:
  - Validate allowed locales; cookie option correctness
- Visual regression:
  - Home, Providers list/detail, Admin dashboard in en/kn

---

### Milestone 5 Completion Criteria:
- [ ] Users can switch between English and Kannada
- [ ] Entire application works in both languages
- [ ] Preference persists during the current browser session (session cookie only)
- [ ] All key user and admin journeys tested in both languages
- [ ] Performance acceptable (<1s switch time; stable layout)
- [ ] Ready for production launch

## Milestone 3: English Migration Complete

Goal: Migrate all UI to use translation keys (next-intl) while still rendering English only. No functionality or visual changes; replace hardcoded strings with translation keys across public and admin. Sets up for Kannada in Milestone 4.

### Phase 3A: UI Migration - Public Pages
**Branch:** `feature/i18n-public-pages`

**Analysis Summary:**
- Pages (public):
  - app/page.tsx (Home)
  - app/about/page.tsx (About)
  - app/providers/page.tsx (Providers listing)
  - app/providers/[id]/page.tsx (Provider detail)
  - app/onboard/page.tsx (Onboarding form)
  - app/login/page.tsx (Login — already migrated, verify leftovers)
  - app/test-analytics/page.tsx, app/test-sentry/page.tsx (test/demo pages)
- Shared components used by public pages:
  - components/navigation/TopNav.tsx (nav, CTA, mobile menu)
  - app/layout.tsx (footer — mostly i18n already; verify alt/aria/meta)
  - Search/filter UI inside providers pages
  - Provider card rendering inside providers pages
  - Loading/empty/error states

**High-Level Tasks:**
- [ ] Audit public pages/components for hardcoded strings; inventory keys needed
- [ ] Populate messages/en.json with missing public strings (grouped by namespace)
- [ ] Migrate Home (hero, quick chips, CTA, sections)
- [ ] Migrate About (headings, FAQs, values, policies)
- [ ] Migrate Providers listing (headers, filters, sort, empty/loading/errors)
- [ ] Migrate Provider detail (sections, labels, actions, errors)
- [ ] Migrate Onboard form (labels, help, validation, placeholders)
- [ ] Migrate TopNav (nav links, buttons, aria)
- [ ] Footer: verify remaining strings/alt/aria/meta
- [ ] Ensure DB-backed labels use translation helpers (e.g., categories)
- [ ] Add/adjust unit/integration tests; ensure no missing-key warnings

**Files to Modify:**
- app/page.tsx, app/about/page.tsx
- app/providers/page.tsx, app/providers/[id]/page.tsx
- app/onboard/page.tsx, app/login/page.tsx (verify)
- components/navigation/TopNav.tsx
- app/layout.tsx (footer text, alt/aria/meta where applicable)
- messages/en.json (nav, home, providers.listing, providers.details, onboard, common, errors)

**Testing Strategy:**
- Visual diff: no UI changes; compare before/after
- Functional smoke: navigation, search/filter, provider detail actions, onboarding submission
- Check console: no missing translation warnings
- Use next-intl formatter for dates/numbers where relevant
- Update/add unit/integration tests; e2e for providers flow

---

### Phase 3B: UI Migration - Admin Pages
**Branch:** `feature/i18n-admin-pages`

**Analysis Summary:**
- Pages (admin):
  - app/admin/page.tsx (Dashboard: metrics, tabs, list, drawer)
  - app/admin/master-data/page.tsx (landing tiles)
  - app/admin/master-data/languages/page.tsx
  - app/admin/master-data/service-radius/page.tsx
  - app/admin/master-data/experience-levels/page.tsx
  - app/admin/master-data/categories/page.tsx
  - app/admin/master-data/sampradayas/page.tsx
  - app/admin/master-data/mapping/page.tsx
  - app/admin/master-data/terms/page.tsx
  - app/admin/mfa-setup/page.tsx, app/admin/mfa-verify/page.tsx
- Admin components/patterns:
  - Tables (headers, empty/loading, actions)
  - Forms (labels, placeholders, validation, confirmations)
  - Buttons/menus, badges, status chips
  - Drawer/detail panel labels and actions

**High-Level Tasks:**
- [ ] Audit admin pages/components for leftover hardcoded strings
- [ ] Populate messages/en.json with missing admin strings (dashboard, actions, messages, pagination)
- [ ] Dashboard: metrics labels, tabs, filters, list empty/error states, actions
- [ ] Provider detail drawer: labels, sections, actions, errors
- [ ] Master Data managers: verify and complete any remaining strings
- [ ] MFA setup/verify: verify all messages and errors
- [ ] Add/adjust unit/integration tests; ensure no missing-key warnings

**Files to Modify:**
- app/admin/page.tsx (and actions toast messages if any)
- app/admin/master-data/*/page.tsx (verify completeness)
- app/admin/mfa-setup/page.tsx, app/admin/mfa-verify/page.tsx
- messages/en.json (admin.dashboard, admin.actions, admin.messages, admin.pagination, admin.masterDataPages)

**Testing Strategy:**
- Visual + functional: tabs, filters, pagination, approve/reject flows
- Detail drawer behavior and messages
- Master data CRUD flows (create/edit/delete/toggle)
- Console clean: no missing translation warnings
- Unit/integration updates; e2e for dashboard approval flow

---

### Milestone 3 Completion Criteria:
- [ ] No hardcoded user-facing strings in public or admin
- [ ] messages/en.json complete and organized; no unused keys
- [ ] UI unchanged visually and functionally
- [ ] No missing-key warnings; console clean
- [ ] Dates/numbers via next-intl formatters where applicable
- [ ] Master data labels resolved via DB translations/fallbacks
- [ ] Tests passing (>80% coverage maintained); updated where needed
- [ ] Documentation updated: i18n usage, patterns, naming conventions
- [ ] Branches merged in sequence to target branch without conflicts

## How to Use This Roadmap

**This is a living document** - Update it regularly as work progresses.

**GitHub is our single source of truth** - All planned work is tracked as GitHub Issues with labels and Milestones. This document shows the high-level plan, but GitHub Issues contain the detailed tasks.

**Status Tags:**

- ✅ **Done** - Completed and deployed
- 🚧 **In Progress** - Currently being worked on
- 📋 **Planned** - Ready to start, requirements clear
- 💡 **Backlog** - Future consideration, not prioritized

**Priority Tags:**

- 🔴 **Must** - Critical for launch, blocks other work
- 🟠 **Should** - Important for quality, user experience
- 🟡 **Could** - Nice to have, enhances product

**How to track progress:**

1. Create GitHub Issues for all work (features, bugs, chores)
2. Add labels: `type:*`, `P*`, and `area:*` for filtering
3. Attach to Milestones for release planning
4. Use GitHub Projects for visual Kanban board
5. Link PRs to Issues with "Closes #`<number>`"

---

## Development Phases

### Phase 0: Foundation ✅ COMPLETE

**Goal:** Core infrastructure and database ready

**Completed:** Nov 2025

- ✅ Next.js 14 + TypeScript + Tailwind setup
- ✅ Supabase database with clean taxonomy
- ✅ Row Level Security policies
- ✅ Basic UI components and design system
- ✅ Homepage and provider directory pages

---

### Phase 1: MVP (Minimum Viable Product)

**Goal:** Launch-ready platform for Bangalore Madhwa community

**Target:** 2 weeks from now

**Success Criteria:**

- Seekers can browse and filter providers
- Providers can onboard themselves
- Admins can approve/reject applications
- All critical security measures in place
- Deployed to production (Vercel)

**Key Milestones:**

- [ ] Week 1: Complete authentication + photo display + admin features
- [ ] Week 2: Deploy to Vercel + final testing + soft launch

---

### Phase 2: Public Beta

**Goal:** Stable platform with enhanced features for wider audience

**Target:** 1-2 months after MVP

**Success Criteria:**

- 50+ approved providers across categories
- 500+ monthly visitors
- Enhanced search with autocomplete
- Admin dashboard with analytics
- Zero critical bugs

**Key Milestones:**

- [ ] Month 1: Enhanced search + admin tools + monitoring
- [ ] Month 2: User feedback integration + performance optimization

---

### Phase 3: V2+ (Growth & Scale)

**Goal:** Expand to multiple cities and communities

**Target:** 3-6 months after MVP

**Success Criteria:**

- 200+ providers across 3 cities
- 2,000+ monthly visitors
- Booking system operational
- Reviews and ratings live
- Mobile app launched

**Key Milestones:**

- [ ] Q1: Booking system + reviews
- [ ] Q2: Mobile app + city expansion
- [ ] Q3: Advanced features + community tools

---

## Milestone 2 — Internationalization (i18n)

Status: Phase 2 (App i18n with next-intl) — COMPLETE. Phase 1 — remaining validation/docs pending (see below).

### Phase 1 — Database i18n Infrastructure (In Progress)

- [x] Migration: add JSONB translation columns + GIN indexes to master data tables
- [x] Data backfill: migrate existing English content to JSONB under `en`
- [x] Rollback script for all changes
- [x] Helpers and types for translations
- [x] Update queries to include translated fields while keeping originals
- [ ] Apply migration on all dev environments and validate
- [ ] Documentation: examples in services and usage patterns

Next: Phase 2 — next-intl setup, project structure, language selector, and string extraction (after Phase 1 merges).

---

## Task List by Area

### 🎯 Top 10 Backlog (Next Priority Tasks)

**These are the most impactful tasks selected from across all areas based on current MVP needs and dependencies:**

- [ ] **Complete authentication integration** - Critical foundation that blocks all protected features and admin functionality
- [x] **Implement photo upload with signed URLs** - Essential for provider profiles, builds trust and enables visual verification
- [ ] **Build admin approval/rejection workflow** - Core business process needed for quality control and platform safety
- [ ] **Deploy to Vercel production** - Required for real user testing and feedback collection before launch
- [x] **Add comprehensive error states and loading spinners** - Dramatically improves user experience during authentication and file uploads
- [ ] **Implement admin audit logging** - Essential for security, compliance, and tracking all provider approval decisions
- [ ] **Set up Sentry error tracking** - Critical for monitoring production issues and maintaining platform reliability
- [x] **Create manual testing checklist** - Ensures quality before launch and prevents embarrassing bugs in production
- [x] **Add pagination to provider lists** - Improves performance and user experience as provider count grows
- [ ] **Build form validation and error handling** - Reduces user frustration and improves onboarding completion rates

---

### Product & Design

#### ✅ Product - Completed (Phase 0)

- [x] Homepage hero section
- [x] Provider directory UI  
- [x] Provider detail page
- [x] Onboarding form (multi-step)
- [x] Admin approval dashboard
- [x] Filter UI (category, language, location)
- [x] WhatsApp/phone contact buttons

#### 📋 Product - Planned (Phase 1)

- [ ] Loading states for all pages
- [ ] Error states and messages
- [ ] Success confirmations
- [ ] Empty states (no results)

#### 📋 Product - Planned (Phase 2)

- [ ] Admin rejection flow UI
- [ ] Admin audit log viewer

#### 💡 Product - Backlog (Phase 2+)

- [ ] Provider profile editing
- [ ] Search autocomplete
- [ ] Booking request form
- [ ] Reviews and ratings UI

---

### 💻 Frontend Development

#### ✅ Frontend - Completed (Phase 0)

- [x] Next.js 14 App Router setup
- [x] Tailwind CSS configuration
- [x] Supabase client setup
- [x] TypeScript types for all entities
- [x] React Hook Form + Zod validation
- [x] Search RPC integration

#### 🚧 Frontend - In Progress (Phase 1)

- [ ] Authentication integration

#### 📋 Frontend - Planned (Phase 1)

- [x] Login/logout UI
- [ ] Protected routes middleware
- [ ] Photo upload with validation
- [ ] Signed URL display for photos
- [x] Pagination for provider list
- [x] Enhanced Provider Card component on /providers (signed thumbnails, responsive grid)
- [ ] Form error handling

#### 📋 Frontend - Planned (Phase 2)

- [ ] Admin bulk actions

#### 💡 Frontend - Backlog (Phase 2+)

- [ ] Real-time search results
- [ ] Provider favorites/bookmarks
- [ ] Mobile app (React Native)

---

### 🗄️ Backend & Database

#### ✅ Backend - Completed (Phase 0)

- [x] PostgreSQL schema design
- [x] Clean taxonomy (categories, sampradayas)
- [x] Row Level Security policies
- [x] Supabase Storage bucket
- [x] RPC search function
- [x] Provider details RPC

#### 📋 Backend - Planned (Phase 1)

- [ ] Admin functions (approve/reject)
- [ ] Signed URL generation
- [ ] Rate limiting on onboarding
- [ ] File upload validation

#### 📋 Backend - Planned (Phase 1-2)

- [ ] Admin action audit logging
- [ ] Provider statistics RPC

#### 💡 Backend - Backlog (Phase 2+)

- [ ] Search relevance scoring
- [ ] Typo tolerance in search
- [ ] Booking system tables
- [ ] Reviews and ratings tables
- [ ] Migrate to Typesense/Meilisearch

---

### 🔐 Security & Auth

#### 🚧 Security - In Progress (Phase 1)

- [x] Supabase Auth setup (magic link)

#### 📋 Security - Planned (Phase 1)

- [x] Auth callback route
- [x] Admin email allowlist check
- [x] Protect admin routes
- [x] Logout route and UI
- [ ] Protect onboarding route
- [ ] MFA for admins (TOTP)
- [ ] Recovery codes for MFA

#### 📋 Security - Planned (Phase 2)

- [ ] Rate limiting on login

#### 💡 Security - Backlog (Phase 2+)

- [ ] Security headers
- [ ] CAPTCHA on onboarding

---

### 🚀 Infrastructure & DevOps

#### ✅ Infrastructure - Completed (Phase 0)

- [x] Environment strategy defined (dev/prod separation)
- [x] Supabase CLI setup documented
- [x] Migration workflow established

#### 📋 Infrastructure - Planned (Phase 1)

- [ ] Create dev Supabase project
- [ ] Create prod Supabase project
- [ ] Baseline migration from current schema
- [ ] Vercel dev project creation
- [ ] Vercel prod project creation
- [ ] Environment variables setup (Vercel)
- [ ] Vercel Analytics enable
- [ ] Production deployment
- [x] Admin UI: /admin/master-data landing and per-type managers
- [ ] Custom domain setup

#### 📋 Infrastructure - Planned (Phase 2)

- [ ] Preview deployments for PRs
- [ ] GitHub Actions CI/CD

#### 💡 Infrastructure - Backlog (Phase 2+)

- [ ] Automated testing in CI
- [ ] Database backups
- [ ] Monitoring alerts
- [ ] CDN for images

---

### 📊 Analytics & Monitoring

#### ✅ Analytics - Completed (Phase 0)

- [x] PostHog integration
- [x] Event tracking (search, view, contact)
- [x] Conversion funnels
- [x] Provider view tracking
- [x] Contact conversion tracking

#### 📋 Analytics - Planned (Phase 1)

- [ ] Vercel Analytics
- [ ] Sentry error tracking

#### 📋 Analytics - Planned (Phase 2)

- [ ] Sentry performance monitoring
- [ ] Admin dashboard analytics

#### 💡 Analytics - Backlog (Phase 2+)

- [ ] Search analytics
- [ ] User feedback mechanism

---

### 📝 Documentation

#### ✅ Documentation - Completed (Phase 0.1)

- [x] README.md (entry point)
- [x] DEVELOPER-GUIDE.md
- [x] ARCHITECTURE.md
- [x] PRODUCT.md

#### ✅ Documentation - Completed (Phase 0.2)

- [x] ROADMAP.md (this file)
- [x] ENVIRONMENT-SETUP.md (dev/prod environment guide)

#### 📋 Documentation - Planned (Phase 1)

- [ ] OPERATIONS.md

#### 💡 Documentation - Backlog (Phase 2+)

- [ ] API documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide
- [ ] Contributing guidelines

---

### 🧪 Testing & Quality

#### 📋 Test -Planned (Phase 1)

- [ ] Manual testing checklist

#### 📋 Test - Planned (Phase 2)

- [x] Playwright E2E setup
- [x] Test: Onboarding flow
- [x] Test: Admin approval
- [ ] Test: Search and filter
- [ ] Test: Contact provider

#### 💡 Test Backlog (Phase 2+)

- [ ] Unit tests for utilities
- [ ] Visual regression testing
- [ ] Performance testing

---

### 🌍 Internationalization & Accessibility

#### 📋 Internationalization - Planned (Phase 2)

- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Color contrast audit
- [ ] Semantic HTML

#### 💡 Internationalization - Backlog (Phase 2+)

- [ ] Define i18n strategy
- [ ] Translate UI labels
- [ ] Language switcher

---

### 🎯 Future Features (V2+)

#### 💡 Backlog (Phase 3)

- [ ] Booking system
- [ ] Reviews and ratings
- [ ] Provider recommendations
- [ ] Email notifications
- [ ] Mobile app (iOS/Android)
- [ ] Multi-language interface
- [ ] Community events calendar
- [ ] Provider badges system
- [ ] Reference system
- [ ] Advanced search (Typesense)

---

## Current Sprint (Next 2 Weeks)

### Week 1: Core Features

**Focus:** Authentication + Photos + Admin Tools

**Goals:**

- [ ] Complete Supabase Auth integration
- [ ] Implement magic link login/logout
- [x] Add photo upload validation
- [x] Generate signed URLs for photos
- [ ] Build admin rejection flow
- [ ] Add audit logging

**Blockers:**

- None currently

---

### Week 2: Deploy & Polish

**Focus:** Deployment + Testing + Launch Prep

**Goals:**

- [ ] Create Vercel project
- [ ] Configure all environment variables
- [ ] Deploy to production
- [ ] Manual testing of all flows
- [ ] Fix critical bugs
- [ ] Soft launch to small group

**Blockers:**

- Need Vercel account access
- Need production Supabase project

---

## How to Propose New Tasks

**All work is tracked in GitHub Issues** - This document shows high-level phases, but GitHub Issues contain the detailed tasks.

**Before creating a new Issue:**

1. **Check if it already exists** - Search existing GitHub Issues
2. **Define the problem** - What user need does this solve?
3. **Estimate effort** - How long will it take? (hours/days)
4. **Assign priority** - P0/P1/P2/P3 based on impact
5. **Identify area** - Frontend/Backend/Infra/Docs

**How to create an Issue:**

1. Click "New issue" in GitHub repository
2. Use clear title (2-6 words)
3. Add description (2-6 sentences):
   - What needs to be done
   - Why it matters
   - Acceptance criteria
4. Add labels:
   - `type:feature` or `type:bug` or `type:chore`
   - `P0-critical` or `P1-high` or `P2-normal` or `P3-low`
   - `area:frontend` or `area:backend` or `area:infra` or `area:docs`
5. Assign to a developer
6. Add to appropriate Milestone (if planning for specific release)

**Example Issue:**

``` HTML
Title: Add provider rating system

Labels: type:feature, P2-normal, area:frontend

Description:
Allow users to rate providers after service completion.
This builds trust and helps others choose better providers.
- 1-5 star rating
- Optional text review
- Show average on provider profile
- Only users who contacted provider can rate
```

**GitHub Workflow:**

1. Issues are created → Backlog column in Projects
2. During planning, move to "This Sprint" column
3. Developer picks Issue, moves to "In Progress"
4. Create branch: `git switch -c feat/provider-rating`
5. Open PR with description: "Closes #42"
6. When PR merges, Issue closes automatically
7. Card moves to "Done" in Projects

---

## Completed Milestones

### ✅ Foundation Complete (Nov 2025)

**What we built:**

- Next.js 14 + TypeScript + Tailwind setup
- Supabase database with clean taxonomy
- Row Level Security policies
- Core UI components
- Homepage and provider directory
- Onboarding form
- Admin dashboard (basic)
- Search with filters

**Metrics:**

- 7 database tables created
- 12 RPC functions implemented
- 15+ React components built
- 8 ADR documents written
- 2,200+ lines of documentation

---

## Key Decisions & Trade-offs

### What We're Building First

**MVP Focus:**

- Simple directory (browse + filter + contact)
- Manual admin approval (no automation)
- Web-only (no mobile app yet)
- Bangalore only (no multi-city)
- Madhwa community first (expand later)

### What We're Deferring

**Not in MVP:**

- Booking system (manual coordination for now)
- Reviews/ratings (trust through admin approval)
- In-app messaging (use WhatsApp/phone)
- Payment processing (direct negotiation)
- Background checks (community vetting)

### Why These Choices

**Speed to launch:**

- Get feedback from real users quickly
- Validate core value proposition
- Iterate based on actual usage

**Simplicity:**

- Easier to maintain with small team
- Lower infrastructure costs
- Faster onboarding for users

**Community trust:**

- Manual approval builds quality
- WhatsApp is familiar to users
- No platform lock-in

---

## Success Metrics

### MVP Launch (Week 2)

- [ ] 10+ providers approved
- [ ] 50+ visitors in first week
- [ ] 5+ contact attempts
- [ ] Zero critical bugs
- [ ] <2s page load time

### Month 1 Post-Launch

- [ ] 30+ providers across categories
- [ ] 200+ monthly visitors
- [ ] 20+ contact attempts
- [ ] 80% approval rate for providers
- [ ] <5% error rate

### Month 3 Post-Launch

- [ ] 50+ providers
- [ ] 500+ monthly visitors
- [ ] 50+ contact attempts
- [ ] Featured in community newsletter
- [ ] 90% user satisfaction

---

## Resources & Links

**Project:**

- GitHub: `vipra-sethu/vipra-sethu-app`
- Supabase: [Project Dashboard](https://supabase.com/dashboard)
- Vercel: [To be created]

**Documentation:**

- [README.md](./README.md) - Entry point
- [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md) - Setup guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical design
- [PRODUCT.md](./PRODUCT.md) - Product vision

**Tools:**

- PostHog: Analytics

- Sentry: Error tracking
- Vercel Analytics: Performance

---

**Last Updated:** 08-Nov-2025  
**Next Review:** Weekly on Mondays  
**Owner:** Development Team

---

**Remember:** This roadmap is a guide, not a contract. Priorities shift based on user feedback and real-world needs. Update regularly and communicate changes to the team.
