-- Migration: Alter providers table to add new columns
-- Description: Adds email, experience, detailed info fields, and audit columns
-- Run this first before creating new tables

-- Add new columns to providers table
ALTER TABLE providers
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS years_experience integer,
ADD COLUMN IF NOT EXISTS about text,
ADD COLUMN IF NOT EXISTS location_text text,
ADD COLUMN IF NOT EXISTS service_radius_km integer,
ADD COLUMN IF NOT EXISTS availability_notes text,
ADD COLUMN IF NOT EXISTS travel_notes text,
ADD COLUMN IF NOT EXISTS expectations text[],
ADD COLUMN IF NOT EXISTS response_time_hours integer,
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS profile_photo_url text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id);

-- Rename photo_url to profile_photo_url if it exists (backward compatibility)
-- Note: If you already have photo_url, you may want to migrate data first
-- ALTER TABLE providers RENAME COLUMN photo_url TO profile_photo_url;

-- Add email format constraint
ALTER TABLE providers
ADD CONSTRAINT check_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Update status constraint to include new statuses
ALTER TABLE providers
DROP CONSTRAINT IF EXISTS check_status;

ALTER TABLE providers
ADD CONSTRAINT check_status 
CHECK (status IN ('pending_review', 'approved', 'rejected', 'suspended'));

-- Add new indices for better query performance
CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(status);
CREATE INDEX IF NOT EXISTS idx_providers_category ON providers(category);
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_email ON providers(email);
CREATE INDEX IF NOT EXISTS idx_providers_updated_at ON providers(updated_at DESC);

-- Add comment to table
COMMENT ON TABLE providers IS 'Primary provider information with contact details and status tracking';

-- Add comments to new columns
COMMENT ON COLUMN providers.email IS 'Email address for contact';
COMMENT ON COLUMN providers.years_experience IS 'Years of professional experience';
COMMENT ON COLUMN providers.about IS 'Detailed description of provider and services';
COMMENT ON COLUMN providers.location_text IS 'Human-readable location (e.g., "Basavanagudi, Bangalore")';
COMMENT ON COLUMN providers.service_radius_km IS 'Willing to travel distance in kilometers';
COMMENT ON COLUMN providers.availability_notes IS 'Availability description and scheduling requirements';
COMMENT ON COLUMN providers.travel_notes IS 'Travel preferences and additional charges';
COMMENT ON COLUMN providers.expectations IS 'Array of expectations/requirements from clients';
COMMENT ON COLUMN providers.response_time_hours IS 'Typical response time in hours';
COMMENT ON COLUMN providers.rejection_reason IS 'Reason for rejection if status is rejected';
COMMENT ON COLUMN providers.profile_photo_url IS 'Primary profile photo URL from storage';
COMMENT ON COLUMN providers.updated_at IS 'Last update timestamp';
COMMENT ON COLUMN providers.approved_at IS 'Timestamp when status changed to approved';
COMMENT ON COLUMN providers.approved_by IS 'Admin user who approved the provider';
