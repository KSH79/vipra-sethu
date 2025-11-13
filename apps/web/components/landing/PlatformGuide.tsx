import { useTranslations } from 'next-intl'

export function PlatformGuide() {
  const t = useTranslations('landing')
  return (
    <section className="py-8">
      <div className="container mx-auto px-4 max-w-3xl" aria-labelledby="platform-guide">
        <h2 id="platform-guide" className="sr-only">Platform Pronunciation Guide</h2>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="text-center space-y-2">
            <div className="text-lg">विप्र सेतु · ವಿಪ್ರ ಸೇತು</div>
            <div className="text-sm text-gray-600">{t('pronounced', { value: 'VIP-ruh SAY-thu' })}</div>
            <div className="text-sm text-gray-700">
              {t('meaning')}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
