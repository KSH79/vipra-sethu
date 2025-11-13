"use client";

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useTranslations } from 'next-intl'

export default function CreatePostButton() {
  const t = useTranslations('community')
  const [canCreate, setCanCreate] = useState<boolean>(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          if (mounted) setCanCreate(false)
          return
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, is_admin, is_editor')
          .eq('id', user.id)
          .single()
        const role = (profile?.role || '').toLowerCase()
        let allowed = role === 'admin' || role === 'editor' || profile?.is_admin === true || profile?.is_editor === true
        if (!allowed && user.email) {
          const { data: adminRow, error: adminErr } = await supabase
            .from('admins')
            .select('user_email')
            .eq('user_email', user.email)
            .maybeSingle()
          if (!adminErr && adminRow) allowed = true
        }
        if (mounted) setCanCreate(!!allowed)
        // Debug: remove after verify
        console.log('[CreatePostButton] role=', role, 'is_admin=', profile?.is_admin, 'is_editor=', profile?.is_editor, 'allowed=', allowed)
      } catch {
        if (mounted) setCanCreate(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [supabase])

  if (!canCreate) return null

  return (
    <Link
      href="/community/create"
      className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold shadow-lg transition-all"
    >
      <span className="text-xl">+</span>
      {t('createPost')}
    </Link>
  )
}
