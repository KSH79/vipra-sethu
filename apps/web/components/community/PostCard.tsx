'use client';

import Link from 'next/link'
import { Post } from '@/lib/posts'
import { useTranslations } from 'next-intl'

interface PostCardProps {
  post: Post
}

const TYPE_COLORS: Record<string, string> = {
  event: 'bg-blue-100 text-blue-800 border-blue-200',
  announcement: 'bg-green-100 text-green-800 border-green-200',
  obituary: 'bg-gray-100 text-gray-800 border-gray-300',
  resource: 'bg-purple-100 text-purple-800 border-purple-200',
  request: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  temple: 'bg-orange-100 text-orange-800 border-orange-200',
}

const TYPE_ICONS: Record<string, string> = {
  event: '📅',
  announcement: '📢',
  obituary: '🕊️',
  resource: '📚',
  request: '🙏',
  temple: '🛕',
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  return `${Math.floor(diff / 86400)} days ago`
}

export default function PostCard({ post }: PostCardProps) {
  const tc = useTranslations('community')
  const typeColor = TYPE_COLORS[post.type] || 'bg-gray-100 text-gray-800'
  const typeIcon = TYPE_ICONS[post.type] || '📝'
  const typeLabel = (() => {
    try { return tc(`chips.${post.type}`) } catch { return post.type.charAt(0).toUpperCase() + post.type.slice(1) }
  })()

  const eventDate = post.starts_at
    ? new Date(post.starts_at).toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : null

  const ago = timeAgo(post.created_at)

  return (
    <Link href={`/community/${post.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 cursor-pointer h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${typeColor}`}>
            {typeIcon} {typeLabel}
          </span>
          {eventDate && (
            <span className="text-sm font-semibold text-blue-600">{eventDate}</span>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>

        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{post.body}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
          <span>{ago}</span>
          {post.location && <span className="flex items-center gap-1">📍 {post.location}</span>}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
