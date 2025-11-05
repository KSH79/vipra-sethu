-- Migration: Update Row Level Security (RLS) policies
-- Description: Updates RLS policies for all tables including new tables
-- Run this after creating new tables

-- ============================================================================
-- Drop existing policies to recreate them
-- ============================================================================
DROP POLICY IF EXISTS providers_public_read ON providers;
DROP POLICY IF EXISTS providers_self_rw ON providers;
DROP POLICY IF EXISTS providers_admin_all ON providers;
DROP POLICY IF EXISTS admin_actions_admin ON admin_actions;
DROP POLICY IF EXISTS admins_read ON admins;
DROP POLICY IF EXISTS admins_self_read ON admins;

-- ============================================================================
-- providers table policies
-- ============================================================================
-- Public can read approved providers
CREATE POLICY providers_public_read ON providers
  FOR SELECT
  USING (status = 'approved');

-- Users can read and write their own provider profiles
CREATE POLICY providers_self_read ON providers
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY providers_self_insert ON providers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY providers_self_update ON providers
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins have full access
CREATE POLICY providers_admin_all ON providers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins a 
      WHERE a.user_email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins a 
      WHERE a.user_email = auth.jwt() ->> 'email'
    )
  );

-- ============================================================================
-- provider_photos table policies
-- ============================================================================
ALTER TABLE provider_photos ENABLE ROW LEVEL SECURITY;

-- Public can read photos of approved providers
CREATE POLICY provider_photos_public_read ON provider_photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM providers p
      WHERE p.id = provider_photos.provider_id
      AND p.status = 'approved'
    )
  );

-- Users can manage their own provider photos
CREATE POLICY provider_photos_self_insert ON provider_photos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM providers p
      WHERE p.id = provider_photos.provider_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY provider_photos_self_update ON provider_photos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM providers p
      WHERE p.id = provider_photos.provider_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY provider_photos_self_delete ON provider_photos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM providers p
      WHERE p.id = provider_photos.provider_id
      AND p.user_id = auth.uid()
    )
  );

-- Admins have full access
CREATE POLICY provider_photos_admin_all ON provider_photos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins a 
      WHERE a.user_email = auth.jwt() ->> 'email'
    )
  );

-- ============================================================================
-- provider_rituals table policies
-- ============================================================================
ALTER TABLE provider_rituals ENABLE ROW LEVEL SECURITY;

-- Public can read rituals of approved providers
CREATE POLICY provider_rituals_public_read ON provider_rituals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM providers p
      WHERE p.id = provider_rituals.provider_id
      AND p.status = 'approved'
    )
  );

-- Users can manage their own provider rituals
CREATE POLICY provider_rituals_self_insert ON provider_rituals
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM providers p
      WHERE p.id = provider_rituals.provider_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY provider_rituals_self_update ON provider_rituals
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM providers p
      WHERE p.id = provider_rituals.provider_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY provider_rituals_self_delete ON provider_rituals
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM providers p
      WHERE p.id = provider_rituals.provider_id
      AND p.user_id = auth.uid()
    )
  );

-- Admins have full access
CREATE POLICY provider_rituals_admin_all ON provider_rituals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins a 
      WHERE a.user_email = auth.jwt() ->> 'email'
    )
  );

-- ============================================================================
-- admin_actions table policies
-- ============================================================================
-- Only admins can read and write admin actions
CREATE POLICY admin_actions_admin_all ON admin_actions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins a 
      WHERE a.user_email = auth.jwt() ->> 'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins a 
      WHERE a.user_email = auth.jwt() ->> 'email'
    )
  );

-- ============================================================================
-- admins table policies
-- ============================================================================
-- Only admins can read the admins table
-- IMPORTANT: Avoid recursive reference to admins within admins policy.
-- The previous EXISTS(.. FROM admins ..) caused "infinite recursion detected in policy" errors.
-- Use a self-filter based on the JWT email instead.
CREATE POLICY admins_self_read ON admins
  FOR SELECT
  USING (user_email = (auth.jwt() ->> 'email'));

-- Only super_admins can insert/update/delete admins (future feature)
-- For now, this needs to be done via SQL or Supabase dashboard
