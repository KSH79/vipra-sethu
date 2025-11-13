'use client';

import { DailyShloka as ShlokaType } from '@/lib/types/daily-shloka';
import { useLocale, useTranslations } from 'next-intl';

interface DailyShlokaProps {
  shloka: ShlokaType;
}

export function DailyShloka({ shloka }: DailyShlokaProps) {
  const locale = useLocale();
  const t = useTranslations('landing');
  const translation = (shloka.translations as any)?.[locale] || shloka.translations.en;

  const handleShare = () => {
    const text = `${shloka.sanskrit}\n\n${translation}\n\n— ${shloka.source}\n\nFrom Vipra Sethu`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className="bg-gradient-to-r from-orange-50 to-amber-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center space-y-3 animate-fade-in">
          <h2 className="text-xl md:text-2xl font-semibold text-orange-800 flex items-center justify-center gap-2">
            <span>💫</span>
            <span>{t('dailyInspirationTitle')}</span>
          </h2>

          <p className="text-xl md:text-2xl font-semibold text-gray-800" lang="sa">
            {shloka.sanskrit}
          </p>

          {shloka.sanskrit_transliteration && (
            <p className="text-sm text-gray-500 italic">
              {shloka.sanskrit_transliteration}
            </p>
          )}

          <p className="text-lg md:text-xl text-gray-700" lang={locale}>
            "{translation}"
          </p>

          <p className="text-sm text-gray-600 italic">— {shloka.source}</p>

          <button
            onClick={handleShare}
            aria-label="Share this wisdom"
            className="mt-4 text-orange-600 hover:text-orange-700 underline text-sm"
          >
            {t('share')}
          </button>
        </div>
      </div>
    </section>
  );
}
