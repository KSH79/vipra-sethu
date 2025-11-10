-- Phase 1: Database i18n Infrastructure
-- Adds JSONB translation columns, indexes, data migration, and user language preference

-- Categories
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS name_translations JSONB DEFAULT '{"en": "", "kn": ""}'::jsonb,
  ADD COLUMN IF NOT EXISTS description_translations JSONB DEFAULT '{"en": "", "kn": ""}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_categories_name_translations ON public.categories USING GIN (name_translations);
CREATE INDEX IF NOT EXISTS idx_categories_description_translations ON public.categories USING GIN (description_translations);

UPDATE public.categories
SET 
  name_translations = jsonb_build_object('en', COALESCE(name, ''), 'kn', COALESCE(name_translations->>'kn', '')),
  description_translations = CASE 
    WHEN description IS NOT NULL THEN jsonb_build_object('en', description, 'kn', COALESCE(description_translations->>'kn', ''))
    ELSE description_translations
  END
WHERE (name_translations = '{"en": "", "kn": ""}'::jsonb OR name_translations IS NULL);

-- Sampradayas
ALTER TABLE public.sampradayas
  ADD COLUMN IF NOT EXISTS name_translations JSONB DEFAULT '{"en": "", "kn": ""}'::jsonb,
  ADD COLUMN IF NOT EXISTS description_translations JSONB DEFAULT '{"en": "", "kn": ""}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_sampradayas_name_translations ON public.sampradayas USING GIN (name_translations);
CREATE INDEX IF NOT EXISTS idx_sampradayas_description_translations ON public.sampradayas USING GIN (description_translations);

UPDATE public.sampradayas
SET 
  name_translations = jsonb_build_object('en', COALESCE(name, ''), 'kn', COALESCE(name_translations->>'kn', '')),
  description_translations = CASE 
    WHEN description IS NOT NULL THEN jsonb_build_object('en', description, 'kn', COALESCE(description_translations->>'kn', ''))
    ELSE description_translations
  END
WHERE (name_translations = '{"en": "", "kn": ""}'::jsonb OR name_translations IS NULL);

-- Languages (optional i18n for display name)
ALTER TABLE public.languages
  ADD COLUMN IF NOT EXISTS name_translations JSONB DEFAULT '{"en": "", "kn": ""}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_languages_name_translations ON public.languages USING GIN (name_translations);

UPDATE public.languages
SET name_translations = jsonb_build_object('en', COALESCE(name, ''), 'kn', COALESCE(name_translations->>'kn', ''))
WHERE (name_translations = '{"en": "", "kn": ""}'::jsonb OR name_translations IS NULL);

-- Service Radius Options
ALTER TABLE public.service_radius_options
  ADD COLUMN IF NOT EXISTS name_translations JSONB DEFAULT '{"en": "", "kn": ""}'::jsonb,
  ADD COLUMN IF NOT EXISTS description_translations JSONB DEFAULT '{"en": "", "kn": ""}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_service_radius_name_translations ON public.service_radius_options USING GIN (name_translations);
CREATE INDEX IF NOT EXISTS idx_service_radius_description_translations ON public.service_radius_options USING GIN (description_translations);

DO $$
DECLARE
  has_display_text boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'service_radius_options' AND column_name = 'display_text'
  ) INTO has_display_text;

  IF has_display_text THEN
    EXECUTE $upd$
      UPDATE public.service_radius_options
      SET 
        name_translations = jsonb_build_object('en', COALESCE(display_text, ''), 'kn', COALESCE(name_translations->>'kn', '')),
        description_translations = CASE 
          WHEN description IS NOT NULL THEN jsonb_build_object('en', description, 'kn', COALESCE(description_translations->>'kn', ''))
          ELSE description_translations
        END
      WHERE (name_translations = '{"en": "", "kn": ""}'::jsonb OR name_translations IS NULL);
    $upd$;
  ELSE
    -- Fallback if a legacy column 'name' exists instead of 'display_text'
    EXECUTE $upd$
      UPDATE public.service_radius_options
      SET 
        name_translations = jsonb_build_object('en', COALESCE(name, ''), 'kn', COALESCE(name_translations->>'kn', '')),
        description_translations = CASE 
          WHEN description IS NOT NULL THEN jsonb_build_object('en', description, 'kn', COALESCE(description_translations->>'kn', ''))
          ELSE description_translations
        END
      WHERE (name_translations = '{"en": "", "kn": ""}'::jsonb OR name_translations IS NULL);
    $upd$;
  END IF;
END $$;

-- Experience Levels
ALTER TABLE public.experience_levels
  ADD COLUMN IF NOT EXISTS name_translations JSONB DEFAULT '{"en": "", "kn": ""}'::jsonb,
  ADD COLUMN IF NOT EXISTS description_translations JSONB DEFAULT '{"en": "", "kn": ""}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_experience_levels_name_translations ON public.experience_levels USING GIN (name_translations);
CREATE INDEX IF NOT EXISTS idx_experience_levels_description_translations ON public.experience_levels USING GIN (description_translations);

UPDATE public.experience_levels
SET 
  name_translations = jsonb_build_object('en', COALESCE(name, ''), 'kn', COALESCE(name_translations->>'kn', '')),
  description_translations = CASE 
    WHEN description IS NOT NULL THEN jsonb_build_object('en', description, 'kn', COALESCE(description_translations->>'kn', ''))
    ELSE description_translations
  END
WHERE (name_translations = '{"en": "", "kn": ""}'::jsonb OR name_translations IS NULL);

-- Terms (content translations)
ALTER TABLE public.terms
  ADD COLUMN IF NOT EXISTS content_translations JSONB DEFAULT '{"en": "", "kn": ""}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_terms_content_translations ON public.terms USING GIN (content_translations);

UPDATE public.terms
SET content_translations = jsonb_build_object('en', COALESCE(content, ''), 'kn', COALESCE(content_translations->>'kn', ''))
WHERE (content_translations = '{"en": "", "kn": ""}'::jsonb OR content_translations IS NULL);

-- Profiles: user language preference (only if profiles table exists)
DO $$
DECLARE
  has_profiles boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) INTO has_profiles;

  IF has_profiles THEN
    EXECUTE 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT ''en''';
    -- reset and add constraint in a single statement for idempotency
    EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_valid_language';
    EXECUTE 'ALTER TABLE public.profiles ADD CONSTRAINT check_valid_language CHECK (preferred_language IN (''en'',''kn'',''hi'',''ta'',''te'',''ml'',''mr'',''gu'',''bn'',''pa''))';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language ON public.profiles(preferred_language)';
    EXECUTE 'UPDATE public.profiles SET preferred_language = ''en'' WHERE preferred_language IS NULL';
  END IF;
END $$;
