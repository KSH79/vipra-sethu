# Development Roadmap

## Vipra Sethu development plan and task tracking

**Last Updated:** 08-Nov-2025

---

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

## Task List by Area

### 🎯 Top 10 Backlog (Next Priority Tasks)

**These are the most impactful tasks selected from across all areas based on current MVP needs and dependencies:**

- [ ] **Complete authentication integration** - Critical foundation that blocks all protected features and admin functionality
- [ ] **Implement photo upload with signed URLs** - Essential for provider profiles, builds trust and enables visual verification
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

#### ✅ Completed (Phase 0)

- [x] Homepage hero section
- [x] Provider directory UI  
- [x] Provider detail page
- [x] Onboarding form (multi-step)
- [x] Admin approval dashboard
- [x] Filter UI (category, language, location)
- [x] WhatsApp/phone contact buttons

#### 📋 Planned (Phase 1)

- [ ] Loading states for all pages
- [ ] Error states and messages
- [ ] Success confirmations
- [ ] Empty states (no results)

#### 📋 Planned (Phase 2)

- [ ] Admin rejection flow UI
- [ ] Admin audit log viewer

#### 💡 Backlog (Phase 2+)

- [ ] Provider profile editing
- [ ] Search autocomplete
- [ ] Booking request form
- [ ] Reviews and ratings UI

---

### 💻 Frontend Development

#### ✅ Completed (Phase 0)

- [x] Next.js 14 App Router setup
- [x] Tailwind CSS configuration
- [x] Supabase client setup
- [x] TypeScript types for all entities
- [x] React Hook Form + Zod validation
- [x] Search RPC integration

#### 🚧 In Progress (Phase 1)

- [ ] Authentication integration

#### 📋 Planned (Phase 1)

- [ ] Login/logout UI
- [ ] Protected routes middleware
- [ ] Photo upload with validation
- [ ] Signed URL display for photos
- [ ] Pagination for provider list
- [ ] Form error handling

#### 📋 Planned (Phase 2)

- [ ] Admin bulk actions

#### 💡 Backlog (Phase 2+)

- [ ] Real-time search results
- [ ] Provider favorites/bookmarks
- [ ] Mobile app (React Native)

---

### 🗄️ Backend & Database

#### ✅ Completed (Phase 0)

- [x] PostgreSQL schema design
- [x] Clean taxonomy (categories, sampradayas)
- [x] Row Level Security policies
- [x] Supabase Storage bucket
- [x] RPC search function
- [x] Provider details RPC

#### 📋 Planned (Phase 1)

- [ ] Admin functions (approve/reject)
- [ ] Signed URL generation
- [ ] Rate limiting on onboarding
- [ ] File upload validation

#### 📋 Planned (Phase 1-2)

- [ ] Admin action audit logging
- [ ] Provider statistics RPC

#### 💡 Backlog (Phase 2+)

- [ ] Search relevance scoring
- [ ] Typo tolerance in search
- [ ] Booking system tables
- [ ] Reviews and ratings tables
- [ ] Migrate to Typesense/Meilisearch

---

### 🔐 Security & Auth

#### 🚧 In Progress (Phase 1)

- [ ] Supabase Auth setup

#### 📋 Planned (Phase 1)

- [ ] Magic link authentication
- [ ] Auth callback route
- [ ] Session management
- [ ] Admin email allowlist check
- [ ] Protect admin routes
- [ ] Protect onboarding route
- [ ] MFA for admins (TOTP)
- [ ] Recovery codes for MFA

#### 📋 Planned (Phase 2)

- [ ] Rate limiting on login

#### 💡 Backlog (Phase 2+)

- [ ] Security headers
- [ ] CAPTCHA on onboarding

---

### 🚀 Infrastructure & DevOps

#### ✅ Completed (Phase 0)

- [x] Environment strategy defined (dev/prod separation)
- [x] Supabase CLI setup documented
- [x] Migration workflow established

#### 📋 Planned (Phase 1)

- [ ] Create dev Supabase project
- [ ] Create prod Supabase project
- [ ] Baseline migration from current schema
- [ ] Vercel dev project creation
- [ ] Vercel prod project creation
- [ ] Environment variables setup (Vercel)
- [ ] Vercel Analytics enable
- [ ] Production deployment
- [ ] Custom domain setup

#### 📋 Planned (Phase 2)

- [ ] Preview deployments for PRs
- [ ] GitHub Actions CI/CD

#### 💡 Backlog (Phase 2+)

- [ ] Automated testing in CI
- [ ] Database backups
- [ ] Monitoring alerts
- [ ] CDN for images

---

### 📊 Analytics & Monitoring

#### ✅ Completed (Phase 0)

- [x] PostHog integration
- [x] Event tracking (search, view, contact)
- [x] Conversion funnels
- [x] Provider view tracking
- [x] Contact conversion tracking

#### 📋 Planned (Phase 1)

- [ ] Vercel Analytics
- [ ] Sentry error tracking

#### 📋 Planned (Phase 2)

- [ ] Sentry performance monitoring
- [ ] Admin dashboard analytics

#### 💡 Backlog (Phase 2+)

- [ ] Search analytics
- [ ] User feedback mechanism

---

### 📝 Documentation

#### ✅ Completed (Phase 0)

- [x] README.md (entry point)
- [x] DEVELOPER-GUIDE.md
- [x] ARCHITECTURE.md
- [x] PRODUCT.md

#### ✅ Completed (Phase 0)

- [x] ROADMAP.md (this file)
- [x] ENVIRONMENT-SETUP.md (dev/prod environment guide)

#### 📋 Planned (Phase 1)

- [ ] OPERATIONS.md

#### 💡 Backlog (Phase 2+)

- [ ] API documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide
- [ ] Contributing guidelines

---

### 🧪 Testing & Quality

#### 📋 Planned (Phase 1)

- [ ] Manual testing checklist

#### 📋 Planned (Phase 2)

- [ ] Playwright E2E setup
- [ ] Test: Onboarding flow
- [ ] Test: Admin approval
- [ ] Test: Search and filter
- [ ] Test: Contact provider

#### 💡 Backlog (Phase 2+)

- [ ] Unit tests for utilities
- [ ] Visual regression testing
- [ ] Performance testing

---

### 🌍 Internationalization & Accessibility

#### 📋 Planned (Phase 2)

- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Color contrast audit
- [ ] Semantic HTML

#### 💡 Backlog (Phase 2+)

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
- [ ] Add photo upload validation
- [ ] Generate signed URLs for photos
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
