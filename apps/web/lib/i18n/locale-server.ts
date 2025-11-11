import { NextRequest } from 'next/server'
import { locales, defaultLocale, type Locale } from '@/lib/i18n/config'

export function sanitizeLocale(value: string | null | undefined): Locale {
  const v = (value || '').toLowerCase()
  if ((locales as readonly string[]).includes(v)) return v as Locale
  return defaultLocale
}

export function getLocaleFromRequest(req: NextRequest): Locale {
  // Priority: explicit query param -> cookie -> default
  const urlLocale = req.nextUrl.searchParams.get('locale')
  if (urlLocale) return sanitizeLocale(urlLocale)

  const cookieLocale = req.cookies.get('locale')?.value
  if (cookieLocale) return sanitizeLocale(cookieLocale)

  return defaultLocale
}
