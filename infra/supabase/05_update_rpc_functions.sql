-- Migration: Update and create RPC functions
-- Description: Enhanced search function and new admin stats function
-- Run this after triggers are created

-- ============================================================================
-- Function: Enhanced search_providers with pagination
-- ============================================================================
CREATE OR REPLACE FUNCTION search_providers(
  p_text text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_languages text[] DEFAULT NULL,
  p_sampradaya text DEFAULT NULL,
  p_lat double precision DEFAULT NULL,
  p_lon double precision DEFAULT NULL,
  p_radius_km double precision DEFAULT 15,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
) 
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  email text,
  phone text,
  whatsapp text,
  category text,
  languages text[],
  sampradaya text,
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
LANGUAGE sql STABLE AS $$
  SELECT 
    p.*,
    CASE 
      WHEN p_lat IS NOT NULL AND p_lon IS NOT NULL AND p.location IS NOT NULL 
      THEN ST_Distance(p.location, ST_MakePoint(p_lon, p_lat)::geography) / 1000.0
      ELSE NULL
    END AS distance_km
  FROM providers p
  WHERE p.status = 'approved'
    AND (p_category IS NULL OR p.category = p_category)
    AND (p_sampradaya IS NULL OR p.sampradaya = p_sampradaya)
    AND (p_languages IS NULL OR p.languages && p_languages)
    AND (p_text IS NULL OR p.name ILIKE '%' || p_text || '%')
    AND (
      p_lat IS NULL OR p_lon IS NULL OR 
      (p.location IS NOT NULL AND ST_DWithin(
        p.location, 
        ST_MakePoint(p_lon, p_lat)::geography, 
        p_radius_km * 1000
      ))
    )
  ORDER BY 
    CASE 
      WHEN p_lat IS NOT NULL AND p_lon IS NOT NULL AND p.location IS NOT NULL 
      THEN ST_Distance(p.location, ST_MakePoint(p_lon, p_lat)::geography)
      ELSE 999999999
    END ASC,
    p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;

COMMENT ON FUNCTION search_providers IS 'Enhanced provider search with filters, geospatial support, and pagination';

-- ============================================================================
-- Function: Get provider statistics for admin dashboard
-- ============================================================================
CREATE OR REPLACE FUNCTION get_provider_stats()
RETURNS jsonb
LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object(
    'total_providers', (SELECT COUNT(*) FROM providers),
    'pending_review', (SELECT COUNT(*) FROM providers WHERE status = 'pending_review'),
    'approved', (SELECT COUNT(*) FROM providers WHERE status = 'approved'),
    'rejected', (SELECT COUNT(*) FROM providers WHERE status = 'rejected'),
    'suspended', (SELECT COUNT(*) FROM providers WHERE status = 'suspended'),
    'avg_approval_time_hours', (
      SELECT COALESCE(
        AVG(EXTRACT(EPOCH FROM (approved_at - created_at)) / 3600.0)::numeric(10,2),
        0
      )
      FROM providers 
      WHERE approved_at IS NOT NULL
    ),
    'providers_this_month', (
      SELECT COUNT(*) 
      FROM providers 
      WHERE created_at >= date_trunc('month', now())
    ),
    'approved_this_month', (
      SELECT COUNT(*) 
      FROM providers 
      WHERE approved_at >= date_trunc('month', now())
    ),
    'by_category', (
      SELECT jsonb_object_agg(category, count)
      FROM (
        SELECT category, COUNT(*) as count
        FROM providers
        WHERE status = 'approved'
        GROUP BY category
      ) cat_counts
    ),
    'recent_actions', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', aa.id,
          'provider_name', p.name,
          'action_type', aa.action_type,
          'created_at', aa.created_at
        )
      )
      FROM admin_actions aa
      JOIN providers p ON p.id = aa.provider_id
      ORDER BY aa.created_at DESC
      LIMIT 10
    )
  );
$$;

COMMENT ON FUNCTION get_provider_stats IS 'Returns comprehensive statistics for admin dashboard';

-- ============================================================================
-- Function: Get provider with related data
-- ============================================================================
CREATE OR REPLACE FUNCTION get_provider_details(provider_id uuid)
RETURNS jsonb
LANGUAGE sql STABLE AS $$
  SELECT jsonb_build_object(
    'provider', row_to_json(p.*),
    'photos', (
      SELECT COALESCE(jsonb_agg(row_to_json(ph.*) ORDER BY ph.display_order), '[]'::jsonb)
      FROM provider_photos ph
      WHERE ph.provider_id = p.id
    ),
    'rituals', (
      SELECT COALESCE(jsonb_agg(row_to_json(pr.*)), '[]'::jsonb)
      FROM provider_rituals pr
      WHERE pr.provider_id = p.id
    ),
    'admin_actions', (
      SELECT COALESCE(jsonb_agg(row_to_json(aa.*) ORDER BY aa.created_at DESC), '[]'::jsonb)
      FROM admin_actions aa
      WHERE aa.provider_id = p.id
    )
  )
  FROM providers p
  WHERE p.id = provider_id;
$$;

COMMENT ON FUNCTION get_provider_details IS 'Returns provider with all related photos, rituals, and admin actions';

-- ============================================================================
-- Function: Check if user is admin
-- ============================================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM admins a
    WHERE a.user_email = auth.jwt() ->> 'email'
  );
$$;

COMMENT ON FUNCTION is_admin IS 'Returns true if current user is an admin';

-- ============================================================================
-- Function: Get pending providers for admin review
-- ============================================================================
CREATE OR REPLACE FUNCTION get_pending_providers(
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  phone text,
  category text,
  languages text[],
  sampradaya text,
  location_text text,
  years_experience integer,
  about text,
  created_at timestamptz,
  days_pending integer
)
LANGUAGE sql STABLE AS $$
  SELECT 
    p.id,
    p.name,
    p.email,
    p.phone,
    p.category,
    p.languages,
    p.sampradaya,
    p.location_text,
    p.years_experience,
    p.about,
    p.created_at,
    EXTRACT(DAY FROM (now() - p.created_at))::integer AS days_pending
  FROM providers p
  WHERE p.status = 'pending_review'
  ORDER BY p.created_at ASC
  LIMIT p_limit
  OFFSET p_offset;
$$;

COMMENT ON FUNCTION get_pending_providers IS 'Returns providers pending admin review with days pending calculation';
