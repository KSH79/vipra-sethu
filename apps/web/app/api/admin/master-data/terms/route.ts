import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

const TABLE = 'terms'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const type = req.nextUrl.searchParams.get('type') || undefined
    const includeDeleted = req.nextUrl.searchParams.get('includeDeleted') === 'true'
    const includeInactive = req.nextUrl.searchParams.get('includeInactive') === 'true'

    let query = supabase.from(TABLE).select('*')
    if (type) query = query.eq('type', type)
    if (!includeDeleted) query = query.is('deleted_at', null)
    if (!includeInactive) query = query.eq('is_active', true)

    query = query.order('type', { ascending: true }).order('effective_date', { ascending: false }).order('version', { ascending: false })

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to fetch terms' }, { status: 400 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id || null

    const body = await req.json()
    const type = (body.type || '').trim()
    const version = (body.version || '').trim()
    const content = (body.content || '').trim()
    const effective_date = body.effective_date || null
    const description = body.description?.trim() || null
    const is_active = !!body.is_active
    const display_order = typeof body.display_order === 'number' ? body.display_order : 0

    if (!type || !version || !content) return NextResponse.json({ ok: false, error: 'type, version, and content are required' }, { status: 400 })

    // Insert
    const { data, error } = await supabase
      .from(TABLE)
      .insert({ type, version, content, effective_date, description, is_active: false, display_order, created_by: userId, updated_by: userId })
      .select('*')
      .single()

    if (error) throw error

    // Optionally activate
    if (is_active) {
      // First deactivate others of same type, then activate this one
      const { error: e1 } = await supabase.from(TABLE).update({ is_active: false }).eq('type', type)
      if (e1) throw e1
      const { error: e2 } = await supabase.from(TABLE).update({ is_active: true }).eq('id', data.id)
      if (e2) throw e2
    }

    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to create terms' }, { status: 400 })
  }
}
