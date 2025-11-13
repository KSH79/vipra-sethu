"use client"
import { useTranslations } from 'next-intl'

export function OurValues() {
  const t = useTranslations('landing')
  const values = t.raw('values.list') as string[]
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t('values.title')}</h2>
        <ul className="max-w-2xl mx-auto list-disc list-inside text-gray-700 space-y-2">
          {values.map(v => (<li key={v}>{v}</li>))}
        </ul>
      </div>
    </section>
  )
}
