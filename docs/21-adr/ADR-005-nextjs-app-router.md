# ADR-005: Next.js 14 App Router

**Status:** Accepted  
**Date:** 08-Nov-2025  
**Deciders:** Development Team

---

## Context

Need a React framework for building the web application. Must support SSR, routing, and good developer experience.

---

## Decision

Use Next.js 14 with App Router instead of Pages Router or other React frameworks.

---

## Rationale

**Why Next.js App Router:**
- **Server Components** - Faster initial load, less JavaScript
- **File-based routing** - Folders become URLs automatically
- **Built-in SEO** - Server-side rendering for search engines
- **Server Actions** - Call server functions without API routes
- **Image optimization** - Automatic image resizing and caching
- **Vercel deployment** - One-click deploy with zero config

**Why not Pages Router:** Older pattern, more boilerplate  
**Why not Create React App:** No SSR, manual routing setup  
**Why not Remix:** Smaller ecosystem, less mature

---

## Consequences

**Positive:**
- Fast page loads (server components)
- Great SEO (server-side rendering)
- Simple data fetching (async components)
- Automatic code splitting
- Hot reload during development

**Negative:**
- Learning curve (new patterns)
- Some libraries don't work with server components
- Must understand client vs server boundaries

---

## Implementation

**File structure:**
```
app/
├── page.tsx              # Homepage (/)
├── providers/
│   ├── page.tsx          # /providers
│   └── [id]/page.tsx     # /providers/:id
└── layout.tsx            # Shared layout
```

**Server Component (default):**
```typescript
// Runs on server, can access database directly
export default async function ProvidersPage() {
  const providers = await getProviders(); // Direct DB call
  return <ProviderList providers={providers} />;
}
```

**Client Component (when needed):**
```typescript
'use client'; // Opt-in to client-side

export function SearchForm() {
  const [query, setQuery] = useState('');
  // Interactive components need client-side
}
```

---

## Related Decisions

- [ADR-004: Supabase Backend](./ADR-004-supabase-backend.md) - Works great with Next.js
- [ADR-006: Turborepo Monorepo](./ADR-006-monorepo-structure.md) - Next.js app in monorepo

---

## References

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
