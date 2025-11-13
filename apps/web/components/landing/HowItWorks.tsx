"use client"
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'

export function HowItWorks() {
  const t = useTranslations('landing')
  const locale = useLocale()
  // Debug i18n: remove after verification
  console.log('[i18n] HowItWorks locale=', locale, {
    title: t('how.title'),
    stepBrowse: t('how.steps.browse')
  })
  const steps = [
    { title: t('how.steps.browse'), icon: '🔍' },
    { title: t('how.steps.connect'), icon: '📱' },
    { title: t('how.steps.book'), icon: '📅' },
  ]
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t('how.title')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, idx) => (
            <div key={idx} className="rounded-xl border bg-white p-6 text-center shadow-sm">
              <div className="text-3xl mb-2" aria-hidden>{s.icon}</div>
              <p className="text-sm text-gray-700">{s.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
