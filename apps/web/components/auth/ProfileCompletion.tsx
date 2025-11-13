"use client";

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/lib/actions/profile'
import { useTranslations } from 'next-intl'

interface ProfileCompletionProps {
  userId: string
  existingProfile?: {
    first_name?: string
    last_name?: string
    city?: string
    phone?: string
  }
}

export function ProfileCompletion({ userId, existingProfile }: ProfileCompletionProps) {
  const t = useTranslations('auth.profile')
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: existingProfile?.first_name || '',
    lastName: existingProfile?.last_name || '',
    city: existingProfile?.city || '',
    phone: existingProfile?.phone || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.lastName) {
      alert(`${t('firstName')} / ${t('lastName')} ${t('required')}`)
      return
    }
    setLoading(true)
    try {
      await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        city: formData.city || null,
        phone: formData.phone || null,
        onboarding_completed: true
      })
      // Force a full reload to ensure fresh tree and middleware pass
      window.location.assign('/home')
    } catch (err) {
      console.error('Profile update failed:', err)
      alert('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    await updateProfile({ onboarding_completed: true })
    window.location.assign('/home')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{t('welcome')}</h1>
          <p className="text-gray-600">{t('letsComplete')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
              {t('firstName')} <span className="text-red-500">*</span>
            </label>
            <input id="firstName" type="text" value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required placeholder={t('placeholders.firstName')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
          </div>

          <div>
            <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
              {t('lastName')} <span className="text-red-500">*</span>
            </label>
            <input id="lastName" type="text" value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required placeholder={t('placeholders.lastName')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
          </div>

          <div>
            <label htmlFor="city" className="mb-1 block text-sm font-medium text-gray-700">
              {t('city')} <span className="text-gray-400 text-xs">({t('optional')})</span>
            </label>
            <input id="city" type="text" value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder={t('placeholders.city')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
              {t('phone')} <span className="text-gray-400 text-xs">({t('optional')})</span>
            </label>
            <input id="phone" type="tel" value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder={t('placeholders.phone')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
          </div>

          <div className="mt-6 space-y-3">
            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700 disabled:bg-gray-300">
              {loading ? 'Saving...' : t('completeProfile')}
            </button>
            <button type="button" onClick={handleSkip}
              className="w-full text-sm text-gray-600 hover:text-gray-800">
              {t('doLater')}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">{t('note')}</p>
      </div>
    </div>
  )
}
