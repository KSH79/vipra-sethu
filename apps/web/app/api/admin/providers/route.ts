import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { getLocaleFromRequest } from '@/lib/i18n/locale-server'
import { getTranslation } from '@/lib/translations/db-helpers'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const locale = getLocaleFromRequest(req)

    const status = req.nextUrl.searchParams.get('status') || undefined
    const category = req.nextUrl.searchParams.get('category') || undefined
    const search = req.nextUrl.searchParams.get('search') || undefined
    const page = Math.max(Number(req.nextUrl.searchParams.get('page') || '1'), 1)
    const pageSize = Math.min(Math.max(Number(req.nextUrl.searchParams.get('pageSize') || '10'), 1), 100)
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('providers')
      .select(`
        id,
        name,
        status,
        category_code,
        sampradaya_code,
        photo_url,
        categories:categories(code,name,name_translations),
        sampradayas:sampradayas(code,name,name_translations)
      `, { count: 'exact' })

    if (status) query = query.eq('status', status)
    if (category) query = query.eq('category_code', category)
    if (search) query = query.or(`name.ilike.%${search}%,about.ilike.%${search}%`)

    const { data, error, count } = await query.range(from, to)
    if (error) throw error

    const providers = (data || []).map((p: any) => {
      const cat = p?.categories
      const samp = p?.sampradayas
      return {
        ...p,
        category: cat ? { code: cat.code, name: getTranslation(cat?.name_translations as any, locale) || cat?.name || '' } : null,
        sampradaya: samp ? { code: samp.code, name: getTranslation(samp?.name_translations as any, locale) || samp?.name || '' } : null,
      }
    })

    return NextResponse.json({ providers, total: count || providers.length, page, pageSize })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to fetch providers' }, { status: 400 })
  }
}
