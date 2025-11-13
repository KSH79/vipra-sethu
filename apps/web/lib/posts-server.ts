import { createClient } from '@/lib/supabase/server'
import type { Post, PostType } from '@/lib/posts'

export async function getPublishedPostsServer(type?: PostType, limit: number = 10, offset: number = 0) {
  const supabase = createClient()
  let query = supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)

  const { data, error } = await query.range(offset, offset + limit - 1)
  if (error) throw error
  return data as Post[]
}

export async function getPostByIdServer(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Post
}
