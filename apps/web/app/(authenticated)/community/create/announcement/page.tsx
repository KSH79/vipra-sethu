"use client";

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import PostForm from '@/components/community/PostForm'

export default function CreateAnnouncementPage() {
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
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const ok = profile?.role === 'admin' || profile?.role === 'editor'
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
        type: 'announcement',
        title: data.title,
        body: data.body,
        tags: data.tags?.split(',').map((t: string) => t.trim()).filter(Boolean) || [],
        languages: data.languages || ['en'],
        location: data.location,
        meta: {
          announcement_type: data.announcementType || 'general',
          contact: data.contact || null
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
    { 
      name: 'announcementType', 
      label: t('form.announcement.announcementType'), 
      type: 'select',
      options: [
        { value: 'birth', label: 'Birth' },
        { value: 'birthday', label: 'Birthday' },
        { value: 'engagement', label: 'Engagement' },
        { value: 'wedding', label: 'Wedding' },
        { value: 'aradhane', label: 'Aradhane' },
        { value: 'general', label: 'General' }
      ]
    },
    { name: 'contact', label: t('form.announcement.contact'), type: 'text' },
    { name: 'location', label: t('form.location'), type: 'text' },
    { name: 'tags', label: t('form.tags'), type: 'text' }
  ] as const

  if (!allowed) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('createPost')} - {t('postTypes.announcement')}</h1>
        <PostForm fields={fields as any} onSubmit={handleSubmit} saving={saving} />
      </div>
    </div>
  )
}
