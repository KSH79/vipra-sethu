# Data Model & Schemas
**Updated:** 2025-11-04 18:50

## Core Tables

### providers

Primary provider information with contact details and status tracking.

**Columns:**

- `id` (uuid, PK) - Unique identifier
- `user_id` (uuid, FK → auth.users) - Supabase auth user reference
- `name` (text, NOT NULL) - Full name
- `email` (text) - Email address
- `phone` (text, NOT NULL) - Primary phone number
- `whatsapp` (text) - WhatsApp number (defaults to phone if null)
- `category_code` (text, NOT NULL, FK → categories.code) - Service category reference
- `languages` (text[], NOT NULL) - Array of languages spoken
- `sampradaya_code` (text, FK → sampradayas.code) - Religious tradition reference
- `years_experience` (integer) - Years of experience
- `about` (text) - Detailed description
- `location_text` (text) - Human-readable location (e.g., "Basavanagudi, Bangalore")
- `location` (geography(point, 4326)) - PostGIS point for geospatial queries
- `service_radius_km` (integer) - Willing to travel distance in km
- `availability_notes` (text) - Availability description
- `travel_notes` (text) - Travel preferences and charges
- `expectations` (text[]) - Array of expectations/requirements
- `response_time_hours` (integer) - Typical response time in hours
- `status` (text, NOT NULL, DEFAULT 'pending_review') - pending_review | approved | rejected | suspended
- `rejection_reason` (text) - Reason for rejection (if applicable)
- `profile_photo_url` (text) - Primary profile photo URL
- `created_at` (timestamptz, DEFAULT now())
- `updated_at` (timestamptz, DEFAULT now())
- `approved_at` (timestamptz) - When status changed to approved
- `approved_by` (uuid, FK → auth.users) - Admin who approved

**Indices:**

- `idx_providers_name_trgm` - GIN trigram index on name for fuzzy search
- `idx_providers_languages` - GIN index on languages array
- `idx_providers_geo` - GIST index on location for spatial queries
- `idx_providers_status` - B-tree index on status for filtering
- `idx_providers_category` - B-tree index on category
- `idx_providers_user_id` - B-tree index on user_id

**Constraints:**

- `check_status` - status IN ('pending_review', 'approved', 'rejected', 'suspended')
- `check_email_format` - email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'

---

### provider_photos

Multiple photos per provider for gallery/portfolio.

**Columns:**

- `id` (uuid, PK)
- `provider_id` (uuid, FK → providers, ON DELETE CASCADE)
- `photo_url` (text, NOT NULL) - Storage URL
- `caption` (text) - Optional photo description
- `display_order` (integer, DEFAULT 0) - Sort order
- `uploaded_at` (timestamptz, DEFAULT now())

**Indices:**

- `idx_provider_photos_provider_id` - B-tree index on provider_id
- `idx_provider_photos_display_order` - B-tree index on display_order

---

### provider_rituals

Structured list of rituals/services offered by providers.

**Columns:**

- `id` (uuid, PK)
- `provider_id` (uuid, FK → providers, ON DELETE CASCADE)
- `ritual_name` (text, NOT NULL) - Name of ritual/service
- `description` (text) - Optional details
- `created_at` (timestamptz, DEFAULT now())

**Indices:**

- `idx_provider_rituals_provider_id` - B-tree index on provider_id
- `idx_provider_rituals_name` - B-tree index on ritual_name for filtering

---

### admin_actions

Audit trail for all admin actions on providers.

**Columns:**

- `id` (uuid, PK)
- `provider_id` (uuid, FK → providers, ON DELETE CASCADE)
- `actor_id` (uuid, FK → auth.users) - Admin who performed action
- `action_type` (text, NOT NULL) - approved | rejected | suspended | unsuspended | edited
- `notes` (text) - Admin notes/reason
- `metadata` (jsonb) - Additional structured data (e.g., changed fields)
- `created_at` (timestamptz, DEFAULT now())

**Indices:**

- `idx_admin_actions_provider_id` - B-tree index on provider_id
- `idx_admin_actions_actor_id` - B-tree index on actor_id
- `idx_admin_actions_created_at` - B-tree index on created_at for sorting

**Constraints:**

- `check_action_type` - action_type IN ('approved', 'rejected', 'suspended', 'unsuspended', 'edited')

---

### admins

Admin user management.

**Columns:**

- `user_email` (text, PK) - Admin email (matches auth.users.email)
- `role` (text, DEFAULT 'admin') - admin | super_admin (for future role-based access)
- `added_at` (timestamptz, DEFAULT now())
- `added_by` (text) - Email of admin who added this user

**Indices:**

- `idx_admins_role` - B-tree index on role

---

### categories

Service category taxonomy for providers.

**Columns:**

- `code` (text, PK) - Machine-readable code (e.g., 'purohit', 'cook')
- `name` (text, NOT NULL) - Display name (e.g., 'Vedic Purohit')
- `description` (text) - Optional description
- `active` (boolean, NOT NULL, DEFAULT true) - Whether category is active
- `sort_order` (integer, NOT NULL, DEFAULT 0) - Display order
- `created_at` (timestamptz, DEFAULT now())

**Indices:**

- `idx_categories_active_order` - B-tree index on (active, sort_order)

**Seeded Values:**

- purohit, cook, essentials, senior-care, pilgrimage, other

---

### sampradayas

Religious tradition taxonomy for providers.

**Columns:**

- `code` (text, PK) - Machine-readable code (e.g., 'madhwa', 'smarta')
- `name` (text, NOT NULL) - Display name (e.g., 'Madhwa')
- `description` (text) - Optional description
- `active` (boolean, NOT NULL, DEFAULT true) - Whether sampradaya is active
- `sort_order` (integer, NOT NULL, DEFAULT 0) - Display order
- `created_at` (timestamptz, DEFAULT now())

**Indices:**

- `idx_sampradayas_active_order` - B-tree index on (active, sort_order)

**Seeded Values:**

- madhwa, smarta, vaishnava, shaivite, other

---

## Future-Ready Tables (Not implemented yet, but schema-ready)

### bookings

For future booking functionality.

**Columns:**

- `id` (uuid, PK)
- `provider_id` (uuid, FK → providers)
- `customer_id` (uuid, FK → auth.users)
- `service_type` (text)
- `scheduled_date` (date)
- `scheduled_time` (time)
- `status` (text) - pending | confirmed | completed | cancelled
- `notes` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

---

### reviews

For future review/rating functionality.

**Columns:**

- `id` (uuid, PK)
- `provider_id` (uuid, FK → providers)
- `reviewer_id` (uuid, FK → auth.users)
- `booking_id` (uuid, FK → bookings)
- `rating` (integer) - 1-5 stars
- `review_text` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Review Constraints:**

- `check_rating` - rating BETWEEN 1 AND 5

---

## Row Level Security (RLS) Policies

### providers

- **Public Read (approved)**: `SELECT` where `status = 'approved'`
- **Self Read/Write**: `ALL` where `auth.uid() = user_id`
- **Admin All**: `ALL` where user is in admins table

### provider_photos

- **Public Read**: `SELECT` where provider is approved
- **Self Write**: `INSERT/UPDATE/DELETE` where provider.user_id = auth.uid()
- **Admin All**: `ALL` where user is in admins table

### provider_rituals

- **Public Read**: `SELECT` where provider is approved
- **Self Write**: `INSERT/UPDATE/DELETE` where provider.user_id = auth.uid()
- **Admin All**: `ALL` where user is in admins table

### admin_actions

- **Admin Read/Write**: `ALL` where user is in admins table

### admins

- **Admin Read**: `SELECT` where user is in admins table

### categories

- **Public Read**: `SELECT` (all users can read categories)
- **Admin All**: `ALL` where user is in admins table

### sampradayas

- **Public Read**: `SELECT` (all users can read sampradayas)
- **Admin All**: `ALL` where user is in admins table

---

## Stored Procedures (RPC)

### search_providers

Enhanced search with multiple filters and geospatial support using normalized taxonomy codes.

**Parameters:**

- `p_text` (text) - Fuzzy text search on name
- `p_category_code` (text) - Filter by category code
- `p_languages` (text[]) - Filter by languages (array overlap)
- `p_sampradaya_code` (text) - Filter by sampradaya code
- `p_lat` (double precision) - User latitude
- `p_lon` (double precision) - User longitude
- `p_radius_km` (double precision, default 15) - Search radius
- `p_limit` (integer, default 50) - Result limit
- `p_offset` (integer, default 0) - Pagination offset

**Returns:** SETOF providers with calculated distance and taxonomy display names

---

### get_pending_providers

Get statistics for admin dashboard.

**Returns:** JSON with counts by status, avg approval time, etc.

---

### get_active_categories

Get all active categories for UI filters.

**Returns:** SETOF categories where active = true, ordered by sort_order

---

### get_active_sampradayas

Get all active sampradayas for UI filters.

**Returns:** SETOF sampradayas where active = true, ordered by sort_order

---

## Storage Buckets

### provider-photos

- **Access**: Private bucket with signed URLs
- **Policies**:
  - Authenticated users can upload
  - Admins can update/delete
  - Public can read via signed URLs

---

## Triggers

### update_providers_updated_at

Automatically update `updated_at` timestamp on providers table changes.

### log_provider_status_change

Automatically create admin_action record when provider status changes.

---

## Extensions Required

- `pg_trgm` - Trigram similarity for fuzzy text search
- `postgis` - Geospatial queries and distance calculations
- `uuid-ossp` - UUID generation (if not using gen_random_uuid)

---

## Views

### provider_with_taxonomies

Convenience view that joins providers with category and sampradaya display names.

**Columns:** All provider columns plus `category_name` and `sampradaya_name`

---

## Migration Strategy

1. Add new columns to existing providers table
2. Create new tables (provider_photos, provider_rituals)
3. Update RLS policies
4. Create/update stored procedures
5. Add triggers for automation
6. Create clean taxonomy tables (categories, sampradayas)
7. Replace legacy text columns with FK columns
8. Create helper views for easier querying

## Clean Implementation Benefits

Since you're in development stage with no production data:

- **Simpler schema** - No dual-field complexity
- **Better performance** - No redundant text columns
- **Cleaner API** - Consistent code-based parameters
- **Future-proof** - Production-ready from day 1
- **Easier testing** - Fewer edge cases to handle
