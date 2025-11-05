# Quick Start: Database Migration

**Last Updated**: 2025-11-05

## ✅ **Status: Clean Taxonomy Implementation Complete**

The database has been successfully migrated to use normalized taxonomy tables. All legacy text fields have been removed and replaced with clean FK references.

## 🚀 **For New Projects**

If setting up a fresh database:

1. **Enable PostgreSQL extensions**

   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

2. **Run all migration scripts in order**

   ```sql
   \i 01_alter_providers_table.sql
   \i 02_create_new_tables.sql
   \i 03_update_rls_policies.sql
   \i 04_create_triggers.sql
   \i 05_update_rpc_functions.sql
   \i 06_clean_taxonomy_tables.sql
   \i 07_clean_rpc_and_views.sql
   \i provider-photos-storage-policy.sql
   ```

## 🔄 **For Existing Projects**

If you have already run the legacy scripts (`schema.sql`, `policies.sql`, etc.):

1. **Continue with clean taxonomy migrations**

   ```sql
   \i 06_clean_taxonomy_tables.sql
   \i 07_clean_rpc_and_views.sql
   ```

2. **These scripts will**:
   - Create `categories` and `sampradayas` tables
   - Add `category_code` and `sampradaya_code` columns to `providers`
   - Migrate any existing data from text fields to FK references
   - Drop legacy text columns (`category`, `sampradaya`)
   - Update all RPC functions to use code-based filters

## ✅ **Verify Migration**

```sql
-- Test clean taxonomy search
SELECT * FROM search_providers(
  p_category_code := 'purohit',
  p_sampradaya_code := 'madhwa',
  p_limit := 10
);

-- Test taxonomy functions
SELECT * FROM get_active_categories();
SELECT * FROM get_active_sampradayas();

-- Verify no legacy columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'providers' 
AND column_name IN ('category', 'sampradaya');
-- Should return 0 rows
```

## 📚 **Documentation**

- **Schema Details**: `docs/11-data-model-and-schemas.md`
- **Migration Guide**: `infra/supabase/README.md`
- **Implementation Guide**: `docs/CLEAN-TAXONOMY-IMPLEMENTATION.md`

## Common Issues

**"Extension not found"**: Enable PostGIS in Supabase Dashboard → Database → Extensions

**"Permission denied"**: Check RLS policies are created correctly

**"Function not found"**: Ensure you ran script 05 successfully

## Rollback

If something goes wrong:

```bash
# Restore from backup
psql $DATABASE_URL < backup.sql
```

## Need Help?

1. Check the comprehensive docs listed above
2. Review Supabase logs in dashboard
3. Verify all prerequisites are met (extensions enabled)
