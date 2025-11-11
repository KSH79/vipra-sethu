-- Phase 1 Rollback: Database i18n Infrastructure
-- Reverse JSONB translation columns, indexes, and user language preference

-- Categories
DROP INDEX IF EXISTS idx_categories_name_translations;
DROP INDEX IF EXISTS idx_categories_description_translations;
ALTER TABLE public.categories 
  DROP COLUMN IF EXISTS name_translations,
  DROP COLUMN IF EXISTS description_translations;

-- Sampradayas
DROP INDEX IF EXISTS idx_sampradayas_name_translations;
DROP INDEX IF EXISTS idx_sampradayas_description_translations;
ALTER TABLE public.sampradayas 
  DROP COLUMN IF EXISTS name_translations,
  DROP COLUMN IF EXISTS description_translations;

-- Languages
DROP INDEX IF EXISTS idx_languages_name_translations;
ALTER TABLE public.languages 
  DROP COLUMN IF EXISTS name_translations;

-- Service Radius Options
DROP INDEX IF EXISTS idx_service_radius_name_translations;
DROP INDEX IF EXISTS idx_service_radius_description_translations;
ALTER TABLE public.service_radius_options 
  DROP COLUMN IF EXISTS name_translations,
  DROP COLUMN IF EXISTS description_translations;

-- Experience Levels
DROP INDEX IF EXISTS idx_experience_levels_name_translations;
DROP INDEX IF EXISTS idx_experience_levels_description_translations;
ALTER TABLE public.experience_levels 
  DROP COLUMN IF EXISTS name_translations,
  DROP COLUMN IF EXISTS description_translations;

-- Terms (content translations)
DROP INDEX IF EXISTS idx_terms_content_translations;
ALTER TABLE public.terms 
  DROP COLUMN IF EXISTS content_translations;

-- Profiles: user language preference
DROP INDEX IF EXISTS idx_profiles_preferred_language;
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS check_valid_language,
  DROP COLUMN IF EXISTS preferred_language;
