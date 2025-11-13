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
