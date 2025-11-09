# Manual Test Checklist

Last Updated: 2025-11-08

Purpose: Quickly validate core user journeys and critical states before releases.

---

## 1) Providers Directory (/providers)
- [ ] Loads with skeleton, no console errors
- [ ] Categories load and populate filter
- [ ] Search filters by name/about/category (client-side)
- [ ] Category filter narrows results
- [ ] Sort: newest / experience / name affects ordering
- [ ] Pagination: Load More increases visible count
- [ ] Empty state appears with guidance when no results
- [ ] Error state shows clear message and retry (simulate by forcing service error in dev)

Acceptance: First content in <2s locally, interactions responsive.

---

## 2) Provider Detail (/providers/[id])
- [ ] Shows skeleton while loading
- [ ] Details render (name, category, location, languages, experience)
- [ ] Contact actions: WhatsApp/Call links present when phone exists
- [ ] Share button copies URL (or native share dialog)
- [ ] Error fallback appears if provider not found

Acceptance: No layout shift after load; links are correct.

---

## 3) Onboarding (/onboard)
- [ ] Step 1 validation: name/phone required; error messages visible
- [ ] Step 2 validation: category and ≥1 language required
- [ ] Step 3: Terms required; photo input preview works (optional)
- [ ] Submit shows submitting state and disables buttons
- [ ] Success screen renders after submission
- [ ] Error banner shows on failure with actionable text
- [ ] Draft autosave restores fields on reload (except photo)

Acceptance: Cannot proceed with invalid inputs; success and errors tracked.

---

## 4) Admin Dashboard (/admin) – Mock Data (for now)
- [ ] Initial skeleton for ~0.5s then list appears
- [ ] Search by name/category/location filters list
- [ ] Category select filters list
- [ ] Pagination Next/Prev navigates without resetting filters
- [ ] Drawer opens with provider details
- [ ] Approve removes item and shows loading state
- [ ] Error panel + Retry restores list (simulate by forcing error in code)

Acceptance: No full-page reloads; actions are responsive.

---

## 5) Authentication (If configured)
- [ ] Login page renders and accepts email
- [ ] Magic-link flow returns session
- [ ] Protected routes redirect when unauthenticated
- [ ] Admin access gated by allowlist

Acceptance: No unauthorized access to admin flows.

---

## 6) Analytics & Error Tracking (If configured)
- [ ] PostHog test page loads and sends events
- [ ] Sentry test route triggers an error (if DSN present)

Acceptance: No runtime crashes when env vars are missing (graceful no-op).

---

## 7) Environment & Config
- [ ] .env.local present with Supabase URL/keys
- [ ] App runs on http://localhost:3000
- [ ] No secret keys committed; NEXT_PUBLIC_* only on client

Acceptance: Dev server boots cleanly; no missing env errors.

---

## 8) Known Limitations (for tester awareness)
- Admin data currently mocked; Supabase wiring WIP
- Photos feature: single image path; thumbnails pending implementation
- Search doesn’t include autocomplete/typo tolerance yet

---

## 9) Quick Smoke Checklist (TL;DR)
- [ ] Home renders
- [ ] Providers list filters and paginates
- [ ] Provider detail loads and links work
- [ ] Onboard validates and submits
- [ ] Admin list loads, paginates, approve works (mock)
- [ ] Error and loading states visible where expected
- [ ] No console errors in key pages
