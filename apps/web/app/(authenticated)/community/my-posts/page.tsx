"use client";

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

interface Post {
  id: string
  title: string
  body: string
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected'
  created_at: string
  rejection_reason?: string | null
}

export default function MyPostsPage() {
  const t = useTranslations('community')
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<'all'|'draft'|'pending'|'approved'|'published'|'rejected'>('all')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      setIsAdmin((profile?.role || '').toLowerCase() === 'admin')

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setPosts(data as any || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('messages.confirmDelete'))) return
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id)
      if (error) throw error
      setPosts((prev) => prev.filter((p) => p.id !== id))
      alert(t('messages.deleted'))
    } catch (e) {
      console.error(e)
      alert(t('messages.noPermission'))
    }
  }

  function canEdit(post: Post) {
    return isAdmin || ['draft', 'rejected'].includes(post.status)
  }

  const STATUS_COLORS: Record<Post['status'], string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    published: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
  }

  if (loading) return <div className="p-8">Loading…</div>

  const filtered = activeTab==='all' ? posts : posts.filter(p=>p.status===activeTab)

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('myPosts')}</h1>
          <Link href="/community/create" className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700">+ {t('createPost')}</Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">You haven't created any posts yet</p>
            <Link href="/community/create" className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Create Your First Post</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{post.title}</h3>
                    <p className="text-sm text-gray-600">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[post.status]}`}>{t(`status.${post.status}`)}</span>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-2">{post.body}</p>

                {post.status === 'rejected' && post.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                    <p className="text-sm text-red-800"><strong>Rejection reason:</strong> {post.rejection_reason}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Link href={`/community/${post.id}`} className="text-orange-600 hover:text-orange-700 font-medium">View</Link>
                  {canEdit(post) && (
                    <Link href={`/community/edit/${post.id}`} className="text-blue-600 hover:text-blue-700 font-medium">{t('edit')}</Link>
                  )}
                  {canEdit(post) && (
                    <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-700 font-medium">{t('delete')}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
