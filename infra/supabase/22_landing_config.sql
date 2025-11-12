-- Create landing_config table
create table if not exists public.landing_config (
  id uuid primary key default gen_random_uuid(),
  background_image_url text not null,
  primary_tagline text not null,
  primary_tagline_translations jsonb,
  secondary_tagline text not null,
  secondary_tagline_translations jsonb,
  cta_primary_text text default 'Find Providers',
  cta_primary_translations jsonb,
  cta_secondary_text text default 'Sign Up',
  cta_secondary_translations jsonb,
  updated_at timestamptz default now()
);

-- Seed a default row if table is empty
insert into public.landing_config (
  background_image_url,
  primary_tagline,
  primary_tagline_translations,
  secondary_tagline,
  secondary_tagline_translations,
  cta_primary_translations,
  cta_secondary_translations
)
select
  '/images/temple-hero.jpg',
  'Connect with trusted purohits and cooks in your community',
  '{"kn": "ನಿಮ್ಮ ಸಮುದಾಯದಲ್ಲಿ ವಿಶ್ವಾಸಾರ್ಹ ಪುರೋಹಿತರು ಮತ್ತು ಅಡುಗೆಯವರನ್ನು ಸಂಪರ್ಕಿಸಿ"}',
  'Preserving our traditions, one connection at a time',
  '{"kn": "ನಮ್ಮ ಸಂಪ್ರದಾಯಗಳನ್ನು ಕಾಪಾಡುವುದು,ೊಂದೊಂದು ಸಂಪರ್ಕದಲ್ಲಿ"}',
  '{"kn": "ಪೂಜಾರಿಗಳನ್ನು ಹುಡುಕಿ"}',
  '{"kn": "ಸೈನ್ ಅಪ್ ಮಾಡಿ"}'
where not exists (select 1 from public.landing_config);
