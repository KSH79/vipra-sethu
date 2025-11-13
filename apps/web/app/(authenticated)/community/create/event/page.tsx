"use client";

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import PostForm from '@/components/community/PostForm'

export default function CreateEventPage() {
  const t = useTranslations('community')
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [saving, setSaving] = useState(false)
  const [allowed, setAllowed] = useState(false)

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
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('posts').insert({
        type: 'event',
        title: data.title,
        body: data.body,
        tags: data.tags?.split(',').map((t: string) => t.trim()).filter(Boolean) || [],
        languages: data.languages || ['en'],
        location: data.location,
        starts_at: data.startDate,
        ends_at: data.endDate || null,
        meta: {
          venue: data.venue,
          organizer_name: data.organizerName,
          organizer_phone: data.organizerPhone,
          rsvp_method: data.rsvpMethod || 'call',
          ritual_context: data.ritualContext
        },
        created_by: user.id,
        status
      })

      if (error) throw error

      const message = status === 'draft' ? t('messages.draftSaved') : t('messages.submittedForReview')
      alert(message)
      router.push('/community/my-posts')
    } catch (e) {
      console.error('Error saving post:', e)
      alert('Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { name: 'title', label: t('form.title'), type: 'text', required: true },
    { name: 'body', label: t('form.body'), type: 'textarea', required: true },
    { name: 'venue', label: t('form.event.venue'), type: 'text', required: true },
    { name: 'startDate', label: t('form.event.startDate'), type: 'datetime-local', required: true },
    { name: 'endDate', label: t('form.event.endDate'), type: 'datetime-local' },
    { name: 'organizerName', label: t('form.event.organizerName'), type: 'text' },
    { name: 'organizerPhone', label: t('form.event.organizerPhone'), type: 'tel' },
    { name: 'ritualContext', label: t('form.event.ritualContext'), type: 'text' },
    { name: 'location', label: t('form.location'), type: 'text' },
    { name: 'tags', label: t('form.tags'), type: 'text' }
  ] as const

  if (!allowed) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('createPost')} - {t('postTypes.event')}</h1>
        <PostForm fields={fields as any} onSubmit={handleSubmit} saving={saving} />
      </div>
    </div>
  )
}
