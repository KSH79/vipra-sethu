# UX Wireframes & Design System

**Updated:** 2025-11-04 12:05
**Status:** Enhanced with world-class UI/UX recommendations

This document defines the complete design system, component specifications, and interaction patterns for Vipra Sethu. All recommendations follow industry best practices from Apple HIG, Material Design, and leading apps like Airbnb, Stripe, and Notion.

## Quick Reference

- Grid with filters; cards show name/category/languages
- Detail with WhatsApp/phone CTA
- Onboarding form; success state
- Admin list with Approve button and audit log

## Architecture Decision

**Use a multi-page app with SPA-like transitions (Next.js App Router)**

**Rationale:**
- ✅ SEO-friendly with shareable URLs for `/providers`, `/providers/[id]`
- ✅ Faster first paint with SSR
- ✅ Simpler analytics & caching
- ✅ Client-side transitions keep it snappy
- ✅ URL-persisted filters for better UX

## Sitemap & Navigation Model

### Top Navigation (desktop)

- Left: Logo (Bridge Mandala) + wordmark “Vipra Sethu”
- Center (on /providers): Search bar (ritual/keyword)
- Right: Providers, Onboard, About, (Admin if role), Call-to-Action: “Add Listing”
- Sticky; shrinks on scroll.

### Mobile Navigation

- Top: Logo + compact search icon (opens full-screen search).
- Bottom tab bar: Home · Search · Onboard · Menu (About, Privacy, Help).
- Keep actions thumb-reachable; WhatsApp/Call buttons big.

## Visual Identity & Design System

- Palette: Ivory #FFF8E7 (base), Saffron #E57C1F (accent), Gold #D4AF37 (highlight), Sandstone #A67B5B (neutrals), Slate text.
- Typography: Humanist sans for body (e.g., Inter/Noto Sans), gentle serif or Devanagari-inspired display for headings.
- Elevation: Soft shadows, 14px rounded corners, lots of white space.
- Iconography: Simple line icons; lotus/bridge/flame only as subtle motifs.
- Accessibility: Contrast ≥ AA; large tap targets; clear focus states.

## Page Blueprints (content hierarchy + components)

### A) Home (/)

- Hero: One-line value prop; primary search input (“Find purohits, cooks, essentials…”), quick chips (Purohit, Cook, Essentials, Senior care, Pilgrimage).
- Why Vipra Sethu: 3 trust pillars (Verified · Community-aligned · Respectful).
- Browse by ritual (chips): Upanayana · Gruha Pravesha · Shraddha · Seemantha…
- CTA: “Add your listing” card.
- Footer: About · Code of Conduct · Privacy · Contact.

### B) Providers (Browse/Search) (/providers)

- Search Bar (sticky):
  - Input with suggestions (rituals, roles, places)
  - Chips/filters: Category, Languages (multi), Sampradaya, Distance slider, Availability (date/time), Urgent toggle.
  - “Clear all” + results count.

- Sort: Relevance · Distance · Newest.

- View toggle (later): List / Map (start with List only).

- Results Grid (Cards) – 1-col mobile, 3-col desktop:
  - Photo/initials avatar
  - Name (bold) + role (e.g., “Vedic Purohit”)
  - Badges: Verified, Sampradaya, Years experience
  - Languages · Area/Distance
  - Optional: “From ₹…” (only if you capture)

- Primary CTAs: WhatsApp · Call · View
- Microcopy: “Responds in ~X hrs” (if tracked later)

- Empty state: “No matches yet.” Suggestions + “Request a callback” form.

### C) Provider Detail (/providers/[id])

- Header: Name, role, badges, location, languages; sticky action bar (WhatsApp, Call, Share).

Sections (accordion or tabs):

1. About (short bio; sampradaya alignment)
2. Rituals performed (tag list)
3. Availability & travel radius (simple text now; scheduler later)
4. Photos (signed URLs)
5. Notes & expectations (dress code, materials list, food purity)
6. Community references (private, if enabled)

- Report / Flag (respectful phrasing).

- Related providers (same category/language nearby).

### D) Onboarding (/onboard)

- Stepper form (3 steps, calm copy):

1. Identity & Contact (name, phone, WhatsApp)
2. Role & Rituals (category, languages[], sampradaya; service radius)
3. Photo upload + Terms/Consent

Success screen: “Submitted for review (24–48h)” + what happens next.

Progress saved (localStorage) in case of accidental exits.

### E) Admin (/admin)

- Queue: Table/list of pending profiles with inline Approve / Ask for changes.
- Detail drawer: Full submission, quick badges, notes, audit log.
- Bulk actions (later), search/filter by category/area.

## Search Experience (gold-standard)

- Predictive suggestions as you type (rituals, roles, places).
- Facet chips that show selected state + “x” to remove; keep URL-synced (shareable searches).
- Distance slider appears after location permission; respectful prompt.
- “Urgent” mode: Prefilter providers who opt-in to accept short-notice requests; show a subtle “⚡ urgent” label.
- Debounce input, show skeleton loaders on results.
- Result feedback: “32 providers found near Udupi · Sorted by Distance”

## Components (reusable)

- SearchBar (w/ suggestions)
- FilterChips (Category, Languages, Sampradaya, Distance, Availability)
- ProviderCard (photo, badges, CTAs)
- Badge (Verified, Sampradaya, Years)
- CTAButtons (WhatsApp, Call, Share) – large on mobile
- EmptyState (icon, tips, CTA)
- Toast/Inline alerts (submission, errors)
- Skeletons (card rows, detail sections)
- StepForm (onboarding)
- AdminRow / AdminDrawer

use cards for providers. They scan well, chunk information, and are perfect for responsive grids

## Micro-interactions & States

- Pressed/hover states for CTAs; subtle ripple on mobile.
- Copy to clipboard for phone numbers (with success toast).
- “Share” → native share sheet (mobile) or copy link (desktop).
- Location prompt with context (“to sort by distance; never shared externally”).
- Empty & error states everywhere; reassure and guide.

## Content & Tone (respectful + clear)

Microcopy avoids transactional language; use “Request”, “Connect”, “Seva”.
Cultural notes shown as info chips (e.g., “Strict vegetarian”, “Follows Madhwa sampradaya”).
No public star ratings in MVP; consider badges and private references instead.

## Performance & Accessibility

- SSR first paint; image optimization; lazy-load below the fold.
- Cache popular searches (e.g., Bengaluru · Purohit).
- Keyboard nav everywhere; ARIA labels on CTAs; focus outlines.
- Keep pages < 150KB JS where possible

## Roadmap UI (later)

- Map view with clustered pins.
- Light bookings: request slot → provider accept/decline (no payments).
- Kits: ritual-specific essentials (sponsored or affiliate) with clear “values-aligned” labels.
- Community programs: volunteer signups, senior care helpline.

## Quick Wireframe

[Sticky Top Bar]
[Logo]  [Search ▢ Ritual/Role/Place...]             [Providers] [Onboard] [About] [Add Listing]

/providers
[Filters: Category ☐  Languages ☐  Sampradaya ☐  Distance ☐  Availability ☐  Urgent ⚡] [Clear All] (32 found)
[Sort: Relevance ▼]                         

[ Card ][ Card ][ Card ]
[ Photo ]  Name — Role      [WhatsApp] [Call]
 Badges   Languages · 4.2 km
 Sampradaya tag

[Pagination or Infinite scroll]

## Tailwind class cheat-sheet

:root {
  --vipra-saffron:#E57C1F; --vipra-gold:#D4AF37; --vipra-ivory:#FFF8E7; --vipra-sandstone:#A67B5B;
}
map them in tailwind.config.js so you can use text-saffron, bg-gold, etc.

### Header / Top Nav

```html
<header class="sticky top-0 z-40 bg-ivory/90 backdrop-blur border-b border-sandstone/20">
  <div class="mx-auto max-w-6xl px-4 h-14 flex items-center gap-3">
    <!-- logo -->
    <a class="flex items-center gap-2" href="/">
      <img class="h-7 w-7" src="/brand/vipra-bridge-mandala.svg" alt="Vipra Sethu">
      <span class="font-semibold tracking-tight">Vipra Sethu</span>
    </a>
    <!-- center search (desktop only) -->
    <div class="hidden md:flex flex-1 max-w-xl mx-auto">
      <!-- drop in SearchBar -->
    </div>
    <!-- right links -->
    <nav class="ml-auto hidden sm:flex items-center gap-4">
      <a class="text-sm hover:text-saffron" href="/providers">Providers</a>
      <a class="text-sm hover:text-saffron" href="/onboard">Onboard</a>
      <a class="text-sm hover:text-saffron" href="/about">About</a>
      <a class="inline-flex items-center px-3 py-1.5 text-sm rounded-full bg-saffron text-white hover:opacity-90">
        Add Listing
      </a>
    </nav>
  </div>
</header>

### SearchBar (predictive)

```html
<form class="relative w-full">
  <input
    class="w-full h-11 rounded-xl border border-sandstone/30 bg-white px-4 pr-10 text-sm
           placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-saffron/50
           shadow-sm"
    placeholder="Find purohits, cooks, essentials…" aria-label="Search"
  />
  <svg class="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sandstone/70" ...></svg>

  <!-- suggestions dropdown -->
  <div class="absolute z-30 mt-1 w-full rounded-xl border border-sandstone/20 bg-white shadow-lg
              divide-y divide-gray-100 hidden data-[open=true]:block">
    <!-- item -->
    <button class="w-full text-left px-4 py-2.5 hover:bg-ivory text-sm">Upanayana</button>
  </div>
</form>

Variants

Container: md:max-w-xl, lg:max-w-2xl

Loading shimmer (input): animate-pulse bg-gray-100

### FilterChips (facets)

<div class="flex flex-wrap items-center gap-2">
  <button class="inline-flex items-center gap-2 rounded-full border border-sandstone/30 bg-white px-3 py-1.5 text-sm
                 hover:border-saffron/50 data-[active=true]:bg-saffron/10 data-[active=true]:border-saffron/60">
    Category <span class="text-sandstone/70">▼</span>
  </button>
  <button class="rounded-full bg-saffron/10 text-saffron px-3 py-1.5 text-sm">Urgent ⚡</button>
  <button class="ml-auto text-sm text-sandstone hover:text-saffron">Clear all</button>
</div>
```

### ProviderCard (grid/list)

```html
<article class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3
                hover:shadow-md transition-shadow">
  <div class="flex items-center gap-3">
    <img class="h-12 w-12 rounded-xl object-cover bg-ivory" src="/api/photo" alt="">
    <div class="min-w-0">
      <h3 class="font-medium truncate">Sharma Avadhani</h3>
      <p class="text-xs text-gray-600">Vedic Purohit • 12 yrs</p>
    </div>
  </div>

  <div class="flex flex-wrap items-center gap-2">
    <!-- Badge -->
    <span class="inline-flex items-center gap-1 rounded-full bg-gold/15 text-[11px] px-2 py-1 text-gold">Verified</span>
    <span class="inline-flex items-center gap-1 rounded-full bg-saffron/10 text-[11px] px-2 py-1 text-saffron">Madhwa</span>
    <span class="text-xs text-gray-600">Kannada · Sanskrit</span>
    <span class="ml-auto text-xs text-gray-500">4.2 km</span>
  </div>

  <div class="flex items-center gap-2">
    <a class="flex-1 inline-flex items-center justify-center h-9 rounded-xl bg-saffron text-white text-sm
              hover:opacity-90">WhatsApp</a>
    <a class="flex-1 inline-flex items-center justify-center h-9 rounded-xl border border-sandstone/30 text-sm
              hover:border-saffron/50">Call</a>
    <a class="h-9 inline-flex items-center justify-center px-3 rounded-xl text-sm text-saffron hover:bg-saffron/10">View</a>
  </div>
</article>
```

Skeleton variant: animate-pulse bg-gray-100 on image bar + h-3 w-24 rounded lines.

### Badge (generic)

```html
<span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]
             bg-saffron/10 text-saffron">Madhwa</span>
<!-- Alternatives -->
<!-- .bg-gold/15 .text-gold   |   .bg-sandstone/10 .text-sandstone -->

### CTA Buttons (primary/secondary/tertiary)

<!-- Primary -->
<button class="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-saffron text-white
               hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-saffron/40">Primary</button>
<!-- Secondary -->
<button class="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-sandstone/30
               hover:border-saffron/60">Secondary</button>
<!-- Tertiary -->
<button class="inline-flex items-center gap-2 h-10 px-3 rounded-xl text-saffron hover:bg-saffron/10">Tertiary</button>
```

### EmptyState

```html
<section class="text-center py-12 rounded-2xl border border-dashed border-sandstone/30 bg-white">
  <div class="mx-auto max-w-md space-y-3">
    <div class="mx-auto h-12 w-12 rounded-full bg-saffron/10 flex items-center justify-center">🪔</div>
    <h4 class="text-lg font-medium">No matches yet</h4>
    <p class="text-sm text-gray-600">Try changing filters or request a callback.</p>
    <button class="mt-2 inline-flex items-center h-9 px-4 rounded-xl bg-saffron text-white">Request callback</button>
  </div>
</section>
```

### Toast/Inline alerts (submission, errors)

```html
<!-- Toast -->
<div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black text-white text-sm px-4 py-2 rounded-full shadow-lg">
  Submitted for review
</div>

<!-- Inline -->
<div class="rounded-xl border border-saffron/30 bg-saffron/10 text-saffron px-3 py-2 text-sm">
  Your profile is pending admin approval.
</div>

### Skeletons (loading)

```html
<!-- Card skeleton -->
<div class="rounded-2xl border border-gray-100 p-4 shadow-sm">
  <div class="flex items-center gap-3">
    <div class="h-12 w-12 rounded-xl bg-gray-100 animate-pulse"></div>
    <div class="flex-1 space-y-2">
      <div class="h-3 w-32 bg-gray-100 rounded animate-pulse"></div>
      <div class="h-3 w-20 bg-gray-100 rounded animate-pulse"></div>
    </div>
  </div>
  <div class="mt-3 h-8 bg-gray-100 rounded animate-pulse"></div>
</div>

### StepForm (Onboarding)

```html
<form class="bg-white rounded-2xl p-5 shadow-sm space-y-4">
  <!-- stepper -->
  <ol class="flex items-center gap-2 text-xs text-gray-600">
    <li class="flex items-center gap-2"><span class="h-6 w-6 rounded-full bg-saffron text-white grid place-items-center">1</span>Identity</li>
    <li class="flex items-center gap-2 opacity-60"><span class="h-6 w-6 rounded-full bg-gray-200 grid place-items-center">2</span>Role</li>
    <li class="flex items-center gap-2 opacity-60"><span class="h-6 w-6 rounded-full bg-gray-200 grid place-items-center">3</span>Photo</li>
  </ol>

  <!-- input -->
  <label class="block">
    <span class="text-sm">Full name</span>
    <input class="mt-1 w-full h-10 rounded-xl border border-sandstone/30 px-3
                  focus:outline-none focus:ring-2 focus:ring-saffron/40" />
  </label>

  <div class="flex gap-2">
    <button class="h-10 px-4 rounded-xl border border-sandstone/30">Back</button>
    <button class="h-10 px-4 rounded-xl bg-saffron text-white ml-auto">Next</button>
  </div>
</form>
```

### AdminRow / AdminDrawer

```html
<!-- Row -->
<div class="rounded-2xl border border-gray-100 bg-white p-4 flex items-center gap-3">
  <div class="min-w-0 flex-1">
    <div class="font-medium truncate">Bhatt Narasimha</div>
    <div class="text-xs text-gray-600">Cook • Kannada · Tulu</div>
  </div>
  <form>
    <button class="h-9 px-3 rounded-xl bg-green-700 text-white hover:opacity-90">Approve</button>
  </form>
  <button class="h-9 px-3 rounded-xl border border-sandstone/30 hover:border-saffron/60">View</button>
</div>

<!-- Drawer (sheet) -->
<aside class="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl p-5
                border-l border-gray-100 translate-x-full data-[open=true]:translate-x-0 transition-transform">
  <!-- content -->
</aside>

### Provider Detail — Sticky Actions

```html
<div class="sticky top-14 z-30 bg-ivory/90 backdrop-blur border-b border-sandstone/20">
  <div class="mx-auto max-w-4xl px-4 py-2 flex items-center gap-2">
    <h1 class="font-medium truncate">Sharma Avadhani</h1>
    <div class="ml-auto flex gap-2">
      <a class="h-9 px-3 rounded-xl bg-saffron text-white">WhatsApp</a>
      <a class="h-9 px-3 rounded-xl border border-sandstone/30">Call</a>
      <button class="h-9 px-3 rounded-xl text-saffron hover:bg-saffron/10">Share</button>
    </div>
  </div>
</div>


### Tabs / Accordion (detail sections)

```html
<!-- Tabs -->
<div class="flex gap-2 border-b border-sandstone/20">
  <button class="px-3 py-2 text-sm data-[active=true]:text-saffron data-[active=true]:border-b-2 data-[active=true]:border-saffron">About</button>
  <button class="px-3 py-2 text-sm">Rituals</button>
  <button class="px-3 py-2 text-sm">Photos</button>
</div>

<!-- Accordion item -->
<div class="border-b border-gray-100">
  <button class="w-full flex items-center justify-between py-3">
    <span class="text-sm font-medium">About</span>
    <span class="text-sandstone/70">▼</span>
  </button>
  <div class="pb-3 text-sm text-gray-700">Short bio and sampradaya alignment…</div>
</div>
```

### Mobile Bottom Bar (optional)

```html
<nav class="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200
            grid grid-cols-4 text-xs py-2 sm:hidden">
  <a class="grid place-items-center text-gray-700">Home</a>
  <a class="grid place-items-center text-gray-700">Search</a>
  <a class="grid place-items-center text-white bg-saffron rounded-full h-9 w-24 justify-self-center -mt-5 shadow">Onboard</a>
  <a class="grid place-items-center text-gray-700">Menu</a>
</nav>


## Utility classes (quick reference)

Containers: mx-auto max-w-6xl px-4
Cards: bg-white rounded-2xl border border-gray-100 shadow-sm
Section: py-8 md:py-10
Titles: text-xl md:text-2xl font-semibold tracking-tight
Subtext: text-sm text-gray-600
Dividers: border border-sandstone/20
Hover ring: hover:ring-1 hover:ring-saffron/30
Focus ring: focus:outline-none focus:ring-2 focus:ring-saffron/40
Elevation: shadow-sm hover:shadow-md
Chips: rounded-full px-3 py-1.5 text-sm