import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSignedPhotoUrl } from '@/lib/storage'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const text = searchParams.get('text') || undefined
    const category_code = searchParams.get('category_code') || undefined
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)

    const sb = getAdmin()
    let query = sb
      .from('providers')
      .select(`
        *,
        categories:categories(code,name),
        sampradayas:sampradayas(code,name)
      `, { count: 'exact' })
      .eq('status', 'approved')

    if (text) {
      query = query.or(`name.ilike.%${text}%,about.ilike.%${text}%`)
    }
    if (category_code) {
      // filter by related categories.name/code via foreign key alias
      query = query.eq('categories.code', category_code)
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1)
    if (error) {
      console.error('providers search error:', error)
      return NextResponse.json({ ok: false, error: 'Failed to fetch providers' }, { status: 500 })
    }

    const providers = await Promise.all((data || []).map(async (p: any) => {
      let signedUrl: string | null = null
      try {
        if (p.photo_url) {
          signedUrl = await getSignedPhotoUrl(p.photo_url as string)
        }
      } catch {}
      return {
        ...p,
        category: p.categories,
        sampradaya: p.sampradayas,
        photo_url: signedUrl || null,
      }
    }))

    return NextResponse.json({
      ok: true,
      data: providers,
      total: count || providers.length,
      limit,
      offset,
    })
  } catch (e) {
    console.error('API /providers/search error:', e)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}
