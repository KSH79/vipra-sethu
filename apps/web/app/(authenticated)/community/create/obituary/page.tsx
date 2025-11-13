"use client";

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import PostForm from '@/components/community/PostForm'

export default function CreateObituaryPage() {
  const t = useTranslations('community')
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [saving, setSaving] = useState(false)
  const [consentGiven, setConsentGiven] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [consentModal, setConsentModal] = useState(false)

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

  async function handleSubmit(data: any, status: 'draft' | 'pending') {
    if (!consentGiven && status === 'pending') {
      setConsentModal(true)
      return { ok: false, status }
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('posts').insert({
        type: 'obituary',
        title: data.title,
        body: data.body,
        tags: data.tags?.split(',').map((t: string) => t.trim()).filter(Boolean) || [],
        languages: data.languages || ['en'],
        location: data.location,
        starts_at: data.dateOfPassing || null,
        meta: {
          full_name: data.fullName,
          gotra: data.gotra || null,
          age: data.age ? parseInt(data.age) : null,
          date_of_passing: data.dateOfPassing || null,
          rites_schedule: data.ritesSchedule,
          family_contacts: data.familyContact ? [{ name: data.familyContact, masked: true }] : [],
          consent_given: consentGiven
        },
        created_by: user.id,
        status
      })

      if (error) throw error

      return { ok: true, status }
    } catch (e) {
      console.error('Error saving post:', e)
      return { ok: false, status }
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { name: 'fullName', label: t('form.obituary.fullName'), type: 'text', required: true },
    { name: 'title', label: t('form.title'), type: 'text', required: true, placeholder: 'Remembering…' },
    { name: 'body', label: t('form.body'), type: 'textarea', required: true },
    { name: 'gotra', label: t('form.obituary.gotra'), type: 'text' },
    { name: 'age', label: t('form.obituary.age'), type: 'number' },
    { name: 'dateOfPassing', label: t('form.obituary.dateOfPassing'), type: 'date', required: true },
    { name: 'ritesSchedule', label: t('form.obituary.ritesSchedule'), type: 'textarea', required: true },
    { name: 'familyContact', label: t('form.obituary.familyContact'), type: 'text' },
    { name: 'location', label: t('form.location'), type: 'text' },
    { name: 'tags', label: t('form.tags'), type: 'text' }
  ] as const

  if (!allowed) return null

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">⚠️ Obituary posts are sensitive and require family consent. They will be reviewed by admins before publication.</p>
        </div>

        <h1 className="text-3xl font-bold mb-6">{t('createPost')} - {t('postTypes.obituary')}</h1>

        <PostForm
          fields={fields as any}
          onSubmit={handleSubmit}
          saving={saving}
          extraContent={
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={consentGiven} onChange={(e) => setConsentGiven(e.target.checked)} className="mt-1" />
                <span className="text-sm text-gray-700">{t('form.obituary.consentCheckbox')}</span>
              </label>
            </div>
          }
        />
      </div>
    </div>
    {consentModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
          <p className="text-slate-800 mb-6">{t('form.obituary.consentRequired')}</p>
          <button onClick={() => setConsentModal(false)} className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">OK</button>
        </div>
      </div>
    )}
    </>
  )
}
