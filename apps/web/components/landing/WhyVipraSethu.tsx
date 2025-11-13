"use client"
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'

export function WhyVipraSethu() {
  const t = useTranslations('home')
  const locale = useLocale()
  // Debug i18n: remove after verification
  console.log('[i18n] WhyVipraSethu locale=', locale, {
    whyTitle: t('why.title'),
    pillarVerified: t('pillars.verified.title'),
  })
  const items = [
    { title: t('pillars.verified.title'), desc: t('pillars.verified.desc'), icon: '🔒' },
    { title: t('pillars.community.title'), desc: t('pillars.community.desc'), icon: '🕉️' },
    { title: t('pillars.quality.title'), desc: t('pillars.quality.desc'), icon: '⭐' },
  ]
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-6">{t('why.title')}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((i) => (
            <div key={i.title} className="rounded-xl border bg-white p-4 text-center shadow-sm">
              <div className="text-2xl mb-1" aria-hidden>{i.icon}</div>
              <h3 className="text-base font-semibold">{i.title}</h3>
              <p className="text-sm text-gray-600">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
