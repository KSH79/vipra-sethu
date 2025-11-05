-- Migration: Create new tables for provider photos, rituals, and enhanced admin tracking
-- Description: Creates provider_photos, provider_rituals tables and updates admin tables
-- Run this after altering the providers table

-- ============================================================================
-- provider_photos table
-- ============================================================================
CREATE TABLE IF NOT EXISTS provider_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  caption text,
  display_order integer DEFAULT 0,
  uploaded_at timestamptz DEFAULT now()
);

-- Indices for provider_photos
CREATE INDEX IF NOT EXISTS idx_provider_photos_provider_id ON provider_photos(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_photos_display_order ON provider_photos(provider_id, display_order);

-- Comments
COMMENT ON TABLE provider_photos IS 'Multiple photos per provider for gallery/portfolio';
COMMENT ON COLUMN provider_photos.photo_url IS 'Storage URL for the photo';
COMMENT ON COLUMN provider_photos.caption IS 'Optional photo description';
COMMENT ON COLUMN provider_photos.display_order IS 'Sort order for displaying photos (lower numbers first)';

-- ============================================================================
-- provider_rituals table
-- ============================================================================
CREATE TABLE IF NOT EXISTS provider_rituals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  ritual_name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Indices for provider_rituals
CREATE INDEX IF NOT EXISTS idx_provider_rituals_provider_id ON provider_rituals(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_rituals_name ON provider_rituals(ritual_name);

-- Comments
COMMENT ON TABLE provider_rituals IS 'Structured list of rituals/services offered by providers';
COMMENT ON COLUMN provider_rituals.ritual_name IS 'Name of the ritual or service (e.g., "Upanayana", "Gruha Pravesha")';
COMMENT ON COLUMN provider_rituals.description IS 'Optional details about the ritual/service';

-- ============================================================================
-- Update admin_actions table
-- ============================================================================
-- Add new columns to admin_actions
ALTER TABLE admin_actions
ADD COLUMN IF NOT EXISTS metadata jsonb,
DROP COLUMN IF EXISTS type,
ADD COLUMN IF NOT EXISTS action_type text NOT NULL DEFAULT 'edited';

-- Update constraint for action_type
ALTER TABLE admin_actions
DROP CONSTRAINT IF EXISTS check_action_type;

ALTER TABLE admin_actions
ADD CONSTRAINT check_action_type 
CHECK (action_type IN ('approved', 'rejected', 'suspended', 'unsuspended', 'edited'));

-- Rename 'at' column to 'created_at' for consistency
ALTER TABLE admin_actions
RENAME COLUMN at TO created_at;

-- Add indices for admin_actions
CREATE INDEX IF NOT EXISTS idx_admin_actions_provider_id ON admin_actions(provider_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_actor_id ON admin_actions(actor_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type);

-- Comments
COMMENT ON TABLE admin_actions IS 'Audit trail for all admin actions on providers';
COMMENT ON COLUMN admin_actions.action_type IS 'Type of action: approved, rejected, suspended, unsuspended, edited';
COMMENT ON COLUMN admin_actions.metadata IS 'Additional structured data (e.g., changed fields, previous values)';

-- ============================================================================
-- Update admins table
-- ============================================================================
-- Add new columns to admins
ALTER TABLE admins
ADD COLUMN IF NOT EXISTS role text DEFAULT 'admin',
ADD COLUMN IF NOT EXISTS added_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS added_by text;

-- Add index for role
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);

-- Comments
COMMENT ON TABLE admins IS 'Admin user management with role-based access';
COMMENT ON COLUMN admins.role IS 'Admin role: admin or super_admin (for future RBAC)';
COMMENT ON COLUMN admins.added_at IS 'Timestamp when admin was added';
COMMENT ON COLUMN admins.added_by IS 'Email of admin who added this user';
