import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      exchangeCodeForSession: async (_code: string) => ({ error: null }),
    },
  }),
}))

// Import after mocks
import { GET as authCallbackGET } from '@/app/auth/callback/route'

function makeRequest(url: string) {
  return new Request(url)
}

describe('auth/callback route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to relative next path on success', async () => {
    const req = makeRequest('http://localhost:3000/auth/callback?code=abc&next=/admin')
    const res: any = await authCallbackGET(req as any)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/admin')
  })

  it('redirects to same-origin absolute next URL on success', async () => {
    const req = makeRequest('http://localhost:3000/auth/callback?code=abc&next=http%3A%2F%2Flocalhost%3A3000%2Fadmin')
    const res: any = await authCallbackGET(req as any)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/admin')
  })

  it('falls back to origin when next is cross-origin', async () => {
    const req = makeRequest('http://localhost:3000/auth/callback?code=abc&next=http%3A%2F%2Fevil.com%2F')
    const res: any = await authCallbackGET(req as any)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/')
  })

  it('redirects to login with error when no code is present', async () => {
    const req = makeRequest('http://localhost:3000/auth/callback?next=%2Fadmin')
    const res: any = await authCallbackGET(req as any)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/login?error=auth_failed')
  })
})
