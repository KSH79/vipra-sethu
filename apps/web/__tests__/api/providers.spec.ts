import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/storage', () => ({
  getSignedPhotoUrl: vi.fn(async (p: string) => `https://signed.local/${p}`),
}))

// Minimal Supabase client mock for providers
const selectMock = vi.fn()
const rangeMock = vi.fn()
const eqMock = vi.fn()
const orMock = vi.fn()
const maybeSingleMock = vi.fn()

const rpcMock = vi.fn()

const buildProvidersList = (rows: any[], count = rows.length) => {
  selectMock.mockReturnValue({ eq: eqMock, or: orMock, range: rangeMock, maybeSingle: maybeSingleMock })
  eqMock.mockReturnValue({ eq: eqMock, or: orMock, range: rangeMock, select: selectMock, maybeSingle: maybeSingleMock })
  orMock.mockReturnValue({ eq: eqMock, or: orMock, range: rangeMock, select: selectMock, maybeSingle: maybeSingleMock })
  rangeMock.mockResolvedValue({ data: rows, error: null, count })
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === 'providers') {
        return {
          select: selectMock,
          eq: eqMock,
          or: orMock,
          range: rangeMock,
          maybeSingle: maybeSingleMock,
        } as any
      }
      throw new Error('unexpected table ' + table)
    },
    rpc: rpcMock,
  })),
}))

import { GET as providersSearchGET } from '@/app/api/providers/search/route'
import { GET as providerByIdGET } from '@/app/api/providers/[id]/route'

describe('providers API', () => {
  beforeEach(() => {
    selectMock.mockReset(); rangeMock.mockReset(); eqMock.mockReset(); orMock.mockReset(); maybeSingleMock.mockReset(); rpcMock.mockReset()
  })

  it('search returns providers with signed photo url', async () => {
    buildProvidersList([
      { id: 'p1', name: 'Guru', status: 'approved', photo_url: 'thumbs/p1/u.webp', categories: { code: 'purohit', name: 'Purohit' }, sampradayas: { code: 'madhwa', name: 'Madhwa' } },
    ], 1)

    const req = new NextRequest(new Request('http://test.local/api/providers/search?text=guru&limit=10&offset=0'))
    const res = await providersSearchGET(req as any)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(json.data[0].photo_url).toMatch(/^https:\/\/signed\.local\/thumbs\/p1/)
    expect(json.total).toBe(1)
  })

  it('detail returns one provider with signed photo url', async () => {
    // Force RPC failure so route uses fallback select
    rpcMock.mockImplementation(() => { throw new Error('rpc not available') })
    // Prepare select() -> eq() -> maybeSingle() chain
    buildProvidersList([])
    maybeSingleMock.mockResolvedValue({ data: { id: 'p1', name: 'Guru', photo_url: 'thumbs/p1/u.webp', categories: { code: 'purohit', name: 'Purohit' }, sampradayas: { code: 'madhwa', name: 'Madhwa' } }, error: null })

    const req = new NextRequest(new Request('http://test.local/api/providers/p1'))
    const res = await providerByIdGET(req as any, { params: { id: 'p1' } })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.ok).toBe(true)
    expect(json.data.photo_url).toMatch(/^https:\/\/signed\.local\/thumbs\/p1/)
    expect(json.data.id).toBe('p1')
  })
})
