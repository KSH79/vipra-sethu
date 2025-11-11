import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSignedPhotoUrl } from '@/lib/storage'
import { getLocaleFromRequest } from '@/lib/i18n/locale-server'
import { getTranslation } from '@/lib/translations/db-helpers'

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
    const locale = getLocaleFromRequest(req)

    const sb = getAdmin()
    let query = sb
      .from('providers')
      .select(`
        *,
        categories:categories(code,name,name_translations),
        sampradayas:sampradayas(code,name,name_translations)
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

    const list = data || []

    // Batch fetch primary thumbnails for providers
    const providerIds = list.map((p: any) => p.id)
    let photoMap: Record<string, { thumbnail_path?: string|null; original_path?: string|null }> = {}
    if (providerIds.length) {
      const { data: photos } = await getAdmin()
        .from('provider_photos')
        .select('provider_id, thumbnail_path, original_path, is_primary')
        .in('provider_id', providerIds)
        .eq('is_primary', true)
      for (const ph of (photos || []) as any[]) {
        photoMap[ph.provider_id] = { thumbnail_path: ph.thumbnail_path, original_path: ph.original_path }
      }
    }

    const providers = await Promise.all(list.map(async (p: any) => {
      // Drawer algorithm (simplified for list): prefer signed thumbnail -> signed profile photo
      let signedUrl: string | null = null
      let signedThumb: string | null = null
      let signedOrig: string | null = null
      const thumb = photoMap[p.id]?.thumbnail_path as string | undefined
      const orig = photoMap[p.id]?.original_path as string | undefined
      try {
        if (thumb) {
          signedThumb = await getSignedPhotoUrl(thumb)
        } else if (p.photo_url) {
          signedUrl = await getSignedPhotoUrl(p.photo_url as string)
        }
        if (orig) {
          signedOrig = await getSignedPhotoUrl(orig)
        }
      } catch {}
      const category = p.categories ? {
        code: p.categories.code,
        name: getTranslation(p.categories?.name_translations as any, locale) || p.categories?.name || '',
      } : null
      const sampradaya = p.sampradayas ? {
        code: p.sampradayas.code,
        name: getTranslation(p.sampradayas?.name_translations as any, locale) || p.sampradayas?.name || '',
      } : null
      return {
        ...p,
        category,
        sampradaya,
        photo_thumbnail_url: signedThumb || null,
        photo_original_url: signedOrig || null,
        photo_url: signedThumb || signedUrl || null,
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
