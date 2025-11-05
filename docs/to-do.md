# Vipra Sethu — To-Do List

**Last Updated:** 2025-11-05

## ✅ **Completed: Clean Taxonomy Implementation**

### Database Schema ✅

- [x] Created normalized `categories` and `sampradayas` tables
- [x] Updated `providers` table with `category_code` and `sampradaya_code` FK references
- [x] Removed legacy text fields (`category`, `sampradaya`)
- [x] Created clean RPC functions with code-based filters only
- [x] Added `provider_with_taxonomies` view for UI convenience
- [x] Implemented RLS policies for taxonomy tables

### Migration Scripts ✅

- [x] `06_clean_taxonomy_tables.sql` - Creates taxonomy tables and migrates data
- [x] `07_clean_rpc_and_views.sql` - Updates functions to use clean taxonomy
- [x] Fixed syntax errors and function naming issues
- [x] All scripts tested and working in Supabase

### Documentation ✅

- [x] Updated `docs/11-data-model-and-schemas.md` with clean schema
- [x] Updated `infra/supabase/README.md` with migration instructions
- [x] Created `docs/CLEAN-TAXONOMY-IMPLEMENTATION.md` implementation guide
- [x] Updated `docs/README.md` with taxonomy section
- [x] Cleaned up outdated documentation files

---

## 🔴 P0: Critical (Before Alpha Launch)

### Authentication & Security

- [ ] Set up Supabase Auth in Next.js app
  - [ ] Install `@supabase/ssr` package
  - [ ] Create `lib/supabaseClient.ts` for client-side auth
  - [ ] Update `lib/supabaseServer.ts` to handle auth cookies
  - [ ] Add auth callback route (`/auth/callback`)
- [ ] Implement email magic link authentication
  - [ ] Create login page (`/login`)
  - [ ] Add "Sign in with Email" form
  - [ ] Handle magic link email sending
- [ ] Protect admin routes
  - [ ] Create middleware to check `admins` table
  - [ ] Redirect non-admins from `/admin` routes
  - [ ] Add admin check helper function
- [ ] Update onboarding to require auth
  - [ ] Protect `/onboard` route (require auth)
  - [ ] Set `user_id` from session on provider insert
  - [ ] Add logout button to layout

### Rate Limiting & Abuse Prevention

- [ ] Add rate limiting to onboarding API
  - [ ] Install `@upstash/ratelimit` or similar
  - [ ] Limit by IP (e.g., 3 submissions per hour)
  - [ ] Limit by email/phone (prevent duplicates)
  - [ ] Return 429 with retry-after header
- [ ] Add file validation
  - [ ] Check file type (JPEG, PNG, WebP only)
  - [ ] Limit file size (e.g., 5MB max)
  - [ ] Return clear error messages
- [ ] Consider adding captcha
  - [ ] Evaluate hCaptcha vs Cloudflare Turnstile
  - [ ] Add to onboarding form
  - [ ] Verify token server-side

### Photo Display

- [ ] Generate signed URLs for photos
  - [ ] Create `lib/storage.ts` helper
  - [ ] Add `getSignedUrl(path)` function using service role
  - [ ] Set TTL (e.g., 15 minutes)
- [ ] Display photos on provider detail page
  - [ ] Fetch signed URL in server component
  - [ ] Add `<Image>` component with photo
  - [ ] Handle missing photos gracefully
- [ ] Display photos on providers list (optional)
  - [ ] Add thumbnail to grid cards
  - [ ] Optimize with Next.js Image component

### Search Integration

- [ ] Create search filters UI
  - [ ] Add filter form to `/providers` page
  - [ ] Category dropdown (Purohit, Cook, etc.)
  - [ ] Languages multi-select
  - [ ] Sampradaya dropdown
  - [ ] Text search input
  - [ ] Location search (city or lat/lon)
- [ ] Wire RPC search function
  - [ ] Call `search_providers` RPC from server component
  - [ ] Pass filter params from URL query string
  - [ ] Handle empty results state
  - [ ] Add pagination (offset/limit)

### WhatsApp & Phone CTAs

- [ ] Add WhatsApp share button
  - [ ] Generate WhatsApp deep link with prefilled message
  - [ ] Format: `https://wa.me/{phone}?text={encoded_message}`
  - [ ] Include provider name and category in message
  - [ ] Add WhatsApp icon (Lucide React)
- [ ] Add click-to-call link
  - [ ] Format: `tel:{phone}`
  - [ ] Add phone icon
  - [ ] Show both phone and WhatsApp if different

### Error Handling & UX

- [ ] Add error states to onboarding form
  - [ ] Show validation errors inline
  - [ ] Display API errors (toast or alert)
  - [ ] Add success message after submission
  - [ ] Redirect to success page or show confirmation
- [ ] Add loading states
  - [ ] Disable submit button while uploading
  - [ ] Show spinner during submission
  - [ ] Add loading skeleton to providers list
- [ ] Improve form validation
  - [ ] Phone number format validation
  - [ ] Required field indicators
  - [ ] Better Zod error messages

### Admin Features

- [ ] Add rejection flow
  - [ ] Add "Reject" button to admin page
  - [ ] Require rejection reason (modal or form)
  - [ ] Update status to `rejected`
  - [ ] Log rejection in `admin_actions`
- [ ] Create admin audit log viewer
  - [ ] New page `/admin/audit-log`
  - [ ] List all `admin_actions` with timestamps
  - [ ] Show actor, provider, action type, notes
  - [ ] Add filters (date range, action type)
  - [ ] Pagination
- [ ] Improve admin approval UI
  - [ ] Show provider photo in approval queue
  - [ ] Display all provider details before approval
  - [ ] Add bulk actions (approve/reject multiple)
  - [ ] Add search/filter to pending queue

### Observability

- [ ] Set up Sentry for error tracking
  - [ ] Create Sentry project
  - [ ] Install `@sentry/nextjs`
  - [ ] Add `sentry.client.config.ts` and `sentry.server.config.ts`
  - [ ] Configure source maps upload
  - [ ] Test error capture
- [ ] Add basic logging
  - [ ] Log onboarding submissions
  - [ ] Log admin actions
  - [ ] Log auth events
  - [ ] Use structured logging (JSON)

---

## 🟠 P1: Important (Before Pilot/Bangalore)

### Search Improvements

- [ ] Add search relevance ordering
  - [ ] Update RPC to order by similarity score
  - [ ] Consider `ts_rank` for text search
  - [ ] Boost exact matches
- [ ] Add typo tolerance
  - [ ] Use trigram similarity threshold
  - [ ] Test with common misspellings
- [ ] Validate geo search accuracy
  - [ ] Seed test data with known locations
  - [ ] Test radius queries (5km, 10km, 20km)
  - [ ] Verify PostGIS distance calculations
- [ ] Add search result count
  - [ ] Show "X results found"
  - [ ] Add "No results" empty state with suggestions

### Internationalization (I18n)

- [ ] Define language strategy
  - [ ] Decide: Kannada + English or English-only MVP?
  - [ ] Choose i18n library (`next-intl` or `react-i18next`)
  - [ ] Create language switcher UI
- [ ] Translate UI labels
  - [ ] Extract all hardcoded strings
  - [ ] Create translation files (en.json, kn.json)
  - [ ] Translate key pages (home, providers, onboard)
- [ ] Handle provider language facets
  - [ ] Normalize language codes (ISO 639)
  - [ ] Display languages in user's preferred language

### Accessibility (A11y)

- [ ] Keyboard navigation
  - [ ] Test tab order on all pages
  - [ ] Add focus indicators
  - [ ] Ensure forms are keyboard-accessible
- [ ] ARIA labels
  - [ ] Add `aria-label` to icon buttons
  - [ ] Add `role` attributes where needed
  - [ ] Test with screen reader (NVDA/JAWS)
- [ ] Color contrast
  - [ ] Audit with axe DevTools
  - [ ] Fix contrast issues (WCAG AA minimum)
- [ ] Semantic HTML
  - [ ] Use proper heading hierarchy
  - [ ] Add `<main>`, `<nav>`, `<section>` landmarks

### CI/CD Pipeline

- [ ] Create GitHub Actions workflow
  - [ ] Add `.github/workflows/ci.yml`
  - [ ] Run on push to main and PRs
- [ ] Add lint checks
  - [ ] ESLint with Next.js config
  - [ ] Fail on warnings
- [ ] Add type checks
  - [ ] Run `tsc --noEmit`
  - [ ] Ensure no type errors
- [ ] Add build step
  - [ ] Run `pnpm build`
  - [ ] Cache node_modules
- [ ] Add preview deployments
  - [ ] Deploy PRs to Vercel preview
  - [ ] Add preview URL to PR comments

### Testing

- [ ] Set up Playwright for E2E tests
  - [ ] Install `@playwright/test`
  - [ ] Create `playwright.config.ts`
  - [ ] Add test scripts to package.json
- [ ] Write critical path tests
  - [ ] Test: User can onboard as provider
  - [ ] Test: Admin can approve provider
  - [ ] Test: User can search and view providers
  - [ ] Test: User can contact provider via WhatsApp
- [ ] Add unit tests (optional)
  - [ ] Test RPC search function logic
  - [ ] Test validation schemas
  - [ ] Test helper functions

### Data Lifecycle & Compliance

- [ ] Define retention policy
  - [ ] Document how long to keep provider data
  - [ ] Document photo retention (e.g., 1 year after removal)
  - [ ] Add to compliance docs
- [ ] Create DSR (Data Subject Request) tooling
  - [ ] Script to export user data (JSON)
  - [ ] Script to delete user data (cascade)
  - [ ] Document DSR process in runbook
- [ ] Add privacy notice to onboarding
  - [ ] Link to privacy policy
  - [ ] Checkbox for consent
  - [ ] Store consent timestamp

### Incident Response

- [ ] Write detailed runbooks
  - [ ] Incident: Spam submissions
  - [ ] Incident: Inappropriate content
  - [ ] Incident: Data breach
  - [ ] Incident: Service outage
- [ ] Add key recovery steps
  - [ ] Document Supabase key rotation
  - [ ] Document Vercel secret updates
  - [ ] Test recovery procedures

---

## 🟡 P2: Nice-to-Have (Pre-General Release)

### References & Badges System

- [ ] Design reference schema
  - [ ] Add `references` table (referrer, referee, notes)
  - [ ] Add `badges` table (badge type, criteria)
  - [ ] Link badges to providers
- [ ] Create reference submission flow
  - [ ] Allow users to submit references
  - [ ] Admin review and approval
  - [ ] Display reference count on provider card
- [ ] Create badge system
  - [ ] Define badge types (Verified, Experienced, etc.)
  - [ ] Admin can assign badges
  - [ ] Display badges on provider profile

### Advanced Search

- [ ] Write RFC for Typesense/Meilisearch
  - [ ] Evaluate pros/cons vs Postgres
  - [ ] Define migration trigger (e.g., >10k providers)
  - [ ] Estimate costs
- [ ] Prototype advanced search
  - [ ] Faceted search (category, languages, location)
  - [ ] Autocomplete/suggestions
  - [ ] Fuzzy matching
  - [ ] Ranking by relevance + recency

### Call Masking

- [ ] Research call masking services
  - [ ] Twilio, Plivo, or similar
  - [ ] Estimate costs per call
- [ ] Implement proxy numbers
  - [ ] Generate temporary numbers for contacts
  - [ ] Forward calls to provider
  - [ ] Log call metadata (duration, timestamp)
- [ ] Add privacy controls
  - [ ] Providers can opt-in to call masking
  - [ ] Display masked number on provider detail

### MFA for Admins

- [ ] Enable Supabase MFA
  - [ ] Configure TOTP (Google Authenticator)
  - [ ] Require MFA for admin accounts
  - [ ] Add MFA setup flow
- [ ] Test MFA enforcement
  - [ ] Verify admins cannot bypass
  - [ ] Add recovery codes

### Backup & Restore

- [ ] Automate Supabase backups
  - [ ] Enable PITR (Point-in-Time Recovery)
  - [ ] Document restore procedure
  - [ ] Test restore from backup
- [ ] Backup storage bucket
  - [ ] Export photos to external storage (S3)
  - [ ] Schedule weekly backups
  - [ ] Test restore

### Performance Monitoring

- [ ] Set up PostHog
  - [ ] Create PostHog project
  - [ ] Install `posthog-js`
  - [ ] Track key events (search, view, contact, onboard, approve)
- [x] Add Vercel Analytics
  - [ ] Enable in Vercel dashboard
  - [ ] Monitor Core Web Vitals
  - [ ] Set performance budgets
- [ ] Database query optimization
  - [ ] Add slow query logging
  - [ ] Optimize N+1 queries
  - [ ] Add composite indices as needed

---

## 📝 Documentation & Polish

### Documentation

- [ ] Update README with setup instructions
  - [ ] Prerequisites (Node, pnpm, Supabase account)
  - [ ] Local development setup
  - [ ] Environment variables
  - [ ] Running migrations
- [ ] Create CONTRIBUTING.md
  - [ ] Code style guidelines
  - [ ] PR process
  - [ ] Testing requirements
- [ ] Write ADRs (Architecture Decision Records)
  - [ ] ADR: RLS policy set
  - [ ] ADR: Admin model (email allowlist vs SSO)
  - [ ] ADR: Signed URL TTL policy
  - [ ] ADR: Search evolution path
- [ ] Write RFCs (Request for Comments)
  - [ ] RFC: References/Badges system
  - [ ] RFC: Typesense/Meilisearch adoption
  - [ ] RFC: Call masking implementation

### UI/UX Polish

- [ ] Design system consistency

  - [ ] Define color palette
  - [ ] Define typography scale
  - [ ] Create reusable components (Button, Card, Input)
- [ ] Improve mobile responsiveness
  - [ ] Test on mobile devices
  - [ ] Fix layout issues
  - [ ] Optimize touch targets
- [ ] Add loading skeletons
  - [ ] Providers list skeleton
  - [ ] Provider detail skeleton
  - [ ] Admin queue skeleton
- [ ] Add empty states
  - [ ] No providers found
  - [ ] No pending approvals
  - [ ] No search results
- [ ] Add favicons and meta tags
  - [ ] Create favicon set
  - [ ] Add Open Graph tags
  - [ ] Add Twitter Card tags

### Data Model Enhancements

- [ ] Add location fields
  - [ ] Add `city`, `state`, `country_code` to providers
  - [ ] Update onboarding form
  - [ ] Add to search filters
- [ ] Add trust signals
  - [ ] Add `experience_years` (optional)
  - [ ] Add `badges` array
  - [ ] Add `references_count` (computed)
- [ ] Normalize category
  - [ ] Create `categories` enum table
  - [ ] Migrate existing data
  - [ ] Add foreign key constraint
- [ ] Track approval metadata
  - [ ] Add `approved_at`, `approved_by` to providers
  - [ ] Add `rejected_at`, `rejected_by`, `rejection_reason`
  - [ ] Update admin actions to populate these

---

## ✅ Completed

- [x] Database schema with indices
- [x] RLS policies (public read, self RW, admin all)
- [x] Storage policies (private bucket, signed URLs)
- [x] RPC search function
- [x] Next.js app structure (Turbo + pnpm)
- [x] Home page with navigation
- [x] Providers list page (approved only)
- [x] Provider detail page
- [x] Onboarding form (React Hook Form + Zod)
- [x] Onboarding API with photo upload
- [x] Admin approval page (pending queue)
- [x] Admin approval action (server action)

## Plan of Action

Great question! Based on modern development best practices and our current progress, I'd recommend this strategic approach:

## 🎯 Recommended Development Path

### **Phase 1: Complete UI Foundation (Current - 80% done)**

**✅ Completed**: Homepage with world-class design system
**🔄 Next**: Finish remaining pages with consistent UI

**Why this first:**

- **Design Consistency**: Ensures all pages follow the same design language
- **Component Library**: Reusable components reduce future work
- **User Experience**: Complete visual flow before backend complexity
- **Faster Iteration**: UI changes are easier than database migrations

### **Phase 2: Database Schema & API**

**🔄 After UI**: Implement database and backend logic

**Why second:**

- **Informed Design**: You know exactly what data you need from the UI
- **Right-Sized Schema**: Build only what the UI actually requires
- **Clear Contracts**: API endpoints based on actual UI needs
- **Avoid Over-Engineering**: Don't build features UI doesn't use

### **Phase 3: Integration & Data Flow**

**🔄 Last**: Connect UI to backend, handle real data

**Why last:**

- **Clean Separation**: UI and backend developed independently
- **Easier Testing**: Mock data works perfectly during UI development
- **Parallel Development**: Could even have different developers work on UI vs backend

---

## **📋 Specific Implementation Order**

### **Step 1: Complete UI Foundation (2-3 days)**

1. ✅ Homepage (done)
2. 🔄 **Providers List Page** - Grid layout, filters, search
3. 🔄 **Provider Detail Page** - Enhanced cards, contact CTAs
4. 🔄 **Onboarding Flow** - Multi-step form with progress
5. 🔄 **Admin Dashboard** - Clean management interface
6. 🔄 **Mobile Navigation** - Responsive hamburger menu

### **Step 2: Database & API (2-3 days)**

1. 🔄 **Schema Design** - Tables for providers, users, categories
2. 🔄 **Supabase Setup** - Authentication, storage, functions
3. 🔄 **API Routes** - CRUD operations for all entities
4. 🔄 **Data Validation** - Zod schemas, error handling

### **Step 3: Integration (2-3 days)**

1. 🔄 **Connect UI to API** - Replace mock data with real calls
2. 🔄 **Authentication Flow** - Login, signup, protected routes
3. 🔄 **Real-time Features** - Live search, instant updates
4. 🔄 **Error Handling** - User-friendly error states
5. 🔄 **Performance Optimization** - Caching, lazy loading

---

## **🎨 Benefits of This Approach**

### **UI-First Benefits:**

- ✅ **Better UX Design**: Focus on user experience without technical constraints
- ✅ **Component Reusability**: Build a solid component library
- ✅ **Faster Prototyping**: Can test user flows immediately
- ✅ **Clear Requirements**: Database schema driven by actual UI needs

### **Risk Mitigation:**

- ✅ **Early Feedback**: Can show stakeholders working UI quickly
- ✅ **Reduced Rework**: Less likely to need major UI changes after backend
- ✅ **Parallel Development**: Future team members can work on different phases

### **Technical Benefits:**

- ✅ **Clean Architecture**: Separation of concerns from the start
- ✅ **Better Testing**: UI tests with mock data, API tests separately
- ✅ **Performance**: UI optimizations done before data complexity

---

## **🚀 Alternative Paths (and why I don't recommend them)**

### **❌ Backend-First Approach**

- **Problem**: UI becomes constrained by database decisions
- **Risk**: Over-engineering features that aren't needed
- **Issue**: Slower visual feedback to stakeholders

### **❌ Page-by-Page Integration**

- **Problem**: Inconsistent design across pages
- **Risk**: Component duplication, maintenance nightmare
- **Issue**: Hard to maintain design system integrity

### **❌ Database-First, Then UI**

- **Problem**: Building features without knowing if they're needed
- **Risk**: Schema changes when UI requirements evolve
- **Issue**: Slower time-to-market for visual product

---

## **📊 My Recommendation: Continue UI-First**

**Current Status**: You have an excellent foundation with the homepage
**Next Step**: Complete the providers list page (most important page after homepage)

**Why this makes sense:**

1. **Momentum**: You're in the flow with UI development
2. **Design System**: All components and patterns are established
3. **Speed**: UI development is fast with the existing foundation
4. **Impact**: Users see a complete, polished experience quickly

---

## **🎯 Immediate Next Action**

I recommend we **continue with the providers list page** because:

- It's the most visited page after homepage
- It will establish patterns for data display
- It uses all the components we've already built
- It's critical for the core user journey

**Would you like me to start implementing the providers list page with the same world-class design principles we used for the homepage?**

This approach will give you a complete, stunning UI foundation that makes the backend development much more focused and efficient.
