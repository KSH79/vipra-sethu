# SUPABASE_BASELINE_MIGRATION.md

This guide covers creating a baseline migration from an existing Supabase project to initialize local development with version-controlled database schema.

## Future Workflow

```bash
# 1. Make changes in Supabase Dashboard (dev project)
# 2. Create migration file
supabase migration new "add_reviews_table"
# 3. Generate diff
supabase db diff --schema public -f add_reviews_table

OR instead of 2 & 3, use 
supabase db diff --schema public -f add_reviews_table

# 4. Test locally
supabase db reset
pnpm dev
# 5. Deploy to dev (if needed)
supabase db push --project-ref <dev-project-ref>
# 6. Deploy to prod
supabase db push --project-ref <prod-project-ref>
# 7. Commit
git add supabase/migrations/
git commit -m "feat: add reviews table"
```

## Prerequisites

- Supabase CLI installed
- Docker Desktop running
- Project renamed in Supabase Dashboard (e.g., vipra-sethu-dev)
- Git repository initialized

## Step 1: Initialize CLI and Link Project

```bash
# Initialize Supabase in your repo (creates supabase/ folder)
supabase init

# Link to your remote project
supabase link --project-ref <project-ref>
```

## Step 2: Generate Baseline Migration

Recommended Approach: Use Session Pooler

```bash
# Get connection string from Dashboard → Connect → Session pooler
# Replace password with your actual database password

supabase db diff --db-url "postgresql://postgres.<project-ref>:<password>@aws-1-ap-south-1.pooler.supabase.com:5432/postgres" --schema public,auth,storage -f baseline_remote_schema
```

Alternative: Direct DB Connection

```bash
# Use direct connection if pooler has issues
supabase db diff --db-url "postgresql://postgres.<project-ref>:<password>@db.<project-ref>.supabase.co:5432/postgres" --schema public,auth,storage -f baseline_remote_schema
```

## Common Errors and Solutions

Error: "hostname resolving error" / DNS timeout
Cause: Network issues with pooler host Solution:

- Try direct DB host instead of pooler
- Check VPN/firewall settings
- Use session pooler connection string

Error: "password authentication failed"
Cause: Incorrect password or special characters Solution:

Reset password in Dashboard → Database Settings
URL-encode special characters: @ → %40, # → %23
Test with pssql first

Error: "type already exists" (PostGIS conflicts)
Cause: Local container has PostGIS types that migration tries to recreate 

Solution: Replace create type with DO blocks:

```sql
-- Instead of:
create type "public"."geometry_dump" as ("path" integer[], "geom" public.geometry);

-- Use:
do $$ begin
  create type "public"."geometry_dump" as ("path" integer[], "geom" public.geometry);
exception when duplicate_object then null; end $$;
```

Error: "migration history does not match local files"
Cause: Remote has migrations but local has none Solution: Use db diff instead of db pull to avoid history conflicts

## Step 3: Verify Migration Works Locally

```bash
# Start local services
supabase start

# If errors occur, reset and retry
supabase db reset
```

Expected output: Services start successfully with migration applied

## Step 4: Commit Baseline to Git

```bash
# Stage migration files
git add supabase/migrations

# Commit with descriptive message
git commit -m "init: add baseline Supabase migration pulled from <project-name>"
```

## Verification Checklist

- [ ] supabase/migrations/folder exists
- [ ] Baseline migration file created with timestamp
- [ ] supabase start runs without errors
- [ ] Migration committed to Git
- [ ] Local Studio shows all tables and data

## Next Steps

### Do NOT Do This

- Don't run supabase db push for the baseline migration
- Don't modify the baseline file unless fixing conflicts

### Do This Instead

- Use baseline as starting point only
- Create new migrations for future changes:

```bash
supabase migration new <feature_name>
```

- Or generate diffs for changes

```bash
supabase db diff -f <change_name>
```



## Optional Enhancements

Add Seed Data
Create supabase/seed.sql for test data:

-- Example seed data
insert into public.categories (code, name) values ('cat1', 'Category 1');
```

Add .gitignore for sensitive files:

```bash
supabase ignore
```

## supabase config.toml file has ref to vipra-sethu-dev only

For local development (default)

supabase db push
supabase db reset

For production deployment

supabase db push --project-ref <prod-project-ref>

For specific dev operations  

supabase db push --project-ref <dev-project-ref>

Push all migrations to production

supabase db push

Check migrations applied in production

supabase migration list

Verify tables exist

Method 1: Use psql directly

supabase db shell -c "\dt"

Method 2: Enter shell then run commands

supabase db shell

Then inside psql:

\dt
\q