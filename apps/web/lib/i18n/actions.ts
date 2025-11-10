'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabaseServer';
import { locales, type Locale } from './config';

export async function setUserLocale(locale: Locale) {
  if (!locales.includes(locale)) throw new Error('Invalid locale');

  // Set cookie (1 year)
  const jar = await cookies();
  jar.set('locale', locale, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });

  // Attempt to persist on profile if signed in
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ preferred_language: locale }).eq('id', user.id);
    }
  } catch (e) {
    console.warn('setUserLocale: profile update skipped', e);
  }
}
