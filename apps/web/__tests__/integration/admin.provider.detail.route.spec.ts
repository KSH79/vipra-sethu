import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock supabase server client used by the route
const providerId = '11111111-1111-4111-8111-111111111111'
const mockProvider = {
  id: providerId,
  name: 'Test Provider',
  phone: '+911234567890',
  whatsapp: '+911234567890',
  languages: ['en','kn'],
  photo_url: null,
  profile_photo_url: 'https://cdn.example.com/p.jpg',
  email: 'p@example.com',
  location_text: 'Bangalore',
  status: 'pending_review',
  category_code: 'cook',
  sampradaya_code: 'smarta',
  service_radius_km: 10,
  years_experience: 5,
  about: 'About me',
  availability_notes: 'Weekdays only',
  travel_notes: 'Within city',
  expectations: ['proper kitchen'],
  response_time_hours: 24,
  rejection_reason: null,
}
const mockPhoto = { thumbnail_path: 'https://cdn.example.com/thumb.webp', original_path: 'https://cdn.example.com/orig.jpg' }

class QueryBuilder {
  private table: string
  private filters: Record<string, any> = {}
  private sel = ''
  constructor(table: string){ this.table = table }
  select(s: string){ this.sel = s; return this }
  eq(col: string, val: any){ this.filters[col] = val; return this }
  limit(_n: number){ return this }
  async single(){
    if (this.table === 'providers' && this.filters.id === providerId) {
      return { data: mockProvider, error: null as any }
    }
    return { data: null as any, error: { message: 'Not found' } as any }
  }
  async maybeSingle(){
    if (this.table === 'provider_photos' && this.filters.provider_id === providerId && this.filters.is_primary === true) {
      return { data: mockPhoto as any, error: null as any }
    }
    return { data: null as any, error: null as any }
  }
}

vi.mock('@/lib/supabaseServer', () => ({
  createClient: async () => ({
    from: (table: string) => new QueryBuilder(table),
    storage: {
      from: (_bucket: string) => ({
        createSignedUrl: async (path: string) => ({ data: { signedUrl: `https://signed.example.com/${path}` } })
      })
    }
  })
}))

import { GET as providerDetailGET } from '@/app/api/admin/providers/[id]/route'

describe('/api/admin/providers/[id] route', () => {

  it('returns non-audit provider fields and primary photo when found', async () => {
    const req = new NextRequest(new Request(`http://localhost:3000/api/admin/providers/${providerId}`))
    const res = await providerDetailGET(req as any, { params: { id: providerId }})
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.provider).toBeTruthy()
    expect(json.provider.name).toBe('Test Provider')
    // ensure audit fields like created_at are not expected here
    expect(json.provider.created_at).toBeUndefined()
    // include business fields
    expect(json.provider.whatsapp).toBe('+911234567890')
    expect(json.provider.languages).toEqual(['en','kn'])
    expect(json.provider.service_radius_km).toBe(10)
    expect(json.provider.about).toBe('About me')
    // photo object includes signed URL fields
    expect(json.photo).toBeTruthy()
    expect(json.photo.thumbnail_url).toContain('https://signed.example.com/')
  })

  it('404 when provider missing', async () => {
    const id = '22222222-2222-4222-8222-222222222222'
    const req = new NextRequest(new Request(`http://localhost:3000/api/admin/providers/${id}`))
    const res = await providerDetailGET(req as any, { params: { id }})
    expect(res.status).toBe(404)
  })
})
