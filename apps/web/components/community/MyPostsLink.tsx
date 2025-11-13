"use client";

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useTranslations } from 'next-intl'

export default function MyPostsLink() {
  const t = useTranslations('community')
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted) setLoggedIn(!!user)
    }).catch(() => {
      if (mounted) setLoggedIn(false)
    })
    return () => { mounted = false }
  }, [supabase])

  if (!loggedIn) return null

  return (
    <Link
      href="/community/my-posts"
      className="flex items-center gap-2 px-5 py-3 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 font-semibold transition-all"
    >
      {t('myPosts')}
    </Link>
  )
}
