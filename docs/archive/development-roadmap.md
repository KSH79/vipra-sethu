# Vipra Sethu — Development Roadmap

**Last Updated:** 2025-11-05  
**Purpose:** Complete guide to recreate this app from scratch  
**SYNC STATUS**: This document is kept in sync with the current development state. Any feature implementation, modification, or removal must be reflected here.

---

## 🏗️ Architecture Overview

### Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Storage**: Supabase Storage for provider photos
- **Deployment**: Vercel (frontend) + Supabase (backend)
- **Package Manager**: pnpm with Turborepo
- **Authentication**: Supabase Auth (magic links)
- **Forms**: React Hook Form + Zod validation

### Project Structure

``` bash
vipra-sethu/
├── apps/
│   └── web/                 # Next.js frontend
│       ├── app/            # App router pages
│       ├── components/     # Reusable React components
│       ├── lib/           # Utilities and services
│       └── public/        # Static assets
├── docs/                  # Documentation
├── infra/
│   └── supabase/         # Database migrations and schemas
└── package.json          # Workspace configuration
```

---

## ✅ COMPLETED: Foundation & Database

### Database Schema ✅

**Files:** `infra/supabase/06_clean_taxonomy_tables.sql`, `infra/supabase/07_clean_rpc_and_views.sql`

- [x] **Core Tables**: `providers`, `categories`, `sampradayas`, `admins`
- [x] **Taxonomy Design**: Normalized categories with `code` as primary identifier
- [x] **Foreign Keys**: `category_code` and `sampradaya_code` references
- [x] **Provider Fields**: name, phone, whatsapp, photo_url, status, languages, location
- [x] **Admin System**: Email-based admin allowlist with action logging

### Security & Policies ✅

**Files:** `infra/supabase/03_update_rls_policies.sql`

- [x] **Row Level Security**: Public read for approved providers, self-RW for own data
- [x] **Admin Policies**: Full access for authenticated admins
- [x] **Storage Policies**: Private bucket with signed URL access
- [x] **API Security**: Service role keys for server-side operations

### Database Functions ✅

**Files:** `infra/supabase/05_update_rpc_functions.sql`, `infra/supabase/rpc_search_providers.sql`

- [x] **Search Function**: `search_providers()` with text, location, taxonomy filters
- [x] **Provider Details**: `get_provider_details()` with full profile data
- [x] **Statistics**: `get_provider_stats()` for admin dashboard
- [x] **PostGIS Integration**: Geographic distance calculations

### Frontend Foundation ✅

**Files:** `apps/web/app/layout.tsx`, `apps/web/components/`, `apps/web/lib/`

- [x] **Next.js Setup**: App router with TypeScript configuration
- [x] **Design System**: TailwindCSS with custom color palette (saffron, ivory)
- [x] **Component Library**: Button, Card, Input, Form components
- [x] **Supabase Client**: Server and client-side configuration
- [x] **Type Safety**: Complete TypeScript types for all entities

### Core Pages ✅

**Files:** `apps/web/app/` directory

- [x] **Homepage**: Hero section, value proposition, navigation
- [x] **Providers List**: Search interface with filters and pagination
- [x] **Provider Detail**: Individual provider profiles with contact CTAs
- [x] **Onboarding Form**: Multi-step provider registration with photo upload
- [x] **Admin Dashboard**: Approval queue with bulk actions

---

## 🔴 PHASE 1: CRITICAL (Before Alpha Launch)

### 1. Performance Monitoring with PostHog

**Priority:** High | **Estimated:** 4-5 hours

#### 1.1 Analytics Setup

- [x] **PostHog Integration**: Install `posthog-js` for user analytics
- [x] **Event Tracking**: Track user behavior (search, views, contact attempts)
- [x] **Conversion Monitoring**: Monitor conversion rates
- [x] **Funnel Analysis**: Set up funnels for onboarding flow
- [x] **Vercel Analytics**: Core Web Vitals monitoring

#### 1.2 Error Tracking

- [x] **Sentry Setup**: Install `@sentry/nextjs` for error monitoring
  [ ] In Vercel: Project Settings → Environment Variables → NEXT_PUBLIC_SENTRY_DSN
- [ ] **Performance Monitoring**: Track slow queries and API calls
- [ ] **User Feedback**: Error reporting mechanism for users

### 1.a Vercel Project Setup (New)

**Priority:** High | **Estimated:** 1-2 hours

- [ ] Create Vercel project and connect GitHub repository
- [ ] Set Framework Preset to Next.js (build command auto)
- [ ] Configure environment variables
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_POSTHOG_KEY` (optional)
  - [ ] `NEXT_PUBLIC_POSTHOG_HOST` (optional, default: <https://app.posthog.com>)
  - [ ] `NEXT_PUBLIC_SENTRY_DSN` (optional until Sentry is ready)
  - [ ] `NEXT_PUBLIC_APP_URL`
- [ ] Enable Vercel Analytics in project settings
- [ ] Set preview deployments for PRs (optional)
- [ ] Add custom domain (later)
  
  Repo to connect: `vipra-sethu/vipra-sethu-app`  
  Status: Git repo initialized and pushed to `main`; Vercel project creation pending

### 2. MFA for Admin Security

**Priority:** High | **Estimated:** 3-4 hours

#### 2.1 TOTP Authentication

- [ ] **Enable TOTP**: Configure TOTP authentication in Supabase
- [ ] **Google Authenticator**: Integration with authenticator apps
- [ ] **Recovery Codes**: Add backup recovery codes
- [ ] **Admin Dashboard Security**: Secure admin dashboard access
- [ ] **MFA Enforcement**: Require MFA for all admin accounts

### 3. Authentication System ✅

**Priority:** Critical | **Estimated:** 4-6 hours

#### 3.1 Supabase Auth Integration ✅

- [x] **Install Auth Package**: `pnpm add @supabase/ssr`
- [x] **Create Auth Helpers**:
  - `lib/supabaseClient.ts` - Client-side auth with cookie persistence
  - Update `lib/supabaseServer.ts` - Server-side auth with session handling
- [x] **Auth Callback Route**: `app/auth/callback/route.ts` - Handle magic link redirects
- [x] **Middleware**: `middleware.ts` - Protect admin routes, refresh sessions

#### 3.2 Login/Signup Flow ✅

- [x] **Login Page**: `app/login/page.tsx` - Email magic link form
- [x] **Signup Integration**: Add user creation to onboarding flow
- [x] **Session Management**: Display user state, logout functionality
- [x] **Protected Routes**: Require auth for onboarding, admin access

#### 3.3 Admin Authentication ✅

- [x] **Admin Check**: Verify user email against `admins` table
- [x] **Role-based Access**: Middleware to protect `/admin/*` routes
- [x] **UI Integration**: Show admin features only to authenticated admins

**Implementation Notes:**

- Use magic links (no passwords) for simplicity
- Store user_id in providers table for ownership
- Implement session persistence across page reloads

### 4. Photo Management System ✅

**Priority:** Critical | **Estimated:** 3-4 hours

#### 4.1 Signed URL Generation ✅

- [x] **Storage Helper**: `lib/storage.ts` - Generate signed URLs with TTL
- [x] **Service Role Client**: Separate Supabase client for admin operations
- [x] **URL Caching**: Cache signed URLs to avoid regeneration

#### 4.2 Photo Display ✅

- [x] **Provider Photos**: Show photos on detail pages with fallback
- [x] **List Thumbnails**: Optimize photo display in provider grid
- [x] **Upload Validation**: File type, size limits in onboarding API
- [x] **Error Handling**: Graceful fallback for missing/corrupted photos

**Implementation Notes:**

- Use 15-minute TTL for signed URLs
- Implement lazy loading for performance
- Add photo upload progress indicators

### 5. Search & Filtering Enhancement ✅

**Priority:** Critical | **Estimated:** 4-5 hours

#### 5.1 Search UI Components ✅

- [x] **Filter Form**: Enhanced search form with all taxonomy filters
- [x] **Category Dropdown**: Populate from `categories` table
- [x] **Language Multi-select**: Checkbox group for language filtering
- [x] **Sampradaya Dropdown**: Populate from `sampradayas` table
- [x] **Location Filter**: Geolocation with radius slider

#### 5.2 Advanced Filters ✅

- [x] **Multi-language Support**: 14 common Indian languages
- [x] **Location-based Search**: Current location + radius (1-100km)
- [x] **Active Filter Display**: Visual badges with clear options
- [x] **Responsive Design**: Mobile-friendly filter layout

**Implementation Notes:**

- Use dynamic taxonomy loading from database
- Implement geolocation API for current location
- Add visual feedback for active filters
- Support keyboard navigation and accessibility

### 6. Contact CTAs & Analytics ✅

**Priority:** High | **Estimated:** 2-3 hours

#### 6.1 Contact Integration ✅

- [x] **WhatsApp Links**: Direct WhatsApp messaging from provider cards with wa.me format
- [x] **Phone Links**: Click-to-call functionality with tel: links
- [x] **Message Templates**: Pre-filled messages for general, ritual, and consultation contexts
- [x] **International Support**: Proper phone number formatting for global numbers

#### 6.2 Analytics Enhancement ✅

- [x] **Contact Tracking**: Enhanced analytics for contact attempts with context
- [x] **Provider Views**: Monitor provider profile engagement
- [x] **Contact Conversions**: Track contact clicks and successful connections
- [x] **Context Analytics**: Track where contacts originate (cards, detail pages, search results)

**Implementation Notes:**

- Use wa.me/{phone}?text={message} format for WhatsApp deep links
- Implement tel: links for click-to-call functionality
- Add context-aware message templates for different service types
- Track contact events with enhanced analytics for conversion optimization

### 7. MFA for Admin Security

**Priority:** High | **Estimated:** 3-4 hours

#### 7.1 TOTP Authentication

- [ ] **Enable TOTP**: Configure TOTP authentication in Supabase
- [ ] **Google Authenticator**: Integration with authenticator apps
- [ ] **Recovery Codes**: Add backup recovery codes
- [ ] **Admin Dashboard Security**: Secure admin dashboard access
- [ ] **MFA Enforcement**: Require MFA for all admin accounts

#### 7.2 Security Enhancements

- [ ] **Session Management**: Enhanced session timeout and refresh
- [ ] **Audit Logging**: Track admin actions and MFA usage
- [ ] **Security Headers**: Implement additional security headers
- [ ] **Rate Limiting**: Prevent brute force attacks on admin login

**Implementation Notes:**

- Use Supabase Auth MFA features for TOTP implementation
- Store recovery codes securely in database
- Add MFA setup flow for admin users
- Implement fallback authentication methods

---

## PHASE 2: IMPORTANT (Before Pilot Launch)

### 7. Enhanced Search Experience

**Priority:** Medium | **Estimated:** 5-6 hours

#### 7.1 Autocomplete & Suggestions

- [ ] **Autocomplete Suggestions**: Add search suggestions as user types
- [ ] **Search History**: Store and display recent searches
- [ ] **Popular Searches**: Show trending provider categories
- [ ] **Real-time Results**: Display results while typing

#### 7.2 Faceted Filters

- [ ] **Category Filters**: Implement faceted category filters
- [ ] **Location Filters**: Add city-based and radius-based location filtering
- [ ] **Language Filters**: Multi-select language filtering with counts
- [ ] **Sampradaya Filters**: Enhanced sampradaya filtering

#### 7.3 Search Result Sorting

- [ ] **Relevance Sorting**: Sort by text relevance and match quality
- [ ] **Distance Sorting**: Sort by geographic proximity
- [ ] **Newest Sorting**: Show recently added providers first
- [ ] **Experience Sorting**: Sort by years of experience

### 8. Better Error Handling

**Priority:** Medium | **Estimated:** 4-5 hours

#### 8.1 Validation Messages

- [ ] **Proper Validation Messages**: Clear, actionable error messages
- [ ] **Field-level Errors**: Show errors next to specific form fields
- [ ] **Error Types**: Differentiate between validation, network, and server errors
- [ ] **Success Messages**: Confirmation messages for successful actions

#### 8.2 User-friendly Error States

- [ ] **Empty States**: Helpful messages when no data is available
- [ ] **Network Error States**: Graceful handling of connectivity issues
- [ ] **Loading Error States**: Show appropriate messages during failures
- [ ] **Retry Mechanisms**: Allow users to retry failed operations

#### 8.3 Retry Mechanisms

- [ ] **Automatic Retry**: Retry failed network requests automatically
- [ ] **Manual Retry**: Provide retry buttons for failed operations
- [ ] **Exponential Backoff**: Implement smart retry timing
- [ ] **Error Recovery**: Recover from common error scenarios

### 9. Server-side Validation

**Priority:** Medium | **Estimated:** 3-4 hours

#### 9.1 API Route Validation

- [ ] **Enhanced API Validation**: Strengthen validation in all API routes
- [ ] **Input Sanitization**: Sanitize all user inputs server-side
- [ ] **Type Validation**: Use Zod schemas for API validation
- [ ] **Rate Limiting**: Implement rate limiting per user/IP

#### 9.2 Security Enhancements

- [ ] **Input Sanitization**: Prevent XSS and injection attacks
- [ ] **Request Size Limits**: Limit payload sizes to prevent abuse
- [ ] **CORS Configuration**: Proper CORS setup for API security
- [ ] **Content Security Policy**: Add CSP headers for additional security

### 10. Admin Workflow Enhancement

**Priority:** High | **Estimated:** 6-8 hours

#### 10.1 Approval System

- [ ] **Rejection Flow**: Add reject button with reason input
- [ ] **Bulk Actions**: Approve/reject multiple providers
- [ ] **Admin Actions Log**: Track all admin decisions with timestamps
- [ ] **Email Notifications**: Notify providers of approval/rejection

#### 10.2 Admin Dashboard

- [ ] **Audit Log Viewer**: `/admin/audit-log` page with filtering
- [ ] **Provider Management**: Edit provider information post-approval
- [ ] **Statistics Dashboard**: Provider counts, approval rates, trends
- [ ] **Search in Admin**: Find providers by name, phone, email

---

## 🟡 PHASE 3: ENHANCEMENTS (Pre-General Release)

### 11. Backup & Recovery

**Priority:** Low | **Estimated:** 3-4 hours

#### 11.1 Point-in-Time Recovery

- [ ] **Enable PITR**: Enable Point-in-Time Recovery in Supabase
- [ ] **Recovery Testing**: Test restore procedures with different time points
- [ ] **Automated Backups**: Set up automated daily/weekly backups
- [ ] **Backup Monitoring**: Monitor backup success/failure notifications

#### 11.2 Storage Backup

- [ ] **Automated Storage Backups**: Set up automated storage backups
- [ ] **External Storage**: Export photos to external storage (S3)
- [ ] **Backup Scheduling**: Schedule weekly storage backups
- [ ] **Restore Testing**: Test storage restore procedures

#### 11.3 Recovery Documentation

- [ ] **Restore Procedures**: Document step-by-step restore processes
- [ ] **Emergency Contacts**: Document emergency recovery contacts
- [ ] **RTO/RPO Documentation**: Define recovery time and point objectives
- [ ] **Disaster Recovery Plan**: Complete disaster recovery runbook

### 12. Advanced Search Features

**Priority:** Medium | **Estimated:** 5-6 hours

#### 12.1 Search Performance

- [ ] **Typo Tolerance**: Trigram similarity for misspellings
- [ ] **Search Ranking**: Optimize relevance scoring algorithm
- [ ] **Query Optimization**: Add composite database indexes
- [ ] **Result Caching**: Cache frequent search results

#### 12.2 Search Analytics

- [ ] **Search Analytics**: Track search patterns and popular queries
- [ ] **No Search Results**: Analyze and improve zero-result searches
- [ ] **Search Performance**: Monitor search query performance
- [ ] **A/B Testing**: Test different search algorithms

### 13. Mobile Optimization

**Priority:** Medium | **Estimated:** 3-4 hours

#### 13.1 Responsive Design

- [ ] **Mobile Navigation**: Hamburger menu with smooth animations
- [ ] **Touch Optimization**: Larger touch targets and gestures
- [ ] **Mobile Forms**: Optimized input types and keyboards
- [ ] **Performance**: Optimize images and loading for mobile

#### 13.2 Mobile Features

- [ ] **Progressive Web App**: PWA capabilities for mobile install
- [ ] **Offline Support**: Basic offline functionality
- [ ] **Push Notifications**: Notify users of relevant updates
- [ ] **Mobile Analytics**: Track mobile-specific user behavior

### 14. Performance Optimization

**Priority:** Medium | **Estimated:** 4-5 hours

#### 14.1 Frontend Performance

- [ ] **Code Splitting**: Implement dynamic imports for better loading
- [ ] **Image Optimization**: Optimize all images with Next.js Image component
- [ ] **Bundle Analysis**: Analyze and optimize bundle sizes
- [ ] **Core Web Vitals**: Optimize LCP, FID, and CLS metrics

#### 14.2 Database Performance

- [ ] **Query Optimization**: Optimize slow database queries
- [ ] **Connection Pooling**: Implement database connection pooling
- [ ] **Index Optimization**: Add missing database indexes
- [ ] **Caching Strategy**: Implement Redis or similar caching layer

---

## 🔵 PHASE 4: ADVANCED FEATURES (Future)

### 15. Multi-factor Authentication (Extended)

**Priority:** Low | **Estimated:** 2-3 hours

- [ ] **TOTP Setup**: Google Authenticator integration for admins (already in Phase 1)
- [ ] **Recovery Codes**: Backup authentication methods (already in Phase 1)
- [ ] **MFA Enforcement**: Require MFA for all admin accounts (already in Phase 1)
- [ ] **User MFA**: Optional MFA for regular users
- [ ] **Hardware Keys**: Support for hardware security keys

### 16. Advanced Features

**Priority:** Low | **Estimated:** 8-10 hours

- [ ] **Call Masking**: Twilio integration for privacy protection
- [ ] **References System**: Provider recommendation and badge system
- [ ] **Internationalization**: Multi-language support (Kannada + English)
- [ ] **Booking System**: Appointment scheduling and management

### 17. Testing & CI/CD

**Priority:** Low | **Estimated:** 6-8 hours

#### 17.1 Testing Framework

- [ ] **E2E Testing**: Playwright setup for critical user flows
- [ ] **Unit Testing**: Jest setup for utility functions
- [ ] **Integration Testing**: API route testing
- [ ] **Visual Testing**: Chromatic or similar for UI testing

#### 17.2 CI/CD Pipeline

- [ ] **GitHub Actions**: Automated testing and deployment
- [ ] **Preview Deployments**: Vercel preview for PRs
- [ ] **Quality Gates**: Linting and type checking in CI
- [ ] **Security Scanning**: Automated security vulnerability scanning

---

## 📋 IMPLEMENTATION CHECKLIST

### Development Environment Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd vipra-sethu

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with Supabase credentials

# 4. Run database migrations
# Use Supabase dashboard to run SQL files in order:
# - 01_alter_providers_table.sql
# - 02_create_new_tables.sql
# - 03_update_rls_policies.sql
# - 04_create_triggers.sql
# - 05_update_rpc_functions.sql
# - 06_clean_taxonomy_tables.sql
# - 07_clean_rpc_and_views.sql

# 5. Start development server
pnpm dev
```

### Database Migration Order

1. **Schema Setup**: `01_alter_providers_table.sql`
2. **New Tables**: `02_create_new_tables.sql`
3. **Security Policies**: `03_update_rls_policies.sql`
4. **Triggers**: `04_create_triggers.sql`
5. **Functions**: `05_update_rpc_functions.sql`
6. **Clean Taxonomy**: `06_clean_taxonomy_tables.sql`
7. **Final Updates**: `07_clean_rpc_and_views.sql`

### Environment Variables Required

```env
# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Deployment Checklist

- [ ] **Vercel Setup**: Connect repository, configure environment variables
- [ ] **Supabase Production**: Create production project, run migrations
- [ ] **Domain Configuration**: Set up custom domain and SSL
- [ ] **Monitoring**: Set up Sentry and PostHog for production
- [ ] **Backup**: Enable PITR and configure backup schedules

---

## 🎯 SUCCESS METRICS

### Alpha Launch Criteria

- [ ] Users can search and view approved providers
- [ ] Providers can onboard with photo upload
- [ ] Admins can approve/reject providers
- [ ] Basic authentication and authorization working
- [ ] Mobile-responsive design implemented

### Pilot Launch Criteria

- [ ] Enhanced search with filters working
- [ ] Contact CTAs (WhatsApp/Phone) functional
- [ ] Admin dashboard with audit log complete
- [ ] Error handling and validation robust
- [ ] Analytics and monitoring set up

### General Release Criteria

- [ ] Performance optimized (Core Web Vitals green)
- [ ] Security hardened (MFA, rate limiting)
- [ ] Multi-language support (if required)
- [ ] Advanced features (call masking, references)
- [ ] Complete documentation and runbooks

---

## 📚 DOCUMENTATION INDEX

### Technical Documentation

- `docs/00-vision.md` - Product vision and requirements
- `docs/01-product-brief.md` - Product specification
- `docs/11-data-model-and-schemas.md` - Database schema documentation
- `docs/CLEAN-TAXONOMY-IMPLEMENTATION.md` - Taxonomy system guide
- `infra/supabase/README.md` - Database setup and migration guide

### Development Guides

- `docs/moving_to_fastapi.md` - Backend architecture decision
- `docs/development-roadmap.md` - This comprehensive development guide
- `CONTRIBUTING.md` - Development guidelines and PR process
- `README.md` - Project overview and quick start

### Architecture Records

- `docs/21-adr/` - Architecture Decision Records
- `docs/22-rfc/` - Request for Comments documents

---

## 🚀 QUICK START FOR NEW DEVELOPERS

1. **Read the Vision**: Start with `docs/00-vision.md` to understand the product
2. **Set Up Environment**: Follow the development environment setup above
3. **Run Database Migrations**: Execute SQL files in the specified order
4. **Explore the Code**: Review `apps/web/app/` to understand page structure
5. **Check Components**: Browse `apps/web/components/` for reusable UI elements
6. **Understand Data Flow**: Review `apps/web/lib/services/taxonomy.ts` for database interactions

---

## 📝 DETAILED TASK BREAKDOWN

### Phase 1 Task Details

#### Authentication System Implementation

Step 1: Install Dependencies

```bash
cd apps/web
pnpm add @supabase/ssr
```

**Step 2: Create Auth Client (`apps/web/lib/supabaseClient.ts`)**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 3: Update Server Client (`apps/web/lib/supabaseServer.ts`)**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

**Step 4: Create Middleware (`apps/web/middleware.ts`)**

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    
    // Check if user is admin
    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('email', session.user.email!)
      .single()
    
    if (!admin) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*']
}
```

#### Photo Management Implementation

**Step 1: Create Storage Helper (`apps/web/lib/storage.ts`)**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getSignedUrl(path: string, ttl: number = 900) {
  const { data, error } = await supabaseAdmin.storage
    .from('provider-photos')
    .createSignedUrl(path, ttl)
  
  if (error) throw error
  return data.signedUrl
}

export async function uploadPhoto(file: File, path: string) {
  const { data, error } = await supabaseAdmin.storage
    .from('provider-photos')
    .upload(path, file, {
      contentType: file.type,
      upsert: true
    })
  
  if (error) throw error
  return data.path
}
```

#### Search Enhancement Implementation

**Step 1: Enhanced Search Form Component

```typescript
// apps/web/components/search/ProviderSearchForm.tsx
"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { searchProviders } from '@/lib/services/taxonomy'
import { ProviderFilters } from '@/lib/types/taxonomy'
import { z } from 'zod'

const searchSchema = z.object({
  text: z.string().optional(),
  category_code: z.string().optional(),
  sampradaya_code: z.string().optional(),
  languages: z.array(z.string()).optional(),
  radius_km: z.number().min(1).max(100),
})

export function ProviderSearchForm() {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      radius_km: 15,
      languages: []
    }
  })

  const onSubmit = async (data: ProviderFilters) => {
    setLoading(true)
    try {
      const results = await searchProviders(data)
      // Handle results
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Search form fields */}
    </form>
  )
}
```

---

This roadmap provides a complete path from zero to production. Each phase builds upon the previous one, ensuring a solid foundation before adding complexity.

## Git Workflow

1. Create a remote repo under a new org (https://github.com/vipra-sethu/vipra-sethu-app.git)
2. Run the following commands in the root of the project:

```bash

```

git init

git remote add origin https://github.com/vipra-sethu/vipra-sethu-app.git

git pull origin main

git status

### Ensure you’re on main and working tree is clean

git branch --show-current
git status

git add .

git commit -m "feat: initial commit of Vipra Sethu application with complete frontend"
git commit --amend -m "init: amended initial commit"

git remote -v

git log --oneline -n 3

git push -u origin main

## Auth Options for Private Repo 

### Option A: GitHub CLI (Recommended)

gh auth login
git push -u origin main

### Option B: Personal Access Token

git remote set-url origin https://[YOUR-TOKEN]@[github.com/vipra-sethu/vipra-sethu-app.git]
git push -u origin main

### Option C: SSH (if you have SSH keys set up)

git remote set-url origin https://github.com/KSH79/vipra-sethu.git
git push -u origin main

#### Verify auth and remote read:

gh auth status
git ls-remote origin

--

## Vercel Setup Guide

Follow these steps to deploy the Next.js app on Vercel.

### 1) Create and Link Project

- **Import Git Repository**: `vipra-sethu/vipra-sethu-app`
- Framework Preset: Next.js
- Root directory: `apps/web`
- Build command: auto (Next.js default)
- Output directory: auto

### 2) Environment Variables (Project → Settings → Environment Variables)

Add these for Production and Preview:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Server-side only; never expose in client code)
- `NEXT_PUBLIC_APP_URL` (e.g., https://vipra-sethu.vercel.app)
- `NEXT_PUBLIC_POSTHOG_KEY` (optional)
- `NEXT_PUBLIC_POSTHOG_HOST` (optional, defaults to https://app.posthog.com)
- `NEXT_PUBLIC_SENTRY_DSN` (optional until Sentry is ready)

Reference: `apps/web/.env.example`

### 3) Analytics and Monitoring

- Enable Vercel Analytics
- Verify PostHog loads on production domain
- Verify Sentry DSN is present, then test via `/test-sentry` page

### 4) Preview Deployments

- Enable “Create preview deployments for PRs”
- Protect production with required reviews (optional)

### 5) Domains (Later)

- Add custom domain
- Set `NEXT_PUBLIC_APP_URL` accordingly


#### Wire Git to use your GH token:

gh auth setup-git


#### Overwrite remote (destructive)

Overwrite remote (destructive)

#### Verify default branch

git branch --show-current   # should be 'main'

#### Confirm remote and status:

git remote -v
git status