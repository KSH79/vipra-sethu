import Link from 'next/link'

interface Post {
  id: string
  title: string
  type: 'event' | 'announcement' | 'obituary'
  created_at: string
}

export function CommunityHighlights({ posts }: { posts: Post[] }) {
  const items = posts.slice(0, 3)
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">What's Happening in Our Community</h2>
        {items.length === 0 ? (
          <p className="text-center text-gray-600">Community content coming soon!</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {items.map((p) => (
              <div key={p.id} className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{p.type}</div>
                <h3 className="font-semibold line-clamp-2">{p.title}</h3>
                <p className="text-xs text-gray-500 mt-2">{relativeTime(p.created_at)}</p>
                <Link href={`/community/${p.id}`} className="mt-3 inline-block text-orange-600 hover:text-orange-700 text-sm">Read More →</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function relativeTime(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff/60)} min ago`
  if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`
  return `${Math.floor(diff/86400)} days ago`
}
