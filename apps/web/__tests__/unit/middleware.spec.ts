import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @supabase/ssr createServerClient used in middleware
vi.mock('@supabase/ssr', () => {
  const state: any = {
    session: null as any,
    isAdmin: false,
  }
  function setSession(s: any) { state.session = s }
  function setIsAdmin(v: boolean) { state.isAdmin = v }
  const client: any = {
    auth: {
      async getSession() {
        return { data: { session: state.session } }
      },
    },
    from() {
      return {
        select() {
          return {
            eq() {
              return {
                single: async () => {
                  if (state.isAdmin) return { data: { user_email: state.session?.user?.email }, error: null }
                  return { data: null, error: { message: 'not admin' } }
                },
              }
            },
          }
        },
      }
    },
  }
  return {
    __esModule: true,
    createServerClient: vi.fn(() => client),
    // expose helpers for tests to control state
    _test: { setSession, setIsAdmin },
  }
})

import { middleware } from '@/middleware'
import { NextResponse } from 'next/server'
import * as ssr from '@supabase/ssr'

function makeReq(url: string): any {
  const u = new URL(url)
  return {
    url,
    nextUrl: { pathname: u.pathname, search: u.search },
    cookies: { getAll: () => [] },
  }
}

describe('middleware admin auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(ssr as any)._test.setSession(null)
    ;(ssr as any)._test.setIsAdmin(false)
  })

  it('redirects unauthenticated admin request to login with relative redirectTo', async () => {
    const req = makeReq('http://localhost:3000/admin?x=1')
    const res = await middleware(req as any)
    expect(res.status).toBe(307)
    const loc = res.headers.get('location')!
    expect(loc.startsWith('http://localhost:3000/login')).toBe(true)
    expect(decodeURIComponent(new URL(loc).searchParams.get('redirectTo') || '')).toBe('/admin?x=1')
  })

  it('redirects authenticated non-admin to home', async () => {
    ;(ssr as any)._test.setSession({ user: { email: 'user@example.com' } })
    const req = makeReq('http://localhost:3000/admin')
    const res = await middleware(req as any)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/')
  })

  it('allows authenticated admin through', async () => {
    ;(ssr as any)._test.setSession({ user: { email: 'admin@example.com' } })
    ;(ssr as any)._test.setIsAdmin(true)
    const req = makeReq('http://localhost:3000/admin')
    const res = await middleware(req as any)
    expect(res.status).toBe(200)
    // NextResponse.next yields a basic 200
    expect(res.headers.get('location')).toBeNull()
  })
})
