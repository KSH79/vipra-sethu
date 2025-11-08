# Dev Workflow
**Updated:** 2025-10-26 12:31

- pnpm workspaces with `pnpm-workspace.yaml`.  
- Run: `pnpm install` → `pnpm --filter @app/web dev`.  
- Migrations under `/infra/supabase` run in order.  
- Branching: main protected; feature/*; PR + CI.
