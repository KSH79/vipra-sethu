export const locales = ['en', 'kn'] as const;
export type Locale = typeof locales[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  kn: 'ಕನ್ನಡ',
};
