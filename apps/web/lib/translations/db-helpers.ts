/**
 * Translation helper functions for database queries
 */

export type SupportedLanguage = 'en' | 'kn' | 'hi' | 'ta' | 'te' | 'ml' | 'mr' | 'gu' | 'bn' | 'pa';

export interface TranslationRecord {
  en: string;
  kn?: string;
  hi?: string;
  ta?: string;
  te?: string;
  ml?: string;
  mr?: string;
  gu?: string;
  bn?: string;
  pa?: string;
}

/**
 * Get translated text from JSONB field with fallback to English
 * @param translations - JSONB translations object from database
 * @param locale - Desired language code
 * @param fallbackLocale - Fallback language (default: 'en')
 * @returns Translated string or fallback
 */
export function getTranslation(
  translations: Record<string, string> | null | undefined,
  locale: SupportedLanguage,
  fallbackLocale: SupportedLanguage = 'en'
): string {
  if (!translations) return '';

  const from = (code: string) => {
    const val = translations[code];
    return typeof val === 'string' ? val : '';
  };

  const desired = from(locale);
  if (desired && desired.trim() !== '') return desired;

  const fallback = from(fallbackLocale);
  if (fallback && fallback.trim() !== '') return fallback;

  const firstAvailable = Object.values(translations).find((t) => t && t.trim() !== '');
  return firstAvailable || '';
}

/**
 * Build a translation object for database insert/update
 * @param englishText - English text (required)
 * @param translations - Optional translations in other languages
 * @returns JSONB-compatible translation object
 */
export function buildTranslation(
  englishText: string,
  translations?: Partial<Record<SupportedLanguage, string>>
): TranslationRecord {
  return {
    en: englishText,
    kn: translations?.kn || '',
    hi: translations?.hi || '',
    ta: translations?.ta || '',
    te: translations?.te || '',
    ml: translations?.ml || '',
    mr: translations?.mr || '',
    gu: translations?.gu || '',
    bn: translations?.bn || '',
    pa: translations?.pa || '',
  };
}

/**
 * Update a specific translation in existing JSONB
 */
export function updateTranslation(
  existing: TranslationRecord,
  locale: SupportedLanguage,
  text: string
): TranslationRecord {
  return {
    ...existing,
    [locale]: text,
  } as TranslationRecord;
}

/**
 * Check if a translation exists for a given locale
 */
export function hasTranslation(
  translations: Record<string, string> | null | undefined,
  locale: SupportedLanguage
): boolean {
  const val = translations?.[locale];
  return !!(val && val.trim() !== '');
}

/**
 * Get translation coverage percentage for a given locale
 */
export function getTranslationCoverage(
  items: any[],
  locale: SupportedLanguage,
  translationFields: string[]
): number {
  if (items.length === 0) return 0;

  let totalFields = 0;
  let translatedFields = 0;

  for (const item of items) {
    for (const field of translationFields) {
      totalFields++;
      if (hasTranslation(item?.[field], locale)) translatedFields++;
    }
  }

  return Math.round((translatedFields / totalFields) * 100);
}
