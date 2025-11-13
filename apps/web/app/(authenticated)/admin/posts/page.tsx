"use client";

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createBrowserClient } from '@supabase/ssr'

interface Post {
  id: string
  title: string
  body: string
  type: 'event' | 'announcement' | 'obituary' | string
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected'
  created_at: string
  created_by: string
  rejection_reason?: string | null
}

export default function AdminPostsPage() {
  const t = useTranslations('community')
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [resultModal, setResultModal] = useState<{open:boolean; message:string}|null>(null)
  const [rejectModal, setRejectModal] = useState<{open:boolean; postId:string|null; reason:string}>({open:false, postId:null, reason:''})
  const [activeTab, setActiveTab] = useState<'pending'|'approved'|'published'|'rejected'>('pending')

  useEffect(() => {
    load()
  }, [activeTab])

  async function load() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', activeTab)
        .order('created_at', { ascending: false })
      if (error) throw error
      setPosts((data as any) || [])
    } catch (e) {
      console.error('Load pending posts failed', e)
    } finally {
      setLoading(false)
    }
  }

  async function approvePost(id: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('posts')
        .update({ status: 'approved', approved_by: user.id, approved_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      setResultModal({ open: true, message: t('messages.approved') })
      await load()
    } catch (e) {
      console.error('Approve failed', e)
      setResultModal({ open: true, message: t('messages.noPermission') })
    }
  }

  async function publishPost(id: string) {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ status: 'published' })
        .eq('id', id)
      if (error) throw error
      setResultModal({ open: true, message: t('messages.published') })
      await load()
    } catch (e) {
      console.error('Publish failed', e)
      setResultModal({ open: true, message: t('messages.noPermission') })
    }
  }

  async function rejectPost(id: string, reason: string) {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ status: 'rejected', rejection_reason: reason || 'Not suitable' })
        .eq('id', id)
      if (error) throw error
      setResultModal({ open: true, message: t('messages.rejected') })
      await load()
    } catch (e) {
      console.error('Reject failed', e)
      setResultModal({ open: true, message: t('messages.noPermission') })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Admin • {t(`status.${activeTab}`)}</h1>
          <div className="flex gap-2 bg-white border border-gray-200 rounded-xl p-1">
            {(['pending','approved','published','rejected'] as const).map(tab => (
              <button
                key={tab}
                onClick={()=>setActiveTab(tab)}
                className={`px-3 py-1.5 text-sm rounded-lg ${activeTab===tab ? 'bg-orange-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {t(`status.${tab}`)}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div>{t('loading') || 'Loading…'}</div>
        ) : posts.length === 0 ? (
          <div className="text-gray-600">{t('empty.noPendingPosts', { ns: 'community' } as any) || 'No pending posts'}</div>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => (
              <div key={p.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase text-gray-500 mb-1">{(() => { try { return t(`chips.${p.type}`) } catch { return p.type } })()}</div>
                    <h3 className="text-xl font-semibold">{p.title}</h3>
                    <p className="text-gray-600 mt-2 line-clamp-3">{p.body}</p>
                  </div>
                  <div className="flex gap-3">
                    {activeTab === 'pending' && (
                      <>
                        <button onClick={() => approvePost(p.id)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">{t('approve')}</button>
                        <button onClick={() => setRejectModal({ open: true, postId: p.id, reason: '' })} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">{t('reject')}</button>
                      </>
                    )}
                    {activeTab === 'approved' && (
                      <>
                        <button onClick={() => publishPost(p.id)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{t('publish')}</button>
                        <button onClick={() => setRejectModal({ open: true, postId: p.id, reason: '' })} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">{t('reject')}</button>
                      </>
                    )}
                    {activeTab === 'published' && (
                      <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">{t('status.published')}</span>
                    )}
                    {activeTab === 'rejected' && (
                      <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">{t('status.rejected')}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminPostsModals
        modal={resultModal}
        onClose={() => setResultModal(null)}
        reject={{
          open: rejectModal.open,
          reason: rejectModal.reason,
          setReason: (v:string) => setRejectModal(m => ({ ...m, reason: v } as any)),
          onCancel: () => setRejectModal({ open: false, postId: null, reason: '' }),
          onConfirm: () => {
            if (rejectModal.postId) rejectPost(rejectModal.postId, rejectModal.reason)
            setRejectModal({ open: false, postId: null, reason: '' })
          }
        }}
      />
    </div>
  )
}

// Modals UI
// Placed after default export to keep file structure simple
export function AdminPostsModals({
  modal,
  onClose,
  reject,
}: {
  modal: { open: boolean; message: string } | null
  onClose: () => void
  reject: { open: boolean; reason: string; setReason: (v:string)=>void; onCancel: () => void; onConfirm: () => void }
}) {
  return (
    <>
      {modal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
            <p className="text-slate-800 mb-6">{modal.message}</p>
            <button onClick={onClose} className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">OK</button>
          </div>
        </div>
      )}
      {reject.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-3">Reason for rejection</h3>
            <textarea
              className="w-full border rounded-md p-2 mb-4"
              rows={4}
              value={reject.reason}
              onChange={(e)=>reject.setReason(e.target.value)}
              placeholder="Add an optional note"
            />
            <div className="flex justify-end gap-2">
              <button onClick={reject.onCancel} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={reject.onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Reject</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
