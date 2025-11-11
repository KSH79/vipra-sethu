'use server';

import { cookies } from 'next/headers';
import { locales, type Locale } from './config';

export async function setUserLocale(locale: Locale) {
  if (!locales.includes(locale)) throw new Error('Invalid locale');

  // Session-only cookie (no persistence beyond current browser session)
  const jar = await cookies();
  jar.set('locale', locale, {
    path: '/',
    sameSite: 'lax',
    // no maxAge => session cookie
    secure: process.env.NODE_ENV === 'production',
  });
}
