import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const onlyActive = (req.nextUrl.searchParams.get('active') ?? 'true') !== 'false'

    let query = supabase.from('service_radius_options').select('id,value_km,display_text,description,display_order,is_active')
    query = query.is('deleted_at', null)
    if (onlyActive) query = query.eq('is_active', true)
    query = query.order('display_order', { ascending: true }).order('value_km', { ascending: true })

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to fetch service radius options' }, { status: 400 })
  }
}
