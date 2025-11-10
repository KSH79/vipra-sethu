import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const search = req.nextUrl.searchParams.get('q')?.trim() || ''
    const includeDeleted = req.nextUrl.searchParams.get('includeDeleted') === 'true'
    const includeInactive = req.nextUrl.searchParams.get('includeInactive') === 'true'

    let query = supabase.from('languages').select('*')

    if (!includeDeleted) query = query.is('deleted_at', null)
    if (!includeInactive) query = query.eq('is_active', true)
    if (search) query = query.ilike('name', `%${search}%`)

    query = query.order('display_order', { ascending: true }).order('name', { ascending: true })

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to fetch languages' }, { status: 400 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id || null

    const body = await req.json()
    const code = (body.code || '').trim()
    const name = (body.name || '').trim()
    const native_name = body.native_name?.trim() || null
    const description = body.description?.trim() || null
    const display_order = typeof body.display_order === 'number' ? body.display_order : 0
    const is_active = body.is_active !== false

    if (!code || !name) return NextResponse.json({ ok: false, error: 'code and name are required' }, { status: 400 })

    const { data, error } = await supabase
      .from('languages')
      .insert({ code, name, native_name, description, display_order, is_active, created_by: userId, updated_by: userId })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to create language' }, { status: 400 })
  }
}
