"use client";

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const POST_TYPES = ['event', 'announcement', 'obituary'] as const

type PostType = typeof POST_TYPES[number]

const TYPE_INFO: Record<PostType, { icon: string; desc: string }> = {
  event: { icon: '📅', desc: 'Share upcoming pujas, temple events, or community gatherings' },
  announcement: { icon: '📢', desc: 'Share community announcements and celebrations' },
  obituary: { icon: '🕊️', desc: 'Share condolences and rites information (requires family consent)' }
}

export default function CreatePostPage() {
  const t = useTranslations('community')
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [selectedType, setSelectedType] = useState<PostType | null>(null)
  const [allowed, setAllowed] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/community'); return }
      const { data: profile } = await supabase.from('profiles').select('role, is_admin, is_editor').eq('id', user.id).single()
      const role = (profile?.role || '').toLowerCase()
      let ok = role === 'admin' || role === 'editor' || profile?.is_admin === true || profile?.is_editor === true
      if (!ok && user.email) {
        const { data: adminRow, error: adminErr } = await supabase.from('admins').select('user_email').eq('user_email', user.email).maybeSingle()
        if (!adminErr && adminRow) ok = true
      }
      if (!ok) { alert(t('messages.noPermission')); router.push('/community'); return }
      if (mounted) setAllowed(true)
    }
    checkRole()
    return () => { mounted = false }
  }, [router, supabase, t])

  function handleContinue() {
    if (selectedType) router.push(`/community/create/${selectedType}`)
  }

  if (!allowed) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('createPost')}</h1>
        <p className="text-gray-600 mb-8">{t('selectType')}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {POST_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`p-6 rounded-lg border-2 text-left transition-all ${selectedType === type ? 'border-orange-600 bg-orange-50 shadow-lg' : 'border-gray-200 bg-white hover:border-orange-300'}`}
            >
              <div className="text-4xl mb-3">{TYPE_INFO[type].icon}</div>
              <h3 className="text-xl font-bold mb-2 capitalize">{t(`postTypes.${type}`)}</h3>
              <p className="text-sm text-gray-600">{TYPE_INFO[type].desc}</p>
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-8">
          <button onClick={() => router.back()} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            {t('cancel')}
          </button>
          <button onClick={handleContinue} disabled={!selectedType} className={`px-8 py-3 rounded-lg font-semibold ${selectedType ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
            {t('next')} →
          </button>
        </div>
      </div>
    </div>
  )
}
