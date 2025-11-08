# Architecture

**Technical architecture and design decisions for Vipra Sethu**

**Last Updated:** 2025-11-08

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Component Architecture](#component-architecture)
3. [Data Model](#data-model)
4. [Data Flows](#data-flows)
5. [Security Architecture](#security-architecture)
6. [Performance & Scalability](#performance--scalability)
7. [Architecture Decision Records](#architecture-decision-records)

---

## System Overview

### High-Level Architecture

```
User Browser
    |
    | HTTPS requests
    v
Next.js App (apps/web)
    |-- Pages (routing)
    |-- Components (UI)
    |-- Server Actions (API logic)
    |
    | Supabase Client SDK
    v
Supabase Backend
    |-- Auth (magic links, MFA)
    |-- PostgreSQL (data storage)
    |-- Storage (photo uploads)
    |-- RPC Functions (search, analytics)
```

### Environment Architecture

We use a **two-environment setup** with trunk-based development:

```
GitHub Repository (main branch)
        |
        | Push triggers both deployments
        |
    ┌───┴───┐
    |       |
    v       v
Vercel    Vercel
  Dev      Prod
    |       |
    v       v
Supabase  Supabase
  Dev      Prod
```

**Key Principles:**
- Single codebase (main branch)
- Two Supabase projects (dev + prod)
- Two Vercel projects (dev + prod)
- Database migrations managed via Supabase CLI
- All schema changes tracked in Git

**📖 Complete Guide:** See [ENVIRONMENT-SETUP.md](./ENVIRONMENT-SETUP.md) for full details.

### Technology Stack

**Frontend**
- Next.js 14 (App Router) - React framework that handles routing and server-side rendering
- TypeScript - Adds type safety to JavaScript, catches errors before runtime
- Tailwind CSS - Utility-first CSS framework for fast styling
- React Hook Form + Zod - Form handling with validation

**Backend**
- Supabase - All-in-one backend platform (replaces building custom API)
- PostgreSQL - Relational database (stores all structured data)
- Row Level Security (RLS) - Database-level access control (users only see their own data)

**Infrastructure**
- Vercel - Hosting platform (two projects: dev + prod, both deploy from main)
- Supabase CLI - Database migrations and schema management
- pnpm + Turborepo - Package manager and monorepo build system
- GitHub - Version control and collaboration (trunk-based development)

**Monitoring**
- PostHog - User analytics (tracks how people use the app)
- Sentry - Error tracking (alerts when things break)
- Vercel Analytics - Performance metrics (page load times, etc.)

---

## Component Architecture

### Monorepo Structure

```
vipra-sethu/
├── apps/web/              Main Next.js application
├── infra/supabase/        Database schema and migrations
├── docs/                  Documentation
├── package.json           Root workspace config
├── pnpm-workspace.yaml    Defines monorepo workspaces
└── turbo.json             Build system configuration
```

### apps/web (Next.js Application)

**Purpose:** Frontend application that users interact with

```
apps/web/
├── app/                   Pages and routes (Next.js App Router)
│   ├── page.tsx           Homepage
│   ├── providers/         Provider directory and detail pages
│   ├── onboard/           Provider registration flow
│   ├── admin/             Admin dashboard and MFA setup
│   └── api/               API endpoints (if needed)
│
├── components/            Reusable UI components
│   ├── ui/                Basic elements (Button, Card, Input)
│   ├── forms/             Form components with validation
│   └── navigation/        Header, footer, nav menus
│
├── lib/                   Utility functions and services
│   ├── supabaseClient.ts  Database connection setup
│   ├── services/          Business logic (search, auth, storage)
│   ├── types/             TypeScript type definitions
│   └── utils/             Helper functions
│
└── public/                Static assets (images, fonts, icons)
```

**Key Concepts:**
- **App Router** - File-based routing where folders become URLs (e.g., `app/providers/page.tsx` → `/providers`)
- **Server Components** - React components that run on server, faster initial load
- **Server Actions** - Functions that run on server, called from client (replaces API routes)

### infra/supabase (Database Layer)

**Purpose:** Database schema, security policies, and functions

```
infra/supabase/
├── 01_schema.sql                   Core tables (providers, admins, etc.)
├── 02_policies.sql                 Row Level Security rules
├── 03_storage.sql                  Photo storage bucket setup
├── 04_rpc_search.sql               Search function with filters
├── 05_admin_functions.sql          Admin approval and audit logging
├── 06_clean_taxonomy_tables.sql    Categories and sampradayas
└── 07_clean_rpc_and_views.sql      Updated search with taxonomy
```

**Key Concepts:**
- **Migrations** - SQL files that modify database structure, run in order
- **RPC Functions** - Stored procedures that run in database (faster than app logic)
- **Policies** - Security rules that control who can read/write data

---

## Data Model

### Core Tables

**providers**
- Stores service provider information (purohits, cooks, etc.)
- Fields: name, email, phone, category_code, sampradaya_code, languages, location, status
- Status: pending → approved/rejected (admin workflow)

**categories**
- Normalized taxonomy for service types
- Fields: code (e.g., 'purohit'), name (e.g., 'Vedic Purohit'), description
- Used in search filters and provider classification

**sampradayas**
- Religious traditions (Madhwa, Smarta, etc.)
- Fields: code (e.g., 'madhwa'), name (e.g., 'Madhwa'), description
- Optional field for providers

**admins**
- Email allowlist for admin access
- Fields: email, role, created_at
- Checked during authentication to grant admin privileges

**admin_actions**
- Audit log of all admin activities
- Fields: admin_id, provider_id, action (approved/rejected), notes, timestamp
- Immutable log for compliance and tracking

**provider_photos**
- Photo metadata for provider profiles
- Fields: provider_id, storage_path, uploaded_at
- Actual files stored in Supabase Storage

### Relationships

```
providers
    |-- category_code → categories.code (required)
    |-- sampradaya_code → sampradayas.code (optional)
    |-- user_id → auth.users.id (Supabase auth)
    |
    |-- provider_photos (one-to-many)
    |-- admin_actions (one-to-many)

admins
    |-- email matches auth.users.email
    |-- admin_actions (one-to-many)
```

### Clean Taxonomy Implementation

**Why normalized tables?**
- Consistent data (no typos like "Purohit" vs "purohit")
- Easy to add new categories without code changes
- Supports internationalization (multiple languages)
- Enables analytics (count providers by category)

**How it works:**
1. Categories and sampradayas stored in lookup tables
2. Providers reference by code (foreign key)
3. UI fetches active categories via RPC: `get_active_categories()`
4. Search filters by code: `p_category_code := 'purohit'`
5. Display uses view: `provider_with_taxonomies` (joins with names)

---

## Data Flows

### User Journey 1: Search for Provider

**Steps:**
1. User visits `/providers` page
2. Next.js server component fetches active categories and sampradayas
3. User selects filters (category, location, language)
4. Client calls `search_providers()` RPC function
5. PostgreSQL executes search with filters and RLS policies
6. Results returned with provider details and taxonomy names
7. User clicks provider card → navigates to `/providers/[id]`
8. Server component fetches provider details with signed photo URLs
9. User clicks WhatsApp button → opens WhatsApp with pre-filled message

**Technical Flow:**
```
Browser
  → Next.js Page Component
    → Supabase Client
      → RPC: search_providers(filters)
        → PostgreSQL Query
          → RLS: Filter by status='approved'
          → Join: providers + categories + sampradayas
          → Return: Array of providers
      ← Results
    ← Render Provider Cards
  ← Display to User
```

### User Journey 2: Provider Onboarding

**Steps:**
1. User visits `/onboard` page
2. Next.js loads multi-step form with validation
3. User fills Step 1: Name, email, phone, category, sampradaya
4. User fills Step 2: Languages, experience, about
5. User uploads photo (Step 3)
   - Client uploads to Supabase Storage
   - Returns storage path
6. User accepts terms and submits
7. Server Action validates data with Zod schema
8. Inserts provider record (status='pending')
9. Inserts photo metadata linking to provider
10. Redirects to success page
11. Admin receives notification (future: email/webhook)

**Technical Flow:**
```
Browser
  → Form Submit
    → Server Action: createProvider()
      → Validate with Zod
      → Supabase Client
        → Insert: providers table
          → RLS: Allow insert if authenticated
          → Trigger: Update updated_at timestamp
        → Insert: provider_photos table
        ← Returns: provider_id
      ← Success/Error
    ← Redirect or show error
  ← Display confirmation
```

### Admin Journey: Approve Provider

**Steps:**
1. Admin logs in with magic link
2. System checks if email in `admins` table
3. Admin navigates to `/admin` dashboard
4. Server component fetches pending providers
5. Admin clicks provider to view details in drawer
6. Admin clicks "Approve" button
7. Server Action calls `approve_provider()` RPC
8. RPC updates provider status to 'approved'
9. RPC logs action in `admin_actions` table
10. Analytics tracks approval event
11. UI updates to remove provider from queue

**Technical Flow:**
```
Browser
  → Admin Dashboard
    → Supabase Client
      → RPC: get_pending_providers()
        → RLS: Check if user in admins table
        → Query: WHERE status='pending'
        ← Returns: Pending providers
    ← Render approval queue
  → Click Approve
    → Server Action: approveProvider(id)
      → RPC: approve_provider(provider_id, admin_id)
        → Update: providers SET status='approved'
        → Insert: admin_actions (audit log)
        → Analytics: Track approval event
        ← Success
      ← Refresh data
    ← Update UI
```

---

## Security Architecture

### Authentication

**Magic Links (Passwordless)**
- User enters email → Supabase sends magic link
- Click link → authenticated session created
- No passwords to forget or leak
- Session stored in HTTP-only cookies (secure)

**MFA for Admins (TOTP)**
- Admins must enable two-factor authentication
- Uses authenticator apps (Google Authenticator, Authy)
- Required before accessing admin dashboard
- Backup recovery codes provided

### Authorization

**Row Level Security (RLS)**
- Database-level access control (not in app code)
- Policies define who can read/write each row
- Enforced even if app has bugs

**Key Policies:**

```sql
-- Public can read approved providers
CREATE POLICY "Public read approved"
  ON providers FOR SELECT
  USING (status = 'approved');

-- Users can insert their own provider
CREATE POLICY "Users insert own"
  ON providers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all providers
CREATE POLICY "Admins read all"
  ON providers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE email = auth.email()
    )
  );

-- Admins can update any provider
CREATE POLICY "Admins update all"
  ON providers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE email = auth.email()
    )
  );
```

**Storage Security**
- Photos stored in private bucket (not publicly accessible)
- Signed URLs generated on-demand (expire after 15 minutes)
- Only approved providers' photos accessible to public
- Service role key required for URL generation (server-side only)

### Data Protection

**Environment Variables**
- Secrets stored in `.env.local` (never committed)
- Different keys for dev/staging/production
- Service role key only used server-side (never exposed to browser)

**API Keys**
- `NEXT_PUBLIC_*` keys are safe to expose (read-only, RLS-protected)
- Service role key bypasses RLS (must be protected)
- Rotate keys if compromised

---

## Performance & Scalability

### Current Scale Assumptions

**Target:** 1,000-10,000 providers, 10,000-100,000 monthly users

**Database:**
- PostgreSQL handles millions of rows easily
- Indexed columns: category_code, sampradaya_code, status, location
- RPC functions optimized with proper WHERE clauses
- Connection pooling via Supabase (handles concurrent requests)

**Search Performance:**
- Text search uses PostgreSQL full-text search (GIN index)
- Geographic search uses PostGIS (spatial index)
- Typical query time: 10-50ms for 1000 providers
- Pagination limits results (50 per page)

**Photo Storage:**
- Signed URLs cached for 15 minutes (reduces database calls)
- Next.js Image component optimizes and caches images
- CDN serves static assets (Vercel Edge Network)

### Optimization Strategies

**Database:**
- Composite indexes on common filter combinations
- Materialized views for expensive queries (future)
- Read replicas for analytics (future, if needed)

**Frontend:**
- Server-side rendering (SSR) for SEO and fast initial load
- Static generation for homepage and category pages
- Client-side caching with React Query (future)
- Image optimization with Next.js Image component

**Caching:**
- Vercel Edge caching for static pages (automatic)
- Supabase connection pooling (automatic)
- Browser caching for images and assets

### Scalability Limits

**When to migrate:**
- **10,000+ providers** - Consider Typesense/Meilisearch for advanced search
- **100,000+ users** - Add read replicas for analytics queries
- **1M+ photos** - Consider CDN with object storage (S3/R2)

**Current bottlenecks:**
- PostgreSQL full-text search (good up to 100k providers)
- Signed URL generation (cached, but could be improved)
- Admin dashboard (loads all pending, needs pagination)

---

## Architecture Decision Records

### Index of ADRs

**ADR-001: Row Level Security for Authorization**
- Decision: Use Supabase RLS instead of application-level authorization
- Rationale: Database-enforced security, simpler code, works even if app has bugs

**ADR-002: Clean Taxonomy with Normalized Tables**
- Decision: Use separate tables for categories and sampradayas instead of text fields
- Rationale: Data consistency, easy to extend, supports internationalization

**ADR-003: Magic Link Authentication**
- Decision: Use passwordless magic links instead of traditional passwords
- Rationale: Better UX, no password management, reduces security risks

**ADR-004: Supabase as Backend**
- Decision: Use Supabase instead of building custom backend API
- Rationale: Faster development, built-in auth/storage/realtime, PostgreSQL power

**ADR-005: Next.js App Router**
- Decision: Use Next.js 14 App Router instead of Pages Router
- Rationale: Better performance, server components, simpler data fetching

**ADR-006: Turborepo Monorepo**
- Decision: Use Turborepo + pnpm for monorepo instead of single package
- Rationale: Scales to multiple apps, faster builds, shared packages

**ADR-007: Signed URLs for Photos**
- Decision: Use signed URLs with 15-minute expiry instead of public bucket
- Rationale: Privacy control, prevents hotlinking, can revoke access

**ADR-008: Email Allowlist for Admins**
- Decision: Use simple email allowlist instead of SSO or complex RBAC
- Rationale: Simple to manage, sufficient for small team, easy to audit

### Reading ADRs

Each ADR follows this format:
- **Context** - What problem we're solving
- **Decision** - What we chose to do
- **Rationale** - Why we made this choice
- **Consequences** - Trade-offs and implications
- **Alternatives** - What we considered but didn't choose

See individual ADR files in `docs/21-adr/` for full details.

---

## Technical Debt & Future Improvements

### Known Limitations

**Admin Dashboard:**
- Uses mock data (needs real Supabase integration)
- No pagination for pending queue (loads all)
- No bulk actions (approve/reject multiple)

**Search:**
- Basic text search (no autocomplete or suggestions)
- No typo tolerance (exact match only)
- No search analytics (can't see popular queries)

**Photos:**
- Single photo per provider (should support multiple)
- No image optimization on upload (large files slow)
- No thumbnail generation (loads full images)

### Planned Improvements

**Phase 1 (Next 2 weeks):**
- Replace admin mock data with real API calls
- Add rejection flow with reason input
- Implement audit log viewer

**Phase 2 (Next month):**
- Add search autocomplete
- Implement photo thumbnails
- Add provider profile editing

**Phase 3 (Next quarter):**
- Migrate to Typesense for advanced search
- Add booking system
- Implement reviews and ratings

---

## Diagrams

### Component Interaction

```
┌──────────────────────────────────────────────────────┐
│                    Browser                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │   Pages    │  │ Components │  │   Forms    │    │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘    │
│        │                │                │           │
│        └────────────────┴────────────────┘           │
│                         │                            │
└─────────────────────────┼────────────────────────────┘
                          │
                          │ Supabase Client SDK
                          │
┌─────────────────────────┼────────────────────────────┐
│                    Supabase                           │
│  ┌─────────────────────┴─────────────────────────┐  │
│  │              PostgreSQL Database               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐   │  │
│  │  │ Tables   │  │   RLS    │  │   RPC    │   │  │
│  │  │ (Data)   │  │(Security)│  │(Functions)│   │  │
│  │  └──────────┘  └──────────┘  └──────────┘   │  │
│  └───────────────────────────────────────────────┘  │
│  ┌──────────────┐              ┌──────────────┐    │
│  │     Auth     │              │   Storage    │    │
│  │ (Magic Links)│              │   (Photos)   │    │
│  └──────────────┘              └──────────────┘    │
└──────────────────────────────────────────────────────┘
```

### Data Flow: Search

```
User Input (filters)
        ↓
Next.js Page Component
        ↓
Supabase Client
        ↓
RPC: search_providers()
        ↓
PostgreSQL Query
  ├─ Apply RLS (status='approved')
  ├─ Filter by category_code
  ├─ Filter by sampradaya_code
  ├─ Filter by languages
  ├─ Filter by location (PostGIS)
  └─ Join with taxonomies
        ↓
Return Results
        ↓
Render Provider Cards
        ↓
Display to User
```

---

## Getting Started

**For Developers:**
1. Read [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md) for setup instructions
2. Review this architecture document to understand system design
3. Check individual ADRs for decision rationale
4. Start with small changes to understand data flow

**For Architects:**
1. Review ADRs to understand key decisions
2. Check [ROADMAP.md](./ROADMAP.md) for planned improvements
3. Evaluate scalability assumptions against your needs
4. Propose changes via GitHub discussions

**For Product:**
1. Understand data flows for user journeys
2. Review security model for compliance needs
3. Check performance assumptions for scale planning
4. See [PRODUCT.md](./PRODUCT.md) for feature requirements

---

**Next:** Read individual ADRs in `docs/21-adr/` for detailed decision rationale
