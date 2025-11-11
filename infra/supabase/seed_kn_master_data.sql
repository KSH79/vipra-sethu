-- Seed Kannada (kn) translations for master data JSONB fields
-- Safe to run multiple times: updates only where 'kn' is missing.
-- Tables covered:
--   - categories (name_translations, description_translations)
--   - sampradayas (name_translations, description_translations)
--   - languages (name_translations, description_translations)
--   - service_radius_options (name_translations for display_text, description_translations)
--   - experience_levels (name_translations, description_translations)
--   - terms (content_translations, description_translations)

DO $$
DECLARE
  _has boolean;
BEGIN

-- Helper: function to set kn only when absent
-- Note: Using inline expressions with jsonb_set and WHERE to avoid overwriting existing kn.

-------------------------------------------------------------------------------
-- categories
-------------------------------------------------------------------------------
-- Known code → Kannada name mapping (extend if needed)
-- purohit → ವೈದಿಕ ಪುರೋಹಿತ; cook → ಅಡುಗೆಯವರು; essentials → ಅಗತ್ಯಗಳು; seniorCare → ವರಿಷ್ಠ ಆರೈಕೆ; pilgrimage → ತೀರ್ಥಯಾತ್ರೆ ಮಾರ್ಗದರ್ಶಿ; other → ಇತರೆ

SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_schema='public' AND table_name='categories' AND column_name='name_translations'
) INTO _has;
IF _has THEN
  EXECUTE $_upd$
    UPDATE categories c
    SET name_translations = jsonb_set(COALESCE(c.name_translations, '{}'::jsonb), '{kn}', to_jsonb(
      CASE lower(c.code)
        WHEN 'purohit' THEN 'ವೈದಿಕ ಪುರೋಹಿತ'
        WHEN 'cook' THEN 'ಅಡುಗೆಯವರು'
        WHEN 'essentials' THEN 'ಅಗತ್ಯಗಳು'
        WHEN 'seniorcare' THEN 'ವರಿಷ್ಠ ಆರೈಕೆ'
        WHEN 'pilgrimage' THEN 'ತೀರ್ಥಯಾತ್ರೆ ಮಾರ್ಗದರ್ಶಿ'
        WHEN 'other' THEN 'ಇತರೆ'
        ELSE c.name
      END
    ), true)
    WHERE (c.name_translations ->> 'kn') IS NULL;
  $_upd$;
END IF;

SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_schema='public' AND table_name='categories' AND column_name='description_translations'
) INTO _has;
IF _has THEN
  EXECUTE $_upd$
    UPDATE categories c
    SET description_translations = jsonb_set(COALESCE(c.description_translations, '{}'::jsonb), '{kn}', to_jsonb(COALESCE(c.description, '')), true)
    WHERE (c.description_translations ->> 'kn') IS NULL;
  $_upd$;
END IF;

-------------------------------------------------------------------------------
-- sampradayas
-------------------------------------------------------------------------------
-- Codes: madhwa → ಮಾಧ್ವ; smarta → ಸ್ಮಾರ್ತ; vaishnava → ವೈಷ್ಣವ; shaivite → ಶೈವ; other → ಇತರೆ

SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_schema='public' AND table_name='sampradayas' AND column_name='name_translations'
) INTO _has;
IF _has THEN
  EXECUTE $_upd$
    UPDATE sampradayas s
    SET name_translations = jsonb_set(COALESCE(s.name_translations, '{}'::jsonb), '{kn}', to_jsonb(
      CASE lower(s.code)
        WHEN 'madhwa' THEN 'ಮಾಧ್ವ'
        WHEN 'smarta' THEN 'ಸ್ಮಾರ್ತ'
        WHEN 'vaishnava' THEN 'ವೈಷ್ಣವ'
        WHEN 'shaivite' THEN 'ಶೈವ'
        WHEN 'other' THEN 'ಇತರೆ'
        ELSE s.name
      END
    ), true)
    WHERE (s.name_translations ->> 'kn') IS NULL;
  $_upd$;
END IF;

SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_schema='public' AND table_name='sampradayas' AND column_name='description_translations'
) INTO _has;
IF _has THEN
  EXECUTE $_upd$
    UPDATE sampradayas s
    SET description_translations = jsonb_set(COALESCE(s.description_translations, '{}'::jsonb), '{kn}', to_jsonb(COALESCE(s.description, '')), true)
    WHERE (s.description_translations ->> 'kn') IS NULL;
  $_upd$;
END IF;

-------------------------------------------------------------------------------
-- languages
-------------------------------------------------------------------------------
-- Map known ISO codes to Kannada; fallback to native_name or English name

SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_schema='public' AND table_name='languages' AND column_name='name_translations'
) INTO _has;
IF _has THEN
  EXECUTE $_upd$
    UPDATE languages l
    SET name_translations = jsonb_set(COALESCE(l.name_translations, '{}'::jsonb), '{kn}', to_jsonb(
      CASE lower(l.code)
        WHEN 'kn' THEN 'ಕನ್ನಡ'
        WHEN 'ta' THEN 'ತಮಿಳು'
        WHEN 'te' THEN 'ತೆಲುಗು'
        WHEN 'sa' THEN 'ಸಂಸ್ಕೃತ'
        WHEN 'hi' THEN 'ಹಿಂದಿ'
        WHEN 'en' THEN 'ಇಂಗ್ಲಿಷ್'
        WHEN 'tcy' THEN 'ತುಳು'
        WHEN 'kok' THEN 'ಕೊಂಕಣಿ'
        WHEN 'ml' THEN 'ಮಲಯಾಳಂ'
        WHEN 'mr' THEN 'ಮರಾಠಿ'
        ELSE COALESCE(l.native_name, l.name)
      END
    ), true)
    WHERE (l.name_translations ->> 'kn') IS NULL;
  $_upd$;
END IF;

-- Note: languages table may not have description_translations; skipping description seeding

-------------------------------------------------------------------------------
-- service_radius_options
-------------------------------------------------------------------------------
-- Translate display_text via value_km or common phrases; fallback to display_text

SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_schema='public' AND table_name='service_radius_options' AND column_name='name_translations'
) INTO _has;
IF _has THEN
  EXECUTE $_upd$
    UPDATE service_radius_options s
    SET name_translations = jsonb_set(COALESCE(s.name_translations, '{}'::jsonb), '{kn}', to_jsonb(
      CASE 
        WHEN s.value_km = 5 THEN '5 ಕಿ.ಮೀ ಒಳಗೆ'
        WHEN s.value_km = 10 THEN '10 ಕಿ.ಮೀ ಒಳಗೆ'
        WHEN s.value_km = 25 THEN '25 ಕಿ.ಮೀ ಒಳಗೆ'
        WHEN s.value_km = 50 THEN '50 ಕಿ.ಮೀ ಒಳಗೆ'
        WHEN s.value_km IS NULL AND s.display_text ILIKE '%city%' THEN 'ನಗರದೊಳಗೆ'
        WHEN s.value_km IS NULL AND (s.display_text ILIKE '%anywhere%' OR s.display_text ILIKE '%any%') THEN 'ಎಲ್ಲಿಯಾದರೂ ಪ್ರಯಾಣಿಸಲು ಸಿದ್ಧ'
        ELSE s.display_text
      END
    ), true)
    WHERE (s.name_translations ->> 'kn') IS NULL;
  $_upd$;
END IF;

SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_schema='public' AND table_name='service_radius_options' AND column_name='description_translations'
) INTO _has;
IF _has THEN
  EXECUTE $_upd$
    UPDATE service_radius_options s
    SET description_translations = jsonb_set(COALESCE(s.description_translations, '{}'::jsonb), '{kn}', to_jsonb(COALESCE(s.description, '')), true)
    WHERE (s.description_translations ->> 'kn') IS NULL;
  $_upd$;
END IF;

-------------------------------------------------------------------------------
-- experience_levels
-------------------------------------------------------------------------------
-- If named buckets exist, translate; otherwise copy English name

SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_schema='public' AND table_name='experience_levels' AND column_name='name_translations'
) INTO _has;
IF _has THEN
  EXECUTE $_upd$
    UPDATE experience_levels e
    SET name_translations = jsonb_set(COALESCE(e.name_translations, '{}'::jsonb), '{kn}', to_jsonb(
      CASE 
        WHEN e.name ILIKE 'expert' THEN 'ಪರಿಣತ'
        WHEN e.name ILIKE 'intermediate' THEN 'ಮಧ್ಯಂತರ'
        WHEN e.name ILIKE 'beginner' THEN 'ಆರಂಭಿಕ'
        ELSE e.name
      END
    ), true)
    WHERE (e.name_translations ->> 'kn') IS NULL;
  $_upd$;
END IF;

SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_schema='public' AND table_name='experience_levels' AND column_name='description_translations'
) INTO _has;
IF _has THEN
  EXECUTE $_upd$
    UPDATE experience_levels e
    SET description_translations = jsonb_set(COALESCE(e.description_translations, '{}'::jsonb), '{kn}', to_jsonb(COALESCE(e.description, '')), true)
    WHERE (e.description_translations ->> 'kn') IS NULL;
  $_upd$;
END IF;

-------------------------------------------------------------------------------
-- terms
-------------------------------------------------------------------------------
-- Until Kannada content is authored, seed kn with English so UI has a fallback per-locale without blank text

SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_schema='public' AND table_name='terms' AND column_name='content_translations'
) INTO _has;
IF _has THEN
  EXECUTE $_upd$
    UPDATE terms t
    SET content_translations = jsonb_set(COALESCE(t.content_translations, '{}'::jsonb), '{kn}', to_jsonb(COALESCE(t.content, '')), true)
    WHERE (t.content_translations ->> 'kn') IS NULL;
  $_upd$;
END IF;

SELECT EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_schema='public' AND table_name='terms' AND column_name='description_translations'
) INTO _has;
IF _has THEN
  EXECUTE $_upd$
    UPDATE terms t
    SET description_translations = jsonb_set(COALESCE(t.description_translations, '{}'::jsonb), '{kn}', to_jsonb(COALESCE(t.description, '')), true)
    WHERE (t.description_translations ->> 'kn') IS NULL;
  $_upd$;
END IF;

END $$;
