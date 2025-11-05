-- Migration: Create triggers for automation
-- Description: Triggers for updated_at timestamp and status change logging
-- Run this after RLS policies are set up

-- ============================================================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to providers table
DROP TRIGGER IF EXISTS update_providers_updated_at ON providers;
CREATE TRIGGER update_providers_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates the updated_at timestamp on row modification';

-- ============================================================================
-- Trigger: Log provider status changes
-- ============================================================================
CREATE OR REPLACE FUNCTION log_provider_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO admin_actions (
      provider_id,
      actor_id,
      action_type,
      notes,
      metadata
    ) VALUES (
      NEW.id,
      auth.uid(), -- Current user who made the change
      NEW.status, -- Use status as action_type (approved, rejected, suspended)
      CASE 
        WHEN NEW.status = 'rejected' THEN NEW.rejection_reason
        ELSE 'Status changed from ' || OLD.status || ' to ' || NEW.status
      END,
      jsonb_build_object(
        'previous_status', OLD.status,
        'new_status', NEW.status,
        'changed_at', now()
      )
    );
    
    -- Update approved_at and approved_by if status changed to approved
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
      NEW.approved_at = now();
      NEW.approved_by = auth.uid();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to providers table
DROP TRIGGER IF EXISTS log_provider_status_change_trigger ON providers;
CREATE TRIGGER log_provider_status_change_trigger
  BEFORE UPDATE ON providers
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_provider_status_change();

COMMENT ON FUNCTION log_provider_status_change() IS 'Automatically logs admin actions when provider status changes';

-- ============================================================================
-- Trigger: Validate admin actions
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure actor_id is set (either from NEW or from auth.uid())
  IF NEW.actor_id IS NULL THEN
    NEW.actor_id = auth.uid();
  END IF;
  
  -- Validate that actor is an admin
  IF NOT EXISTS (
    SELECT 1 FROM admins a 
    WHERE a.user_email = (
      SELECT email FROM auth.users WHERE id = NEW.actor_id
    )
  ) THEN
    RAISE EXCEPTION 'Only admins can create admin actions';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to admin_actions table
DROP TRIGGER IF EXISTS validate_admin_action_trigger ON admin_actions;
CREATE TRIGGER validate_admin_action_trigger
  BEFORE INSERT ON admin_actions
  FOR EACH ROW
  EXECUTE FUNCTION validate_admin_action();

COMMENT ON FUNCTION validate_admin_action() IS 'Validates that admin actions are only created by actual admins';
