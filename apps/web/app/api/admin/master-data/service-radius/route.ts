import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { getLocaleFromRequest } from '@/lib/i18n/locale-server'
import { getTranslation } from '@/lib/translations/db-helpers'

const TABLE = 'service_radius_options'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const locale = getLocaleFromRequest(req)
    const search = req.nextUrl.searchParams.get('q')?.trim() || ''
    const includeDeleted = req.nextUrl.searchParams.get('includeDeleted') === 'true'
    const includeInactive = req.nextUrl.searchParams.get('includeInactive') === 'true'

    let query = supabase.from(TABLE).select('*')
    if (!includeDeleted) query = query.is('deleted_at', null)
    if (!includeInactive) query = query.eq('is_active', true)
    if (search) query = query.ilike('display_text', `%${search}%`)

    query = query.order('display_order', { ascending: true }).order('value_km', { ascending: true })

    const { data, error } = await query
    if (error) throw error
    const rows = (data as any[]) || []
    const mapped = rows.map((row) => ({
      ...row,
      translated_name: getTranslation(row?.name_translations as any, locale) || row?.display_text,
      translated_description: getTranslation(row?.description_translations as any, locale) || row?.description,
    }))
    return NextResponse.json({ ok: true, data: mapped })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to fetch service radius options' }, { status: 400 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id || null

    const body = await req.json()
    const value_km = typeof body.value_km === 'number' ? body.value_km : null
    const display_text = (body.display_text || '').trim()
    const description = body.description?.trim() || null
    const display_order = typeof body.display_order === 'number' ? body.display_order : 0
    const is_active = body.is_active !== false

    if (!display_text) return NextResponse.json({ ok: false, error: 'display_text is required' }, { status: 400 })

    const { data, error } = await supabase
      .from(TABLE)
      .insert({ value_km, display_text, description, display_order, is_active, created_by: userId, updated_by: userId })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to create service radius option' }, { status: 400 })
  }
}
