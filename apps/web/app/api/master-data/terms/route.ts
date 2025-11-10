import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

// Public read-only endpoint for terms
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const onlyActive = (req.nextUrl.searchParams.get('active') ?? 'true') !== 'false'
    const type = req.nextUrl.searchParams.get('type') || undefined

    let query = supabase
      .from('terms')
      .select('id,type,version,content,effective_date,description,is_active,display_order')
      .is('deleted_at', null)

    if (type) query = query.eq('type', type)
    if (onlyActive) query = query.eq('is_active', true)

    query = query.order('type', { ascending: true }).order('effective_date', { ascending: false }).order('version', { ascending: false })

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to fetch terms' }, { status: 400 })
  }
}
