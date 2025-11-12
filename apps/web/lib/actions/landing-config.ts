'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function getLandingConfig() {
  const supabase = createClient();
  const locale = (await cookies()).get('locale')?.value || 'en';

  const { data, error } = await supabase
    .from('landing_config')
    .select('*')
    .single();

  if (error || !data) {
    return {
      background_image_url: '/images/temple-hero.jpg',
      primary_tagline: 'Connect with trusted purohits and cooks in your community',
      secondary_tagline: 'Preserving our traditions, one connection at a time',
      cta_primary_text: 'Find Providers',
      cta_secondary_text: 'Sign Up'
    };
  }

  const primaryTagline = locale === 'en'
    ? data.primary_tagline
    : data.primary_tagline_translations?.[locale] || data.primary_tagline;

  const secondaryTagline = locale === 'en'
    ? data.secondary_tagline
    : data.secondary_tagline_translations?.[locale] || data.secondary_tagline;

  const ctaPrimary = locale === 'en'
    ? (data.cta_primary_text || 'Find Providers')
    : data.cta_primary_translations?.[locale] || (data.cta_primary_text || 'Find Providers');

  const ctaSecondary = locale === 'en'
    ? (data.cta_secondary_text || 'Sign Up')
    : data.cta_secondary_translations?.[locale] || (data.cta_secondary_text || 'Sign Up');

  return {
    background_image_url: data.background_image_url,
    primary_tagline: primaryTagline,
    secondary_tagline: secondaryTagline,
    cta_primary_text: ctaPrimary,
    cta_secondary_text: ctaSecondary
  };
}
