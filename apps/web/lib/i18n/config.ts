import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'kn'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  kn: 'ಕನ್ನಡ',
};

export async function getUserLocale(): Promise<Locale> {
  // Phase 2 requirement: always default to English; no auto detection from profile or cookies
  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale: Locale = await getUserLocale();
  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
