import { getRequestConfig } from 'next-intl/server';
import { defaultLocale } from '@/lib/i18n/config';

export default getRequestConfig(async ({ locale }) => {
  const loc = (typeof locale === 'string' && locale) ? locale : defaultLocale;
  return {
    locale: loc,
    messages: (await import(`@/messages/${loc}.json`)).default,
  };
});
