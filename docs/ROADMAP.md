# Development Roadmap

**Vipra Sethu development plan and task tracking**

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

### 🎨 Product & Design

| Task | Priority | Status | Phase | Notes |
|------|----------|--------|-------|-------|
| Homepage hero section | Must | ✅ Done | 0 | Completed |
| Provider directory UI | Must | ✅ Done | 0 | Completed |
| Provider detail page | Must | ✅ Done | 0 | Completed |
| Onboarding form (multi-step) | Must | ✅ Done | 0 | Completed |
| Admin approval dashboard | Must | ✅ Done | 0 | Completed |
| Filter UI (category, language, location) | Must | ✅ Done | 0 | Completed |
| WhatsApp/phone contact buttons | Must | ✅ Done | 0 | Completed |
| Loading states for all pages | Should | 📋 Planned | 1 | Spinners, skeletons |
| Error states and messages | Should | 📋 Planned | 1 | User-friendly errors |
| Success confirmations | Should | 📋 Planned | 1 | After onboarding, contact |
| Empty states (no results) | Should | 📋 Planned | 1 | Helpful suggestions |
| Admin rejection flow UI | Should | 📋 Planned | 2 | Modal with reason |
| Admin audit log viewer | Should | 📋 Planned | 2 | `/admin/audit-log` page |
| Provider profile editing | Could | 💡 Backlog | 2 | After approval |
| Search autocomplete | Could | 💡 Backlog | 2 | Suggestions as you type |
| Booking request form | Could | 💡 Backlog | 3 | Calendar integration |
| Reviews and ratings UI | Could | 💡 Backlog | 3 | Star ratings, comments |

---

### 💻 Frontend Development

| Task | Priority | Status | Phase | Notes |
|------|----------|--------|-------|-------|
| Next.js 14 App Router setup | Must | ✅ Done | 0 | With TypeScript |
| Tailwind CSS configuration | Must | ✅ Done | 0 | Custom colors |
| Supabase client setup | Must | ✅ Done | 0 | Client + server |
| TypeScript types for all entities | Must | ✅ Done | 0 | Providers, categories, etc. |
| React Hook Form + Zod validation | Must | ✅ Done | 0 | Onboarding form |
| Authentication integration | Must | 🚧 In Progress | 1 | Magic links |
| Login/logout UI | Must | 📋 Planned | 1 | Simple email form |
| Protected routes middleware | Must | 📋 Planned | 1 | Auth check |
| Photo upload with validation | Must | 📋 Planned | 1 | File type, size limits |
| Signed URL display for photos | Must | 📋 Planned | 1 | 15-min expiry |
| Search RPC integration | Must | ✅ Done | 0 | Filters working |
| Pagination for provider list | Should | 📋 Planned | 1 | 50 per page |
| Form error handling | Should | 📋 Planned | 1 | Inline validation |
| Admin bulk actions | Should | 📋 Planned | 2 | Approve/reject multiple |
| Real-time search results | Could | 💡 Backlog | 2 | As you type |
| Provider favorites/bookmarks | Could | 💡 Backlog | 2 | Save for later |
| Mobile app (React Native) | Could | 💡 Backlog | 3 | iOS + Android |

---

### 🗄️ Backend & Database

| Task | Priority | Status | Phase | Notes |
|------|----------|--------|-------|-------|
| PostgreSQL schema design | Must | ✅ Done | 0 | All tables created |
| Clean taxonomy (categories, sampradayas) | Must | ✅ Done | 0 | Normalized |
| Row Level Security policies | Must | ✅ Done | 0 | Public read, admin write |
| Supabase Storage bucket | Must | ✅ Done | 0 | Private photos |
| RPC search function | Must | ✅ Done | 0 | Text + filters |
| Provider details RPC | Must | ✅ Done | 0 | Full profile |
| Admin functions (approve/reject) | Must | 📋 Planned | 1 | With audit log |
| Signed URL generation | Must | 📋 Planned | 1 | Service role |
| Rate limiting on onboarding | Must | 📋 Planned | 1 | Prevent spam |
| File upload validation | Must | 📋 Planned | 1 | Server-side |
| Admin action audit logging | Should | 📋 Planned | 1 | Track all changes |
| Provider statistics RPC | Should | 📋 Planned | 2 | Dashboard metrics |
| Search relevance scoring | Should | 💡 Backlog | 2 | Better ordering |
| Typo tolerance in search | Should | 💡 Backlog | 2 | Trigram similarity |
| Booking system tables | Could | 💡 Backlog | 3 | Requests, confirmations |
| Reviews and ratings tables | Could | 💡 Backlog | 3 | User feedback |
| Migrate to Typesense/Meilisearch | Could | 💡 Backlog | 3 | If >10k providers |

---

### 🔐 Security & Auth

| Task | Priority | Status | Phase | Notes |
|------|----------|--------|-------|-------|
| Supabase Auth setup | Must | 🚧 In Progress | 1 | @supabase/ssr |
| Magic link authentication | Must | 📋 Planned | 1 | Passwordless |
| Auth callback route | Must | 📋 Planned | 1 | Handle redirects |
| Session management | Must | 📋 Planned | 1 | Cookies, refresh |
| Admin email allowlist check | Must | 📋 Planned | 1 | Middleware |
| Protect admin routes | Must | 📋 Planned | 1 | `/admin/*` |
| Protect onboarding route | Must | 📋 Planned | 1 | Require auth |
| MFA for admins (TOTP) | Should | 📋 Planned | 1 | Google Authenticator |
| Recovery codes for MFA | Should | 📋 Planned | 1 | Backup access |
| Rate limiting on login | Should | 📋 Planned | 2 | Prevent brute force |
| Security headers | Should | 💡 Backlog | 2 | CSP, HSTS, etc. |
| CAPTCHA on onboarding | Could | 💡 Backlog | 2 | hCaptcha or Turnstile |

---

### 🚀 Infrastructure & DevOps

| Task | Priority | Status | Phase | Notes |
|------|----------|--------|-------|-------|
| Vercel project creation | Must | 📋 Planned | 1 | Connect GitHub |
| Environment variables setup | Must | 📋 Planned | 1 | All keys configured |
| Vercel Analytics enable | Must | 📋 Planned | 1 | Core Web Vitals |
| Production deployment | Must | 📋 Planned | 1 | First deploy |
| Custom domain setup | Should | 📋 Planned | 1 | vipra-sethu.com |
| Preview deployments for PRs | Should | 📋 Planned | 2 | Auto-deploy |
| GitHub Actions CI/CD | Should | 📋 Planned | 2 | Lint, type-check, build |
| Automated testing in CI | Should | 💡 Backlog | 2 | Playwright E2E |
| Database backups | Should | 💡 Backlog | 2 | Supabase auto-backup |
| Monitoring alerts | Should | 💡 Backlog | 2 | Sentry, PostHog |
| CDN for images | Could | 💡 Backlog | 3 | If performance issues |

---

### 📊 Analytics & Monitoring

| Task | Priority | Status | Phase | Notes |
|------|----------|--------|-------|-------|
| PostHog integration | Must | ✅ Done | 0 | User analytics |
| Event tracking (search, view, contact) | Must | ✅ Done | 0 | Core events |
| Conversion funnels | Must | ✅ Done | 0 | Onboarding flow |
| Vercel Analytics | Must | 📋 Planned | 1 | Performance metrics |
| Sentry error tracking | Must | 📋 Planned | 1 | Client + server |
| Sentry performance monitoring | Should | 📋 Planned | 2 | Slow queries |
| Admin dashboard analytics | Should | 📋 Planned | 2 | Approval stats |
| Search analytics | Should | 💡 Backlog | 2 | Popular queries |
| Provider view tracking | Should | ✅ Done | 0 | Profile engagement |
| Contact conversion tracking | Should | ✅ Done | 0 | Click tracking |
| User feedback mechanism | Could | 💡 Backlog | 2 | Report errors |

---

### 📝 Documentation

| Task | Priority | Status | Phase | Notes |
|------|----------|--------|-------|-------|
| README.md (entry point) | Must | ✅ Done | 0 | Quick start guide |
| DEVELOPER-GUIDE.md | Must | ✅ Done | 0 | Local setup, Git workflow |
| ARCHITECTURE.md | Must | ✅ Done | 0 | System design + ADRs |
| PRODUCT.md | Must | ✅ Done | 0 | Vision, personas, features |
| ROADMAP.md (this file) | Must | 🚧 In Progress | 0 | Development plan |
| OPERATIONS.md | Must | 📋 Planned | 1 | Monitoring, runbooks |
| API documentation | Should | 💡 Backlog | 2 | RPC functions |
| Deployment guide | Should | 💡 Backlog | 2 | Step-by-step |
| Troubleshooting guide | Should | 💡 Backlog | 2 | Common issues |
| Contributing guidelines | Could | 💡 Backlog | 2 | For open source |

---

### 🧪 Testing & Quality

| Task | Priority | Status | Phase | Notes |
|------|----------|--------|-------|-------|
| Manual testing checklist | Must | 📋 Planned | 1 | Before launch |
| Playwright E2E setup | Should | 📋 Planned | 2 | Critical paths |
| Test: Onboarding flow | Should | 📋 Planned | 2 | End-to-end |
| Test: Admin approval | Should | 📋 Planned | 2 | End-to-end |
| Test: Search and filter | Should | 📋 Planned | 2 | End-to-end |
| Test: Contact provider | Should | 📋 Planned | 2 | WhatsApp/phone |
| Unit tests for utilities | Could | 💡 Backlog | 2 | Helper functions |
| Visual regression testing | Could | 💡 Backlog | 3 | Screenshot diffs |
| Performance testing | Could | 💡 Backlog | 3 | Load testing |

---

### 🌍 Internationalization & Accessibility

| Task | Priority | Status | Phase | Notes |
|------|----------|--------|-------|-------|
| Keyboard navigation | Should | 📋 Planned | 2 | Tab order, focus |
| ARIA labels | Should | 📋 Planned | 2 | Screen readers |
| Color contrast audit | Should | 📋 Planned | 2 | WCAG AA |
| Semantic HTML | Should | 📋 Planned | 2 | Proper headings |
| Define i18n strategy | Could | 💡 Backlog | 2 | Kannada + English? |
| Translate UI labels | Could | 💡 Backlog | 3 | Key pages |
| Language switcher | Could | 💡 Backlog | 3 | UI component |

---

### 🎯 Future Features (V2+)

| Task | Priority | Status | Phase | Notes |
|------|----------|--------|-------|-------|
| Booking system | Could | 💡 Backlog | 3 | Request + confirm |
| Reviews and ratings | Could | 💡 Backlog | 3 | After service |
| Provider recommendations | Could | 💡 Backlog | 3 | Based on history |
| Email notifications | Could | 💡 Backlog | 3 | New providers |
| Mobile app (iOS/Android) | Could | 💡 Backlog | 3 | React Native |
| Multi-language interface | Could | 💡 Backlog | 3 | Kannada, Tamil, Hindi |
| Community events calendar | Could | 💡 Backlog | 3 | Festivals, rituals |
| Provider badges system | Could | 💡 Backlog | 3 | Verified, Experienced |
| Reference system | Could | 💡 Backlog | 3 | User testimonials |
| Advanced search (Typesense) | Could | 💡 Backlog | 3 | If >10k providers |

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
```
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
