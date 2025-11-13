"use client";

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'signup' | 'signin'
  redirectTo?: string
  variant?: 'center' | 'panelRight'
}

export function AuthModal({ isOpen, onClose, mode, redirectTo = '/home', variant = 'center' }: AuthModalProps) {
  const t = useTranslations('auth.modal')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentMode, setCurrentMode] = useState<AuthModalProps['mode']>(mode)
  const router = useRouter()

  const isSignup = currentMode === 'signup'

  // Keep internal mode and form state in sync with props and panel visibility
  useEffect(() => {
    if (!isOpen) return
    setCurrentMode(mode)
    setEmail('')
    setError(null)
    setSuccess(false)
  }, [mode, isOpen])

  // Clear transient states when switching modes within the modal (via footer CTA)
  useEffect(() => {
    setError(null)
    setSuccess(false)
  }, [currentMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const origin = window.location.origin
      const localeCookie = document.cookie.match(/(?:^|; )locale=([^;]+)/)
      const locale = localeCookie ? decodeURIComponent(localeCookie[1]) : 'en'

      // If signup, first check if the email already exists to avoid sending email unnecessarily
      if (isSignup) {
        try {
          const resp = await fetch('/api/auth/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          })
          if (!resp.ok) {
            setError(t('signupCheckFailed'))
            return
          }
          const data = await resp.json()
          if (data.exists) {
            setError(t('accountExists'))
            return
          }
          // Only proceed to send email when we confirmed it does NOT exist
        } catch {
          setError(t('signupCheckFailed'))
          return
        }
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${redirectTo}`,
          shouldCreateUser: isSignup ? true : false,
          data: { locale }
        }
      })
      if (error) {
        // Non-enumerating: still show success state
        setSuccess(true)
        return
      }

      setSuccess(true)
    } catch (err: any) {
      // For unexpected failures (network, SDK), show generic error
      setError(t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const isPanel = variant === 'panelRight'

  return (
    <div className={isPanel ? 'fixed inset-0 z-50 pointer-events-none' : 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'}>
      <div className={
        isPanel
          ? 'pointer-events-auto fixed right-4 top-20 w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl border'
          : 'relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl'
      }>
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" aria-label={t('close')}>
          ✕
        </button>

        {success ? (
          <div className="text-center">
            <div className="mb-4 text-5xl">📧</div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">{t('successTitle')}</h2>
            <p className="mb-4 text-gray-600" data-testid="email-sent">
              {t('successDesc')}
            </p>
            <p className="text-sm text-gray-500">{t('successNoteGeneric')}</p>
            <button onClick={onClose} className="mt-6 w-full rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700">
              {t('gotIt')}
            </button>
          </div>
        ) : (
          <div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              {isSignup ? t('createAccount') : t('welcomeBack')}
            </h2>
            <p className="mb-6 text-sm text-gray-600">
              {isSignup ? t('signupHint') : t('signinHint')}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                  {t('emailLabel')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('emailPlaceholder')}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700 disabled:bg-gray-300">
                {loading ? t('sending') : t('send')}
              </button>
            </form>

            <div className="mt-6 border-t pt-4 text-center text-sm">
              {isSignup ? (
                <p className="text-gray-600">
                  {t('haveAccount')}{' '}
                  <button onClick={() => setCurrentMode('signin')} className="font-semibold text-orange-600 hover:text-orange-700">
                    {t('signIn')}
                  </button>
                </p>
              ) : (
                <p className="text-gray-600">
                  {t('newHere')}{' '}
                  <button onClick={() => setCurrentMode('signup')} className="font-semibold text-orange-600 hover:text-orange-700">
                    {t('createAccountCta')}
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
