-- Migration: Clean RPC functions and views for taxonomy support
-- Description: Simplified functions without legacy compatibility
-- Order: Run after 06_clean_taxonomy_tables.sql

-- ============================================================================
-- 1) Create helper view with taxonomy display names
-- ============================================================================
create or replace view provider_with_taxonomies as
select
  p.*,
  c.name as category_name,
  s.name as sampradaya_name
from providers p
left join categories c on c.code = p.category_code
left join sampradayas s on s.code = p.sampradaya_code;

comment on view provider_with_taxonomies is 'Providers with resolved category and sampradaya display names';

-- ============================================================================
-- 2) Clean search_providers with code-based filters only
-- ============================================================================
-- Drop existing function to avoid ambiguity
DROP FUNCTION IF EXISTS search_providers(
  p_text text,
  p_category text,
  p_languages text[],
  p_sampradaya text,
  p_lat double precision,
  p_lon double precision,
  p_radius_km double precision,
  p_limit int
);

create or replace function search_providers(
  p_text text default null,
  p_category_code text default null,
  p_languages text[] default null,
  p_sampradaya_code text default null,
  p_lat double precision default null,
  p_lon double precision default null,
  p_radius_km double precision default 15,
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  id uuid,
  user_id uuid,
  name text,
  email text,
  phone text,
  whatsapp text,
  category_code text,
  category_name text,
  languages text[],
  sampradaya_code text,
  sampradaya_name text,
  years_experience integer,
  about text,
  location_text text,
  location geography,
  service_radius_km integer,
  availability_notes text,
  travel_notes text,
  expectations text[],
  response_time_hours integer,
  status text,
  profile_photo_url text,
  created_at timestamptz,
  updated_at timestamptz,
  distance_km double precision
)
language sql stable as $$
  select
    p.id,
    p.user_id,
    p.name,
    p.email,
    p.phone,
    p.whatsapp,
    p.category_code,
    c.name as category_name,
    p.languages,
    p.sampradaya_code,
    s.name as sampradaya_name,
    p.years_experience,
    p.about,
    p.location_text,
    p.location,
    p.service_radius_km,
    p.availability_notes,
    p.travel_notes,
    p.expectations,
    p.response_time_hours,
    p.status,
    p.profile_photo_url,
    p.created_at,
    p.updated_at,
    case
      when p_lat is not null and p_lon is not null and p.location is not null
      then st_distance(p.location, st_makepoint(p_lon, p_lat)::geography) / 1000.0
      else null
    end as distance_km
  from providers p
  left join categories c on c.code = p.category_code
  left join sampradayas s on s.code = p.sampradaya_code
  where p.status = 'approved'
    and (p_category_code is null or p.category_code = p_category_code)
    and (p_sampradaya_code is null or p.sampradaya_code = p_sampradaya_code)
    and (p_languages is null or p.languages && p_languages)
    and (p_text is null or p.name ilike '%' || p_text || '%')
    and (
      p_lat is null or p_lon is null or
      (p.location is not null and st_dwithin(
        p.location,
        st_makepoint(p_lon, p_lat)::geography,
        p_radius_km * 1000
      ))
    )
  order by
    case
      when p_lat is not null and p_lon is not null and p.location is not null
      then st_distance(p.location, st_makepoint(p_lon, p_lat)::geography)
      else 999999999
    end asc,
    p.created_at desc
  limit p_limit
  offset p_offset;
$$;

comment on function search_providers is 'Clean provider search with code-based filters and taxonomy display names';

-- ============================================================================
-- 3) Get active categories for UI filters
-- ============================================================================
create or replace function get_active_categories()
returns setof categories
language sql stable as $$
  select * from categories
  where active = true
  order by sort_order, name;
$$;

comment on function get_active_categories is 'Returns all active categories ordered by sort_order for UI filter dropdowns';

-- ============================================================================
-- 4) Get active sampradayas for UI filters
-- ============================================================================
create or replace function get_active_sampradayas()
returns setof sampradayas
language sql stable as $$
  select * from sampradayas
  where active = true
  order by sort_order, name;
$$;

comment on function get_active_sampradayas is 'Returns all active sampradayas ordered by sort_order for UI filter dropdowns';

-- ============================================================================
-- 5) Enhanced get_provider_details with taxonomy names
-- ============================================================================
create or replace function get_provider_details(provider_id uuid)
returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'provider', (
      select row_to_json(pvt.*)
      from provider_with_taxonomies pvt
      where pvt.id = provider_id
    ),
    'photos', (
      select coalesce(jsonb_agg(row_to_json(ph.*) order by ph.display_order), '[]'::jsonb)
      from provider_photos ph
      where ph.provider_id = get_provider_details.provider_id
    ),
    'rituals', (
      select coalesce(jsonb_agg(row_to_json(pr.*)), '[]'::jsonb)
      from provider_rituals pr
      where pr.provider_id = get_provider_details.provider_id
    ),
    'admin_actions', (
      select coalesce(jsonb_agg(row_to_json(aa.*) order by aa.created_at desc), '[]'::jsonb)
      from admin_actions aa
      where aa.provider_id = get_provider_details.provider_id
    )
  );
$$;

comment on function get_provider_details is 'Returns provider with taxonomy names and all related photos, rituals, and admin actions';

-- ============================================================================
-- 6) Get category statistics for admin dashboard
-- ============================================================================
create or replace function get_category_stats()
returns jsonb
language sql stable as $$
  select jsonb_object_agg(
    coalesce(c.name, 'Uncategorized'),
    provider_count
  )
  from (
    select
      p.category_code,
      count(*) as provider_count
    from providers p
    where p.status = 'approved'
    group by p.category_code
  ) counts
  left join categories c on c.code = counts.category_code;
$$;

comment on function get_category_stats is 'Returns count of approved providers by category for analytics';

-- ============================================================================
-- 7) Get sampradaya statistics for admin dashboard
-- ============================================================================
create or replace function get_sampradaya_stats()
returns jsonb
language sql stable as $$
  select jsonb_object_agg(
    coalesce(s.name, 'Not specified'),
    provider_count
  )
  from (
    select
      p.sampradaya_code,
      count(*) as provider_count
    from providers p
    where p.status = 'approved'
    group by p.sampradaya_code
  ) counts
  left join sampradayas s on s.code = counts.sampradaya_code;
$$;

comment on function get_sampradaya_stats is 'Returns count of approved providers by sampradaya for analytics';
