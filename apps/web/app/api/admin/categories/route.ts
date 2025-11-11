import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { getLocaleFromRequest } from '@/lib/i18n/locale-server'
import { getTranslation } from '@/lib/translations/db-helpers'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const locale = getLocaleFromRequest(req)
    let query = supabase
      .from('categories')
      .select('code,name,name_translations')
      .is('deleted_at', null)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    const { data, error } = await query
    if (error) throw error
    const rows = (data as any[]) || []
    const categories = rows.map((row) => ({
      code: row.code,
      name: getTranslation(row?.name_translations as any, locale) || row?.name || '',
    }))
    return NextResponse.json({ ok: true, categories })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to fetch categories' }, { status: 400 })
  }
}
