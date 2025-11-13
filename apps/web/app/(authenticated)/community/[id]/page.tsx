import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostByIdServer } from '@/lib/posts-server'

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  let post: any
  try {
    post = await getPostByIdServer(params.id)
  } catch (e) {
    return notFound()
  }

  const eventDate = post?.starts_at
    ? new Date(post.starts_at).toLocaleString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/community" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6">
          ← Back to Community
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-4">
            <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {eventDate && <div className="mb-4 text-lg font-semibold text-blue-600">📅 {eventDate}</div>}

          {post.location && <div className="mb-4 text-gray-600">📍 {post.location}</div>}

          <div className="prose prose-lg max-w-none mb-8">
            <p className="whitespace-pre-wrap">{post.body}</p>
          </div>

          {post.type === 'event' && post.meta?.venue && (
            <div className="border-t pt-6 mb-6">
              <h3 className="font-bold text-lg mb-2">Event Details</h3>
              <p className="text-gray-700"><strong>Venue:</strong> {post.meta.venue}</p>
              {post.meta.organizer_name && (
                <p className="text-gray-700"><strong>Organizer:</strong> {post.meta.organizer_name}</p>
              )}
              {post.meta.ritual_context && (
                <p className="text-gray-700"><strong>Context:</strong> {post.meta.ritual_context}</p>
              )}
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-6 border-t">
              {post.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
