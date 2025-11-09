import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Supabase SSR client
const signOutMock = vi.fn(async () => ({}))
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { signOut: signOutMock },
  }),
}))

import { POST as logoutPOST } from '@/app/auth/logout/route'

describe('/auth/logout route', () => {
  it('redirects to origin and calls signOut', async () => {
    const req = new NextRequest(new Request('http://localhost:3000/auth/logout', { method: 'POST' }))
    const res = await logoutPOST(req as any)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/')
    expect(signOutMock).toHaveBeenCalled()
  })
})
