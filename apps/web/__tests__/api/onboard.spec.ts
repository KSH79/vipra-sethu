import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/photo', () => ({
  uploadWithThumbnail: vi.fn(async () => ({
    originalPath: 'originals/p1/uuid.jpg',
    thumbnailPath: 'thumbs/p1/uuid.webp',
    mimeType: 'image/jpeg',
    sizeBytes: 1234,
  })),
}))

// Minimal Supabase client mock with chaining
const providersInsertMock = vi.fn(() => ({
  select: vi.fn(() => ({
    single: vi.fn(async () => ({ data: { id: 'prov-1' }, error: null })),
  })),
}))
const providersUpdateMock = vi.fn(() => ({
  eq: vi.fn(async () => ({ error: null })),
}))
const photosInsertMock = vi.fn(async () => ({ error: null }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === 'providers') {
        return {
          insert: providersInsertMock as any,
          update: providersUpdateMock as any,
        } as any
      }
      if (table === 'provider_photos') {
        return { insert: photosInsertMock } as any
      }
      throw new Error('unexpected table ' + table)
    },
    rpc: vi.fn(),
  })),
}))

// Ensure env vars expected by the route are present during tests
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://test.local'
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key'

// Import after mocks and env setup
import { POST as onboardPOST } from '@/app/api/onboard/route'

function makeFormData(fields: Record<string, any>, file?: { name: string; type: string; size: number }) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.append(k, v as any)
  if (file) {
    const blob = new Blob([new Uint8Array(file.size)], { type: file.type })
    const f = new File([blob], file.name, { type: file.type })
    fd.append('photo', f)
  }
  return fd
}

describe('/api/onboard', () => {
  beforeEach(() => {
    providersInsertMock.mockClear()
    providersUpdateMock.mockClear()
    photosInsertMock.mockClear()
  })

  it('creates provider, uploads photo, inserts metadata, updates provider', async () => {
    const fd = makeFormData({
      name: 'Guru',
      phone: '+91 99999 99999',
      category: 'purohit',
      languages: 'kannada,english',
      termsAccepted: 'true',
    }, { name: 'p.jpg', type: 'image/jpeg', size: 1024 })

    const req = new NextRequest(new Request('http://test.local/api/onboard', { method: 'POST', body: fd }))
    const res = await onboardPOST(req as any)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(providersInsertMock).toHaveBeenCalled()
    expect(photosInsertMock).toHaveBeenCalled()
  })

  it('rejects invalid phone', async () => {
    const fd = makeFormData({
      name: 'Guru',
      phone: 'BAD!',
      category: 'purohit',
      languages: 'kannada',
      termsAccepted: 'true',
    })
    const req = new NextRequest(new Request('http://test.local/api/onboard', { method: 'POST', body: fd }))
    const res = await onboardPOST(req as any)
    expect(res.status).toBe(400)
  })
})
