# Clean Taxonomy Implementation Guide

**Date:** 2025-11-04  
**Purpose:** Simplified taxonomy implementation for development stage

## Why This Approach

Since you're still in development with no production data or deployed version, we don't need backward compatibility. This clean approach:

- **Simpler code** - No dual-field complexity
- **Cleaner schema** - Only normalized fields
- **Better performance** - No legacy text columns
- **Easier to maintain** - Single source of truth

---

## Database Schema

### providers table (clean version)
```sql
-- Only normalized fields, no legacy text columns
category_code text NOT NULL references categories(code),
sampradaya_code text references sampradayas(code),
```

### categories table
```sql
code text primary key,           -- 'purohit', 'cook', etc.
name text not null,              -- 'Vedic Purohit', 'Cook', etc.
description text,
active boolean default true,
sort_order integer default 0,
created_at timestamptz default now()
```

### sampradayas table
```sql
code text primary key,           -- 'madhwa', 'smarta', etc.
name text not null,              -- 'Madhwa', 'Smarta', etc.
description text,
active boolean default true,
sort_order integer default 0,
created_at timestamptz default now()
```

---

## Migration Files

### 1. `06_clean_taxonomy_tables.sql`
- Creates categories and sampradayas tables
- Seeds initial values
- **Replaces** legacy text columns with FK columns
- Migrates any existing data automatically
- Sets up RLS policies

### 2. `07_clean_rpc_and_views.sql`
- `provider_with_taxonomies` view - joins with display names
- Clean `search_providers()` - only code-based filters
- `get_active_categories()` - for UI dropdowns
- `get_active_sampradaya()` - for UI dropdowns
- Analytics functions for admin dashboard

---

## TypeScript Types (Simplified)

```typescript
// lib/types/taxonomy.ts
export interface Category {
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Sampradaya {
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
}

// lib/types/provider.ts (clean version)
export interface Provider {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone: string;
  whatsapp?: string;
  
  // Only normalized fields
  category_code: string;
  category_name?: string;  // From view/join
  sampradaya_code?: string;
  sampradaya_name?: string;  // From view/join
  
  languages: string[];
  years_experience?: number;
  about?: string;
  // ... other fields
}
```

---

## React Hooks (Simplified)

```typescript
// hooks/useTaxonomy.ts
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    supabase.rpc('get_active_categories')
      .then(({ data }) => setCategories(data || []))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading, error };
}

export function useSampradayas() {
  const [sampradayas, setSampradayas] = useState<Sampradaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    supabase.rpc('get_active_sampradayas')
      .then(({ data }) => setSampradayas(data || []))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { sampradayas, loading, error };
}
```

---

## Search Service (Clean)

```typescript
// lib/services/providerService.ts
export const providerService = {
  async searchProviders(params: {
    text?: string;
    category_code?: string;      // Only code, no legacy
    sampradaya_code?: string;    // Only code, no legacy
    languages?: string[];
    lat?: number;
    lon?: number;
    radius_km?: number;
    limit?: number;
    offset?: number;
  }) {
    const { data, error } = await supabase.rpc('search_providers', {
      p_text: params.text || null,
      p_category_code: params.category_code || null,
      p_sampradaya_code: params.sampradaya_code || null,
      p_languages: params.languages || null,
      p_lat: params.lat || null,
      p_lon: params.lon || null,
      p_radius_km: params.radius_km || 15,
      p_limit: params.limit || 50,
      p_offset: params.offset || 0
    });

    if (error) throw error;
    return data || [];
  }
};
```

---

## Filter Component (Clean)

```typescript
// components/ui/FilterChips.tsx
export function FilterChips({ selectedFilters, onFilterChange }) {
  const { categories, loading: categoriesLoading } = useCategories();
  const { sampradayas, loading: sampradayasLoading } = useSampradayas();

  const filterOptions = [
    {
      key: "category_code",  // Only code
      label: "Category",
      multi: false,
      options: categories.map(cat => ({
        value: cat.code,
        label: cat.name
      }))
    },
    {
      key: "languages",
      label: "Languages", 
      multi: true,
      options: [
        { value: "kannada", label: "Kannada" },
        { value: "tamil", label: "Tamil" },
        // ... other languages
      ]
    },
    {
      key: "sampradaya_code",  // Only code
      label: "Sampradaya",
      multi: false,
      options: sampradayas.map(sam => ({
        value: sam.code,
        label: sam.name
      }))
    }
  ];

  if (categoriesLoading || sampradayasLoading) {
    return <div>Loading filters...</div>;
  }

  return (
    // ... rest of component using filterOptions
  );
}
```

---

## Onboarding Form (Clean)

```typescript
// app/onboard/page.tsx
export default function Onboard() {
  const { categories } = useCategories();
  const { sampradayas } = useSampradayas();
  
  const onSubmit = async (data: FormValues) => {
    try {
      // Only submit with codes, no legacy text fields
      const payload = {
        ...data,
        category_code: data.category_code,
        sampradaya_code: data.sampradaya_code
      };

      const { error } = await supabase
        .from('providers')
        .insert(payload);

      if (error) throw error;
      // ... success handling
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Category dropdown - only codes */}
      <select {...register('category_code', { required: true })}>
        <option value="">Select a category</option>
        {categories.map(cat => (
          <option key={cat.code} value={cat.code}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Sampradaya dropdown - only codes */}
      <select {...register('sampradaya_code')}>
        <option value="">Select tradition</option>
        {sampradayas.map(sam => (
          <option key={sam.code} value={sam.code}>
            {sam.name}
          </option>
        ))}
      </select>

      {/* ... rest of form */}
    </form>
  );
}
```

---

## Provider Display (Clean)

```typescript
// components/ui/ProviderCard.tsx
export function ProviderCard({ provider }: { provider: Provider }) {
  // Display names directly from provider (populated by view/join)
  const categoryDisplay = provider.category_name;
  const sampradayaDisplay = provider.sampradaya_name;

  return (
    <article className="provider-card">
      <h3>{provider.name}</h3>
      <p className="category">{categoryDisplay}</p>
      {sampradayaDisplay && (
        <Badge variant="saffron">{sampradayaDisplay}</Badge>
      )}
      {/* ... rest of card */}
    </article>
  );
}
```

---

## Migration Commands

### Run Database Migrations

```bash
# Via Supabase SQL Editor
# Execute in order:

# 1. Create clean taxonomy tables
infra/supabase/06_clean_taxonomy_tables.sql

# 2. Create clean RPCs and views
infra/supabase/07_clean_rpc_and_views.sql
```

### Verify Clean Migration

```sql
-- Check no legacy columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'providers' 
AND column_name IN ('category', 'sampradaya');

-- Should return 0 rows

-- Check new columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'providers' 
AND column_name IN ('category_code', 'sampradaya_code');

-- Should return 2 rows

-- Test clean search
SELECT * FROM search_providers(
  p_category_code := 'purohit',
  p_limit := 5
);

-- Test taxonomy RPCs
SELECT * FROM get_active_categories();
SELECT * FROM get_active_sampradayas();
```

---

## Benefits of Clean Approach

### 1. **Simpler Code**
- No dual-field logic
- Single source of truth
- Less conditional logic

### 2. **Better Performance**
- No redundant text columns
- Smaller row size
- Better query optimization

### 3. **Cleaner API**
- Consistent parameter names
- No legacy compatibility code
- Easier to understand

### 4. **Easier Testing**
- Fewer edge cases
- Simpler test scenarios
- Clear data model

### 5. **Future-Proof**
- Ready for production from day 1
- No technical debt
- Scalable architecture

---

## Files Summary

### New Files Created:
1. `infra/supabase/06_clean_taxonomy_tables.sql` - Clean taxonomy implementation
2. `infra/supabase/07_clean_rpc_and_views.sql` - Clean functions and views
3. `docs/CLEAN-TAXONOMY-IMPLEMENTATION.md` - This guide

### Files Modified:
1. `docs/11-data-model-and-schemas.md` - Updated to clean schema
2. `infra/supabase/README.md` - Updated migration instructions

---

## Next Steps

### Immediate (Today)
1. Run `06_clean_taxonomy_tables.sql`
2. Run `07_clean_rpc_and_views.sql`
3. Test all RPC functions
4. Verify clean schema

### This Week
1. Update TypeScript types
2. Implement React hooks
3. Update filter components
4. Update search functionality

### Next Week
1. Update onboarding form
2. Update provider display
3. Update admin dashboard
4. End-to-end testing

---

## Success Criteria

✅ Clean database schema with no legacy fields  
✅ All RPC functions work with code-based filters  
✅ UI can read taxonomy tables for dropdowns  
✅ Search returns providers with display names  
✅ Forms submit with category/sampradaya codes  
✅ Admin dashboard shows taxonomy statistics  
✅ No backward compatibility complexity  

---

**Status:** Ready for clean implementation  
**Risk Level:** Very Low (no legacy complexity)  
**Estimated Effort:** 1-2 weeks for full integration  
**Dependencies:** Database migrations must run first
