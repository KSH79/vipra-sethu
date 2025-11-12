-- Landing config localized texts (idempotent)
-- Purpose: Ensure landing_config has localized EN/KN taglines and CTA texts.
-- Safe to re-run. Keeps existing values and merges translations.

-- Ensure one row exists
insert into public.landing_config (
  background_image_url,
  primary_tagline,
  secondary_tagline,
  cta_primary_text,
  cta_secondary_text
) values (
  coalesce((select background_image_url from public.landing_config limit 1), '/images/landing/temple-hero.webp'),
  'Connect with trusted purohits and cooks in your community',
  'Preserving our traditions, one connection at a time',
  'Find Providers',
  'Sign Up'
)
where not exists (select 1 from public.landing_config);

-- Merge translations and set base texts
update public.landing_config
set primary_tagline = 'Connect with trusted purohits and cooks in your community',
    primary_tagline_translations = coalesce(primary_tagline_translations, '{}'::jsonb)
      || '{"kn":"ನಿಮ್ಮ ಸಮುದಾಯದಲ್ಲಿ ವಿಶ್ವಾಸಾರ್ಹ ಪುರೋಹಿತರು ಮತ್ತು ಅಡುಗೆಯವರನ್ನು ಸಂಪರ್ಕಿಸಿ"}'::jsonb,
    secondary_tagline = 'Preserving our traditions, one connection at a time',
    secondary_tagline_translations = coalesce(secondary_tagline_translations, '{}'::jsonb)
      || '{"kn":"ನಮ್ಮ ಸಂಪ್ರದಾಯಗಳನ್ನು ಕಾಪಾಡುವುದು, ಒಂದೊಂದು ಸಂಪರ್ಕದಲ್ಲಿ"}'::jsonb,
    cta_primary_text = coalesce(cta_primary_text, 'Find Providers'),
    cta_primary_translations = coalesce(cta_primary_translations, '{}'::jsonb)
      || '{"kn":"ಪೂಜಾರಿಗಳನ್ನು ಹುಡುಕಿ"}'::jsonb,
    cta_secondary_text = coalesce(cta_secondary_text, 'Sign Up'),
    cta_secondary_translations = coalesce(cta_secondary_translations, '{}'::jsonb)
      || '{"kn":"ಸೈನ್ ಅಪ್ ಮಾಡಿ"}'::jsonb,
    updated_at = now();
