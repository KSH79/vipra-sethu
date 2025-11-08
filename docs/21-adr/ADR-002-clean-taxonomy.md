# ADR-002: Clean Taxonomy with Normalized Tables

**Status:** Accepted  
**Date:** 08-Nov-2025  
**Deciders:** Development Team

---

## Context

Providers need to be classified by service type (category) and religious tradition (sampradaya). Initial implementation used text fields, but this creates problems:
- Inconsistent data (typos, variations in spelling/capitalization)
- Hard to add new categories without code changes
- No support for multiple languages
- Difficult to generate analytics (count by category)
- No validation of allowed values

---

## Decision

Use normalized lookup tables (`categories` and `sampradayas`) with foreign key references instead of free-text fields.

---

## Rationale

**Why normalized tables:**
- **Data consistency** - No typos or variations (enforced by foreign key)
- **Easy to extend** - Add new categories via database insert, no code changes
- **Internationalization** - Can add translations without changing schema
- **Analytics-friendly** - Easy to count providers by category
- **Validation** - Database rejects invalid codes automatically

**Why not text fields:**
- Allows typos and inconsistencies
- Hard to change category names (must update all rows)
- No built-in validation
- Difficult to add metadata (descriptions, icons, etc.)

---

## Consequences

**Positive:**
- Clean, consistent data from day one
- Easy to add new categories and sampradayas
- Supports future features (icons, translations, ordering)
- Better query performance (indexed foreign keys)
- Simpler UI code (fetch from lookup tables)

**Negative:**
- Slightly more complex schema (3 tables instead of 1)
- Must seed lookup tables before adding providers
- Requires joins to get display names (mitigated by views)

**Neutral:**
- Need migration to convert existing data (not applicable - no production data yet)
- Must update UI to fetch from lookup tables

---

## Implementation

### Database Schema

**categories table:**
```sql
CREATE TABLE categories (
  code text PRIMARY KEY,           -- 'purohit', 'cook', etc.
  name text NOT NULL,               -- 'Vedic Purohit', 'Cook', etc.
  description text,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

**sampradayas table:**
```sql
CREATE TABLE sampradayas (
  code text PRIMARY KEY,            -- 'madhwa', 'smarta', etc.
  name text NOT NULL,                -- 'Madhwa', 'Smarta', etc.
  description text,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

**providers table (updated):**
```sql
ALTER TABLE providers
  ADD COLUMN category_code text REFERENCES categories(code),
  ADD COLUMN sampradaya_code text REFERENCES sampradayas(code);
```

### Helper Functions

**Get active categories:**
```sql
CREATE FUNCTION get_active_categories()
RETURNS TABLE (code text, name text, description text)
AS $$
  SELECT code, name, description
  FROM categories
  WHERE active = true
  ORDER BY sort_order, name;
$$ LANGUAGE SQL;
```

**Search with taxonomy:**
```sql
CREATE FUNCTION search_providers(
  p_category_code text DEFAULT NULL,
  p_sampradaya_code text DEFAULT NULL,
  ...
)
RETURNS TABLE (...)
AS $$
  SELECT p.*, c.name as category_name, s.name as sampradaya_name
  FROM providers p
  LEFT JOIN categories c ON p.category_code = c.code
  LEFT JOIN sampradayas s ON p.sampradaya_code = s.code
  WHERE (p_category_code IS NULL OR p.category_code = p_category_code)
    AND (p_sampradaya_code IS NULL OR p.sampradaya_code = p_sampradaya_code)
    ...
$$ LANGUAGE SQL;
```

### UI Integration

**Fetch categories for dropdown:**
```typescript
const { data: categories } = await supabase
  .rpc('get_active_categories');
```

**Submit with code:**
```typescript
const { error } = await supabase
  .from('providers')
  .insert({
    ...formData,
    category_code: 'purohit',  // Not 'Vedic Purohit'
    sampradaya_code: 'madhwa'  // Not 'Madhwa'
  });
```

---

## Alternatives Considered

### 1. Text Fields with Validation

**Approach:** Keep text fields but validate against allowed list in application code

**Pros:**
- Simpler schema (no joins needed)
- Faster queries (no joins)
- Easier to understand

**Cons:**
- Validation only in application (can be bypassed)
- Hard to change allowed values (must update code)
- Inconsistent data if validation has bugs
- No metadata support

**Why rejected:** Doesn't solve data consistency problem

### 2. Enum Types

**Approach:** Use PostgreSQL ENUM types for categories and sampradayas

**Pros:**
- Database-enforced validation
- No separate tables needed
- Fast (stored as integers internally)

**Cons:**
- Hard to add new values (requires ALTER TYPE)
- No metadata (descriptions, icons, etc.)
- Can't disable values (only add/remove)
- No sort order control

**Why rejected:** Too rigid, hard to extend

### 3. JSON Fields

**Approach:** Store category and sampradaya as JSON objects with code and name

**Pros:**
- Flexible (can add any fields)
- No joins needed
- Easy to add metadata

**Cons:**
- Inconsistent data (each row can have different structure)
- Hard to query and filter
- No referential integrity
- Larger storage size

**Why rejected:** Loses benefits of relational database

---

## Migration Strategy

Since we're in development with no production data:
1. Create new tables (categories, sampradayas)
2. Seed with initial values
3. Add foreign key columns to providers
4. Update RPC functions to use codes
5. Update UI to fetch from lookup tables
6. Remove old text fields (if any)

No backward compatibility needed.

---

## Related Decisions

- [ADR-004: Supabase as Backend](./ADR-004-supabase-backend.md) - PostgreSQL enables foreign keys
- [ADR-001: RLS Security Model](./ADR-001-rls-security-model.md) - RLS policies apply to taxonomy tables

---

## References

- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)
- [PostgreSQL Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
- Implementation guide: `docs/CLEAN-TAXONOMY-IMPLEMENTATION.md`
