# Environment Setup Guide

**Complete guide for managing development and production environments**

**Last Updated:** 2025-11-08

---

## Table of Contents

1. [Overview](#overview)
2. [Environment Strategy](#environment-strategy)
3. [Supabase CLI Setup](#supabase-cli-setup)
4. [Migration from Current Setup](#migration-from-current-setup)
5. [Environment Configuration](#environment-configuration)
6. [Deployment Workflow](#deployment-workflow)
7. [Database Migrations](#database-migrations)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### Environment Architecture

We use a **clean two-environment setup** with trunk-based development:

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
│                     (Single main branch)                     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Push to main triggers both deployments
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌───────────────┐     ┌───────────────┐
│  Dev Deploy   │     │  Prod Deploy  │
│   (Vercel)    │     │   (Vercel)    │
└───────┬───────┘     └───────┬───────┘
        │                     │
        ▼                     ▼
┌───────────────┐     ┌───────────────┐
│  vipra-sethu  │     │  vipra-sethu  │
│     -dev      │     │     (prod)    │
│  (Supabase)   │     │  (Supabase)   │
└───────────────┘     └───────────────┘
```

### Key Principles

- **Single Repository** - One codebase, no environment drift
- **Trunk-Based Development** - Main branch is always deployable
- **Environment Isolation** - Separate Supabase projects for dev/prod
- **Automated Deployments** - Vercel auto-deploys from main
- **Database as Code** - All schema changes tracked in Git via migrations

---

## Environment Strategy

### Repository & Branching

**Strategy:** Trunk-based development with GitHub Flow

```bash
# Main branch = production-ready code
main → Always deployable

# Feature branches = short-lived (1-3 days max)
feat/feature-name → PR → Merge to main → Delete branch
fix/bug-name → PR → Merge to main → Delete branch
```

**Benefits:**
- ✅ Fewer merge conflicts
- ✅ Faster integration
- ✅ Simpler workflow
- ✅ Continuous deployment ready

### Supabase Projects

**Two separate Supabase projects:**

| Project | Purpose | Schema Management |
|---------|---------|-------------------|
| `vipra-sethu-dev` | Development & testing | Migrations applied first |
| `vipra-sethu` (prod) | Production users | Migrations applied after testing |

**Key Points:**
- Dev and prod are **completely isolated** (separate databases, storage, auth)
- Schema changes tested in dev before applying to prod
- Seed data only in dev (prod has real user data)
- Both use the same migration files from Git

### Vercel Deployments

**Two Vercel projects:**

| Vercel Project | Branch | Supabase Project | URL |
|----------------|--------|------------------|-----|
| `vipra-sethu-dev` | `main` | `vipra-sethu-dev` | `vipra-sethu-dev.vercel.app` |
| `vipra-sethu` | `main` | `vipra-sethu` (prod) | `vipra-sethu.vercel.app` |

**Environment Variables (Vercel):**

Each Vercel project has its own environment variables:

```env
# Dev Project (vipra-sethu-dev)
NEXT_PUBLIC_SUPABASE_URL=https://abc-dev.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev_anon_key
SUPABASE_SERVICE_ROLE_KEY=dev_service_key
NEXT_PUBLIC_POSTHOG_KEY=dev_posthog_key
NEXT_PUBLIC_SENTRY_DSN=dev_sentry_dsn

# Prod Project (vipra-sethu)
NEXT_PUBLIC_SUPABASE_URL=https://xyz-prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=prod_service_key
NEXT_PUBLIC_POSTHOG_KEY=prod_posthog_key
NEXT_PUBLIC_SENTRY_DSN=prod_sentry_dsn
```

**No `.env.production` files in repo** - Vercel manages secrets securely.

### Local Development

**Always points to dev Supabase project:**

```env
# apps/web/.env.local (not committed to Git)
NEXT_PUBLIC_SUPABASE_URL=https://abc-dev.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev_anon_key
SUPABASE_SERVICE_ROLE_KEY=dev_service_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Supabase CLI Setup

### Installation

```bash
# Install Supabase CLI globally
npm install -g supabase

# Verify installation
supabase --version
```

### First-Time Setup

```bash
# 1. Login to Supabase (stores token locally)
supabase login

# 2. Navigate to project root
cd c:\dev\vipra-sethu

# 3. Initialize Supabase folder (creates supabase/ directory)
supabase init

# This creates:
# supabase/
#   ├── config.toml       # Supabase CLI configuration
#   ├── migrations/       # Database migration files
#   └── seed.sql          # Seed data for dev environment
```

### Link to Supabase Projects

```bash
# Link to dev project
supabase link --project-ref <dev-project-ref>

# To switch to prod project (when needed)
supabase link --project-ref <prod-project-ref>
```

**Finding Project Ref:**
1. Go to Supabase Dashboard
2. Select your project
3. Settings → General → Reference ID

### Common CLI Commands

```bash
# View help
supabase --help

# Database commands
supabase db pull              # Fetch current schema from linked project
supabase db push              # Apply local migrations to linked project
supabase db diff              # Show differences between local and remote
supabase db reset             # Reset local database (dev only!)

# Migration commands
supabase migration new "add_providers_table"    # Create new migration file
supabase migration list                          # List all migrations
supabase migration up                            # Apply pending migrations

# Generate TypeScript types
supabase gen types typescript --linked > apps/web/lib/types/database.ts
```

---

## Migration from Current Setup

### Current State

- ✅ One Supabase project (let's call it "Current")
- ✅ Schema created by running SQL directly in Studio
- ❌ No migrations exist in repo yet
- ❌ No dev/prod separation

### Migration Plan

**Goal:** Create two environments (dev + prod) with baseline migration in Git

#### Step 1: Baseline Your Schema into Git

**Initialize Supabase CLI:**

```bash
cd c:\dev\vipra-sethu
supabase init
```

**Link to Current project:**

```bash
# Get project ref from Supabase Dashboard → Settings → General
supabase link --project-ref <current-project-ref>
```

**Pull live schema:**

```bash
# This downloads current schema as SQL
supabase db pull

# Creates: supabase/migrations/<timestamp>_remote_schema.sql
```

#### Step 2: Create Baseline Migration

**Review the pulled schema:**

```bash
# Check the generated migration file
cat supabase/migrations/*_remote_schema.sql
```

**Rename to baseline migration:**

```bash
# Rename for clarity
mv supabase/migrations/*_remote_schema.sql supabase/migrations/20250108000000_baseline_schema.sql
```

**Commit to Git:**

```bash
git add supabase/
git commit -m "feat: add baseline database migration"
git push origin main
```

#### Step 3: Create Dev Supabase Project

**Create new project in Supabase Dashboard:**

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Name: `vipra-sethu-dev`
4. Choose same region as prod
5. Set strong database password
6. Wait for project to initialize (~2 minutes)

**Link CLI to dev project:**

```bash
supabase link --project-ref <dev-project-ref>
```

**Push baseline migration to dev:**

```bash
# Apply all migrations from supabase/migrations/
supabase db push

# This creates all tables, policies, functions in dev
```

**Verify dev setup:**

```bash
# Check tables exist
supabase db diff

# Should show "No schema differences"
```

#### Step 4: Repurpose Current as Prod

**Option A: Keep Current as Prod (Recommended)**

```bash
# Rename project in Supabase Dashboard
# Current → vipra-sethu (prod)

# No migration needed - schema already exists
# Just update environment variables in Vercel
```

**Option B: Create Fresh Prod Project**

```bash
# 1. Create new project: vipra-sethu (prod)
# 2. Link CLI to prod
supabase link --project-ref <prod-project-ref>

# 3. Push baseline migration
supabase db push

# 4. Migrate data from Current to Prod (if needed)
# Use pg_dump/pg_restore or Supabase Studio export/import
```

#### Step 5: Create Seed Data (Dev Only)

**Create seed file:**

```bash
# Edit supabase/seed.sql
code supabase/seed.sql
```

**Add test data:**

```sql
-- supabase/seed.sql
-- Seed data for development environment only

-- Insert test categories
INSERT INTO categories (code, name, description, is_active) VALUES
  ('purohit', 'Vedic Purohit', 'Performs religious ceremonies', true),
  ('cook', 'Traditional Cook', 'Prepares authentic meals', true);

-- Insert test sampradayas
INSERT INTO sampradayas (code, name, description, is_active) VALUES
  ('madhwa', 'Madhwa', 'Dvaita philosophy', true),
  ('smarta', 'Smarta', 'Advaita tradition', true);

-- Insert test admin
INSERT INTO admins (email, role) VALUES
  ('admin@example.com', 'super_admin');

-- Insert test providers
INSERT INTO providers (
  name, email, phone, category_code, sampradaya_code,
  languages, city, state, status
) VALUES
  ('Test Purohit', 'test@example.com', '+919876543210', 
   'purohit', 'madhwa', ARRAY['Kannada', 'Sanskrit'], 
   'Bangalore', 'Karnataka', 'approved');
```

**Apply seed data (dev only):**

```bash
# Link to dev project
supabase link --project-ref <dev-project-ref>

# Reset database with seed data
supabase db reset

# WARNING: This deletes all data! Only use in dev!
```

#### Step 6: Update Local Environment

**Update `.env.local` to point to dev:**

```env
# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://<dev-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<dev-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<dev-service-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Test local development:**

```bash
pnpm dev

# Visit http://localhost:3000
# Should connect to dev Supabase project
```

---

## Environment Configuration

### Environment Variable Matrix

| Variable | Local Dev | Vercel Dev | Vercel Prod |
|----------|-----------|------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Dev Supabase | Dev Supabase | Prod Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dev key | Dev key | Prod key |
| `SUPABASE_SERVICE_ROLE_KEY` | Dev key | Dev key | Prod key |
| `NEXT_PUBLIC_APP_URL` | `localhost:3000` | `*.vercel.app` | Custom domain |
| `NEXT_PUBLIC_POSTHOG_KEY` | Dev key | Dev key | Prod key |
| `NEXT_PUBLIC_SENTRY_DSN` | Dev DSN | Dev DSN | Prod DSN |

### Vercel Environment Setup

**Create two Vercel projects:**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Link dev project
cd c:\dev\vipra-sethu
vercel link --project vipra-sethu-dev

# 4. Add dev environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... add all required variables

# 5. Deploy dev
vercel --prod

# 6. Repeat for prod project
vercel link --project vipra-sethu
# Add prod environment variables
vercel --prod
```

**Configure auto-deployment:**

1. Go to Vercel Dashboard
2. Select project → Settings → Git
3. Configure:
   - Production Branch: `main`
   - Auto-deploy: Enabled
   - Build Command: `pnpm build`
   - Output Directory: `.next`

---

## Deployment Workflow

### Standard Flow

```bash
# 1. Create feature branch
git checkout -b feat/new-feature

# 2. Make changes
# ... edit code ...

# 3. Test locally (against dev Supabase)
pnpm dev

# 4. Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feat/new-feature

# 5. Open PR on GitHub
# Review and approve

# 6. Merge to main
# This triggers BOTH Vercel deployments automatically:
#   - vipra-sethu-dev (with dev Supabase)
#   - vipra-sethu (with prod Supabase)

# 7. Verify deployments
# Check Vercel dashboard for build status
# Test both dev and prod URLs
```

### With Database Changes

```bash
# 1. Create migration
supabase migration new "add_booking_table"

# 2. Edit migration file
code supabase/migrations/<timestamp>_add_booking_table.sql

# 3. Apply to dev Supabase
supabase link --project-ref <dev-project-ref>
supabase db push

# 4. Test in dev environment
pnpm dev
# Verify migration works

# 5. Commit migration
git add supabase/migrations/
git commit -m "feat: add booking table migration"
git push origin feat/booking-system

# 6. Open PR and merge to main

# 7. Apply to prod Supabase (after deployment)
supabase link --project-ref <prod-project-ref>
supabase db push

# OR use CI/CD to apply automatically (future)
```

---

## Database Migrations

### Creating Migrations

```bash
# 1. Create new migration file
supabase migration new "descriptive_name"

# Creates: supabase/migrations/<timestamp>_descriptive_name.sql

# 2. Edit migration file
code supabase/migrations/<timestamp>_descriptive_name.sql
```

**Example migration:**

```sql
-- supabase/migrations/20250108120000_add_booking_table.sql

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add indexes
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_date ON bookings(service_date);
```

### Applying Migrations

**To dev environment:**

```bash
# Link to dev
supabase link --project-ref <dev-project-ref>

# Apply all pending migrations
supabase db push

# Verify
supabase db diff
```

**To prod environment:**

```bash
# Link to prod
supabase link --project-ref <prod-project-ref>

# Review what will change
supabase db diff

# Apply migrations
supabase db push

# Verify
supabase db diff
```

### Migration Best Practices

**DO:**
- ✅ Create small, focused migrations (one feature per migration)
- ✅ Test in dev before applying to prod
- ✅ Include rollback instructions in comments
- ✅ Use `IF NOT EXISTS` for idempotent migrations
- ✅ Add indexes for foreign keys and frequently queried columns
- ✅ Commit migrations to Git before applying to prod

**DON'T:**
- ❌ Modify existing migration files (create new ones instead)
- ❌ Include seed data in migrations (use seed.sql)
- ❌ Apply untested migrations to prod
- ❌ Hardcode IDs or references to generated values
- ❌ Skip migrations (always apply in order)

### Rollback Strategy

**If migration fails in prod:**

```bash
# Option 1: Create rollback migration
supabase migration new "rollback_add_booking_table"

# Edit to reverse changes
code supabase/migrations/<timestamp>_rollback_add_booking_table.sql
```

```sql
-- Rollback migration
DROP TABLE IF EXISTS bookings CASCADE;
```

```bash
# Apply rollback
supabase db push
```

**Option 2: Restore from backup**

```bash
# Supabase automatically backs up daily
# Go to Dashboard → Database → Backups
# Select backup and restore
```

---

## Best Practices

### Environment Hygiene

1. **Never mix environments**
   - Local dev → Always use dev Supabase
   - Staging/preview → Use dev Supabase
   - Production → Only use prod Supabase

2. **Keep environments in sync**
   - Apply migrations to dev first
   - Test thoroughly
   - Apply to prod only after verification

3. **Protect production data**
   - Never run `supabase db reset` on prod
   - Never apply untested migrations to prod
   - Always have recent backups

### Git Workflow

1. **Feature branches are short-lived**
   - Create branch → Make changes → PR → Merge → Delete
   - Target: 1-3 days max per branch

2. **Main branch is always deployable**
   - All tests pass
   - Migrations tested in dev
   - Code reviewed and approved

3. **Commit migrations with code**
   - Migration file + application code in same PR
   - Ensures schema and code stay in sync

### Security

1. **Environment variables**
   - Never commit `.env.local` to Git
   - Use Vercel dashboard to manage secrets
   - Rotate keys if compromised

2. **Service role keys**
   - Only use server-side (never in browser)
   - Different keys for dev/prod
   - Limit access to trusted developers

3. **Database access**
   - Use RLS policies for all tables
   - Test policies in dev before prod
   - Audit admin access regularly

---

## Troubleshooting

### Supabase CLI Issues

**Problem:** `supabase: command not found`

```bash
# Reinstall globally
npm install -g supabase

# Verify installation
supabase --version
```

**Problem:** `Failed to link project`

```bash
# Check project ref is correct
# Go to Supabase Dashboard → Settings → General → Reference ID

# Try login again
supabase login

# Link with full project ref
supabase link --project-ref <exact-project-ref>
```

**Problem:** `Migration already applied`

```bash
# Check migration status
supabase migration list

# If migration is marked as applied but schema is wrong:
# Create a new migration to fix the issue
supabase migration new "fix_schema_issue"
```

### Environment Variable Issues

**Problem:** Wrong Supabase project in local dev

```bash
# Check current .env.local
cat apps/web/.env.local

# Update to dev project URLs
code apps/web/.env.local

# Restart dev server
pnpm dev
```

**Problem:** Vercel deployment uses wrong environment

```bash
# Check Vercel environment variables
vercel env ls

# Update specific variable
vercel env rm NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL

# Redeploy
vercel --prod
```

### Migration Issues

**Problem:** Migration fails with foreign key error

```bash
# Check if referenced table exists
# Add dependency tables first in migration

# Example: Create parent table before child
CREATE TABLE categories (...);
CREATE TABLE providers (
  category_code TEXT REFERENCES categories(code)
);
```

**Problem:** Migration applied to wrong environment

```bash
# Check which project is linked
supabase link --project-ref <correct-project-ref>

# If migration was applied to wrong environment:
# 1. Create rollback migration
# 2. Apply to wrong environment
# 3. Apply correct migration to correct environment
```

---

## Summary

### Environment Setup Checklist

- [ ] Supabase CLI installed and logged in
- [ ] Two Supabase projects created (dev + prod)
- [ ] Baseline migration created from current schema
- [ ] Baseline migration applied to both environments
- [ ] Seed data created for dev environment
- [ ] Two Vercel projects created (dev + prod)
- [ ] Environment variables configured in Vercel
- [ ] Local `.env.local` points to dev Supabase
- [ ] Auto-deployment configured for main branch
- [ ] Team members have access to both environments

### Daily Workflow

```bash
# Morning: Pull latest changes
git checkout main
git pull

# Create feature branch
git checkout -b feat/my-feature

# Make changes and test locally (against dev)
pnpm dev

# If database changes needed:
supabase migration new "my_change"
# Edit migration file
supabase db push  # Apply to dev

# Commit and push
git add .
git commit -m "feat: add my feature"
git push origin feat/my-feature

# Open PR → Review → Merge to main
# Vercel auto-deploys to both dev and prod

# Apply migration to prod (after deployment)
supabase link --project-ref <prod-ref>
supabase db push
```

---

**Next Steps:**
1. Complete migration from current setup (Steps 1-6 above)
2. Update team documentation with new workflow
3. Train team on Supabase CLI usage
4. Set up CI/CD for automated migration application (future)

**Related Documentation:**
- [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md) - Development workflows
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [ROADMAP.md](./ROADMAP.md) - Development plan
