import { createClient } from '@/lib/supabase/client'

export type PostType = 'event' | 'announcement' | 'obituary' | 'resource' | 'request' | 'temple'
export type PostStatus = 'draft' | 'pending' | 'approved' | 'published' | 'rejected'

export interface Post {
  id: string
  type: PostType
  title: string
  body: string
  tags: string[]
  languages: string[]
  location?: string | null
  starts_at?: string | null
  ends_at?: string | null
  links: string[]
  media: any[]
  meta: any
  created_by: string
  status: PostStatus
  rejection_reason?: string | null
  approved_by?: string | null
  approved_at?: string | null
  created_at: string
  updated_at: string
}

// Fetch published posts (public)
export async function getPublishedPosts(
  type?: PostType,
  limit: number = 10,
  offset: number = 0
) {
  const supabase = createClient()

  let query = supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query.range(offset, offset + limit - 1)
  if (error) throw error
  return data as Post[]
}

// Fetch single post by ID
export async function getPostById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Post
}

// Fetch user's own posts (for editors)
export async function getMyPosts(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Post[]
}
