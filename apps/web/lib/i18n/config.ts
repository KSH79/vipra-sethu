import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabaseServer';

export const locales = ['en', 'kn'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  kn: 'ಕನ್ನಡ',
};

export async function getUserLocale(): Promise<Locale> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', user.id)
        .single();
      if (profile?.preferred_language && locales.includes(profile.preferred_language as Locale)) {
        return profile.preferred_language as Locale;
      }
    }
  } catch {
    // ignore
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) return cookieLocale as Locale;

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await getUserLocale();
  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
