# Supabase Database Schema & Migrations

This directory contains SQL scripts for setting up and migrating the Vipra Sethu database schema.

## Overview

The database schema supports a provider directory platform with:

- Provider profiles with detailed information
- Multi-photo galleries per provider
- Structured ritual/service listings
- Admin approval workflow with audit trail
- Geospatial search capabilities
- Row-level security (RLS) for data protection

## Migration Files

Execute these files **in order** to set up or update your database:

### 1. `schema.sql` (Legacy - Initial Setup)

Original schema with basic providers, admin_actions, and admins tables.

**Status**: Superseded by migration scripts below.

### 2. `01_alter_providers_table.sql`

Adds new columns to the existing providers table:

- Email, experience, detailed descriptions
- Audit fields (updated_at, approved_at, approved_by)
- Response time, service radius, expectations
- Constraints and indices for performance

### 3. `02_create_new_tables.sql`

Creates new supporting tables:

- `provider_photos` - Multiple photos per provider
- `provider_rituals` - Structured ritual/service listings
- Updates `admin_actions` with metadata and action_type
- Enhances `admins` table with roles

### 4. `03_update_rls_policies.sql`

Implements comprehensive Row Level Security:

- Public read access for approved providers
- Self-service for provider owners
- Admin full access
- Granular policies for photos and rituals

### 5. `04_create_triggers.sql`

Automated database triggers:

- Auto-update `updated_at` timestamp
- Log status changes to admin_actions
- Validate admin permissions

### 6. `05_update_rpc_functions.sql`

Stored procedures for complex queries:

- `search_providers()` - Enhanced search with geospatial support
- `get_provider_stats()` - Admin dashboard statistics
- `get_provider_details()` - Provider with related data
- `get_pending_providers()` - Admin review queue

### 7. `06_clean_taxonomy_tables.sql`

Creates clean normalized taxonomy tables:

- `categories` table with seeded values
- `sampradayas` table with seeded values
- Replaces legacy text columns with FK columns
- Migrates any existing data to new structure
- RLS policies for public read, admin write

### 8. `07_clean_rpc_and_views.sql`

Clean functions and views for taxonomy support:

- `provider_with_taxonomies` view - Joins with display names
- Clean `search_providers()` - Uses code-based filters only
- `get_active_categories()` - For UI filter dropdowns
- `get_active_sampradayas()` - For UI filter dropdowns
- `get_category_stats()` - Category analytics
- `get_sampradaya_stats()` - Sampradaya analytics

### Supporting Files

- `policies.sql` - Legacy RLS policies (superseded by 03_update_rls_policies.sql)
- `rpc_search_providers.sql` - Legacy search function (superseded by 05_update_rpc_functions.sql)
- `provider-photos-storage-policy.sql` - Storage bucket policies for photos

## Prerequisites

Ensure these PostgreSQL extensions are enabled:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;      -- Trigram similarity for fuzzy search
CREATE EXTENSION IF NOT EXISTS postgis;      -- Geospatial queries
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- UUID generation (optional)
```

## Migration Instructions

### Option A: Fresh Installation

If setting up a new database:

```sql
-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Run all migration scripts in order
\i 01_alter_providers_table.sql
\i 02_create_new_tables.sql
\i 03_update_rls_policies.sql
\i 04_create_triggers.sql
\i 05_update_rpc_functions.sql
\i 06_clean_taxonomy_tables.sql
\i 07_clean_rpc_and_views.sql

-- 3. Set up storage bucket
\i provider-photos-storage-policy.sql
```

### Option B: Updating Existing Database

If you have an existing database with the legacy schema:

1. **Backup your database first!**

   ```bash
   # Via Supabase CLI
   supabase db dump -f backup.sql
   
   # Or via pg_dump
   pg_dump -h your-host -U postgres -d postgres > backup.sql
   ```

2. **Run migrations in order:**
   - Execute each script via Supabase SQL Editor or psql
   - Check for errors after each script
   - Test RLS policies with different user roles

3. **Verify migration:**

   ```sql
   -- Check new columns exist
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'providers';
   
   -- Check new tables exist
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('provider_photos', 'provider_rituals');
   
   -- Check triggers exist
   SELECT trigger_name, event_manipulation, event_object_table
   FROM information_schema.triggers
   WHERE trigger_schema = 'public';
   ```

### Option C: Via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste each migration script
5. Run them one at a time in order
6. Check the results panel for any errors

### Option D: Via Supabase CLI

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Or execute individual files
psql $DATABASE_URL -f infra/supabase/01_alter_providers_table.sql
psql $DATABASE_URL -f infra/supabase/02_create_new_tables.sql
# ... etc
```

## Testing the Migration

After running migrations, test the following:

### 1. Test RLS Policies

```sql
-- As anonymous user (should only see approved providers)
SELECT * FROM providers;

-- As authenticated user (should see own + approved)
SET request.jwt.claims TO '{"sub": "user-uuid-here"}';
SELECT * FROM providers;

-- As admin (should see all)
SET request.jwt.claims TO '{"email": "admin@example.com"}';
SELECT * FROM providers;
```

### 2. Test Search Function

```sql
-- Basic search
SELECT * FROM search_providers(
  p_text := 'sharma',
  p_category_code := 'purohit',
  p_limit := 10
);

-- Geospatial search (Bangalore coordinates)
SELECT * FROM search_providers(
  p_lat := 12.9716,
  p_lon := 77.5946,
  p_radius_km := 10,
  p_limit := 20
);
```

### 3. Test Admin Functions

```sql
-- Get dashboard stats
SELECT get_provider_stats();

-- Get pending providers
SELECT * FROM get_pending_providers(p_limit := 10);

-- Get provider details
SELECT get_provider_details('provider-uuid-here');

-- Get category stats
SELECT get_category_stats();

-- Get sampradaya stats
SELECT get_sampradaya_stats();
```

### 4. Test Taxonomy Functions

```sql
-- Get active categories for UI
SELECT * FROM get_active_categories();

-- Get active sampradayas for UI
SELECT * FROM get_active_sampradayas();

-- Test search with code filters
SELECT * FROM search_providers(
  p_category_code := 'purohit',
  p_sampradaya_code := 'madhwa',
  p_limit := 10
);

-- Test provider view with taxonomy names
SELECT id, name, category_name, sampradaya_name 
FROM provider_with_taxonomies 
WHERE status = 'approved' 
LIMIT 5;
```

### 5. Test Triggers

```sql
-- Update a provider and check updated_at changes
UPDATE providers SET name = 'Test Name' WHERE id = 'some-uuid';
SELECT updated_at FROM providers WHERE id = 'some-uuid';

-- Change status and check admin_actions log
UPDATE providers SET status = 'approved' WHERE id = 'some-uuid';
SELECT * FROM admin_actions WHERE provider_id = 'some-uuid' ORDER BY created_at DESC LIMIT 1;
```

## Rollback Instructions

If you need to rollback:

### 1. Restore from backup

```bash
psql $DATABASE_URL < backup.sql
```

### 2. Or manually drop new objects

```sql
-- Drop new tables
DROP TABLE IF EXISTS provider_photos CASCADE;
DROP TABLE IF EXISTS provider_rituals CASCADE;

-- Drop new triggers
DROP TRIGGER IF EXISTS update_providers_updated_at ON providers;
DROP TRIGGER IF EXISTS log_provider_status_change_trigger ON providers;

-- Drop new functions
DROP FUNCTION IF EXISTS search_providers CASCADE;
DROP FUNCTION IF EXISTS get_provider_stats CASCADE;

-- Remove new columns (be careful!)
ALTER TABLE providers DROP COLUMN IF EXISTS email;
-- ... etc
```

## Common Issues & Solutions

### Issue: Extension not found

```sql
ERROR: extension "postgis" is not available
```

**Solution**: Enable PostGIS in Supabase dashboard under Database > Extensions

### Issue: Permission denied

```sql
ERROR: permission denied for table providers
```

**Solution**: Check RLS policies and ensure user has proper role

### Issue: Trigger not firing

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'update_providers_updated_at';
```

**Solution**: Ensure trigger was created successfully and function exists

### Issue: Function not found

```sql
ERROR: function search_providers() does not exist
```

**Solution**: Run `05_update_rpc_functions.sql` again

## Schema Documentation

See `docs/11-data-model-and-schemas.md` for comprehensive schema documentation including:

- Table structures and relationships
- Column descriptions
- Index strategy
- RLS policy details
- Future-ready tables (bookings, reviews)

## Support

For issues or questions:

1. Check the schema documentation
2. Review Supabase logs in the dashboard
3. Test with the SQL examples above
4. Verify all prerequisites are met
