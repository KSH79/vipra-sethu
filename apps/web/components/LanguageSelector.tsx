'use client';

import { useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { locales, localeNames, type Locale } from '@/lib/i18n/constants';
import { setUserLocale } from '@/lib/i18n/actions';

export function LanguageSelector() {
  const currentLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  function handleLocaleChange(locale: Locale) {
    startTransition(async () => {
      await setUserLocale(locale);
      setIsOpen(false);
      window.location.reload();
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
        disabled={isPending}
      >
        <span className="text-sm font-medium">{localeNames[currentLocale]}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${currentLocale === locale ? 'bg-gray-50 font-medium' : ''}`}
                disabled={isPending}
              >
                {localeNames[locale]}
                {currentLocale === locale && <span className="ml-2 text-green-600">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
