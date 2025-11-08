# ADR-006: Turborepo + pnpm Monorepo

**Status:** Accepted  
**Date:** 08-Nov-2025  
**Deciders:** Development Team

---

## Context

Project may grow to include multiple apps (web, mobile, admin dashboard) and shared packages (UI components, utilities). Need to decide on repository structure.

---

## Decision

Use Turborepo + pnpm for monorepo management instead of separate repositories or npm workspaces.

---

## Rationale

**Why monorepo:**
- **Share code** - Common components, types, utilities
- **Atomic changes** - Update multiple apps in one commit
- **Consistent versions** - All apps use same dependencies
- **Easier refactoring** - Change shared code, see all impacts

**Why Turborepo:**
- **Fast builds** - Caches build outputs, only rebuilds what changed
- **Parallel execution** - Runs tasks across packages simultaneously
- **Simple config** - Minimal setup, works out of box

**Why pnpm:**
- **Disk space** - Shares packages across projects (saves GBs)
- **Fast installs** - 2-3x faster than npm
- **Strict** - Prevents phantom dependencies

---

## Consequences

**Positive:**
- Easy to share code between apps
- Faster CI/CD (cached builds)
- Single source of truth
- Scales to multiple apps

**Negative:**
- Slightly more complex setup
- All apps must use compatible dependencies
- Larger repository size

---

## Structure

```
vipra-sethu/
├── apps/
│   └── web/              # Main Next.js app
├── packages/             # Future: shared packages
│   ├── ui/               # Shared components
│   └── utils/            # Shared utilities
├── turbo.json            # Turborepo config
└── pnpm-workspace.yaml   # Workspace definition
```

---

## Related Decisions

- [ADR-005: Next.js App Router](./ADR-005-nextjs-app-router.md) - Web app in monorepo

---

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
