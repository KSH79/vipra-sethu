import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    const q = email.trim().toLowerCase()

    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!baseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    const adminUrl = `${baseUrl}/auth/v1/admin/users?email=${encodeURIComponent(q)}`
    const userUrl = `${baseUrl}/auth/v1/users?email=${encodeURIComponent(q)}`

    const doFetch = (url: string) => fetch(url, {
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey
      },
      // Explicitly GET; Supabase Admin endpoint supports GET with email param
      method: 'GET',
      cache: 'no-store'
    })

    let exists = false

    // Try admin endpoint first
    let resp = await doFetch(adminUrl)
    if (resp.ok) {
      const body = await resp.json()
      exists = Array.isArray(body)
        ? body.length > 0
        : (Array.isArray((body as any)?.users) ? (body as any).users.length > 0 : !!(body as any)?.id)
    } else {
      // If admin path not available, try non-admin path (varies by Supabase version)
      resp = await doFetch(userUrl)
      if (resp.ok) {
        const body = await resp.json()
        exists = Array.isArray(body)
          ? body.length > 0
          : (Array.isArray((body as any)?.users) ? (body as any).users.length > 0 : !!(body as any)?.id)
      } else if (resp.status === 404) {
        exists = false
      } else {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
      }
    }

    return NextResponse.json({ exists })
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
