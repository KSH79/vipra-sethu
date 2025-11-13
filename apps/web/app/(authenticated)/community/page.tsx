'use client'

import { useEffect, useState } from 'react'
import { getPublishedPosts, type Post, type PostType } from '@/lib/posts'
import PostCard from '@/components/community/PostCard'
import PostTypeChips from '@/components/community/PostTypeChips'
import { EmptyState } from '@/components/ui/EmptyState'

const POST_TYPES: { value: PostType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'event', label: 'Events' },
  { value: 'announcement', label: 'Announcements' },
  { value: 'obituary', label: 'Obituaries' },
]

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<PostType | 'all'>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType])

  async function loadPosts() {
    try {
      setLoading(true)
      setError(null)
      const data = await getPublishedPosts(selectedType === 'all' ? undefined : selectedType, 50)
      setPosts(data)
    } catch (err) {
      console.error('Error loading posts:', err)
      setError('Failed to load community posts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Community</h1>
          <p className="text-lg text-gray-600">Stay connected with events, announcements, and updates from our community</p>
        </div>

        <PostTypeChips types={POST_TYPES} selected={selectedType} onChange={setSelectedType} />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-md animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 text-center">
            <p className="text-red-600">{error}</p>
            <button onClick={loadPosts} className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Try Again</button>
          </div>
        ) : posts.length === 0 ? (
          <EmptyState title="No posts yet" description={selectedType === 'all' ? 'Be the first to share something with the community!' : `No ${selectedType}s have been posted yet.`} icon="📝" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {posts.map((post) => (<PostCard key={post.id} post={post} />))}
          </div>
        )}
      </div>
    </div>
  )
}
