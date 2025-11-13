import PostCard from '@/components/community/PostCard'
import PostTypeChips from '@/components/community/PostTypeChips'
import { EmptyState } from '@/components/ui/EmptyState'
import { getPublishedPostsServer } from '@/lib/posts-server'
import type { PostType } from '@/lib/posts'
import { getTranslations } from 'next-intl/server'
import dynamic from 'next/dynamic'
const CreatePostButton = dynamic(() => import('@/components/community/CreatePostButton'), { ssr: false })
const MyPostsLink = dynamic(() => import('@/components/community/MyPostsLink'), { ssr: false })

export default async function CommunityPage({ searchParams }: { searchParams: { type?: string } }) {
  const t = await getTranslations('community')
  const selected = ((searchParams?.type as PostType) ?? 'all') as PostType | 'all'
  let posts = [] as Awaited<ReturnType<typeof getPublishedPostsServer>>
  try {
    posts = await getPublishedPostsServer(selected === 'all' ? undefined : (selected as PostType), 50)
  } catch (e) {
    // Render error state inline; avoid throwing to keep page
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-lg text-gray-600">{t('subtitle')}</p>
          </div>
          <PostTypeChips
            types={[
              { value: 'all', label: t('chips.all') },
              { value: 'event', label: t('chips.event') },
              { value: 'announcement', label: t('chips.announcement') },
              { value: 'obituary', label: t('chips.obituary') },
            ]}
            selected={selected}
          />
          <div className="mt-8 text-center">
            <p className="text-red-600">{t('error')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-lg text-gray-600">{t('subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <MyPostsLink />
            <CreatePostButton />
          </div>
        </div>

        <PostTypeChips
          types={[
            { value: 'all', label: t('chips.all') },
            { value: 'event', label: t('chips.event') },
            { value: 'announcement', label: t('chips.announcement') },
            { value: 'obituary', label: t('chips.obituary') },
          ]}
          selected={selected}
        />

        {posts.length === 0 ? (
          <EmptyState
            title={t('empty.title')}
            description={selected === 'all' ? t('empty.descAll') : t('empty.descType', { type: t(`chips.${selected}`) })}
            icon="📝"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {posts.map((post) => (<PostCard key={post.id} post={post as any} />))}
          </div>
        )}
      </div>
    </div>
  )
}
