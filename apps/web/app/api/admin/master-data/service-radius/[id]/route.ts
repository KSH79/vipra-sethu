import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

const TABLE = 'service_radius_options'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id || null

    const id = decodeURIComponent(params.id)
    const body = await req.json()

    const update: any = { updated_at: new Date().toISOString(), updated_by: userId }
    if ('value_km' in body) update.value_km = typeof body.value_km === 'number' ? body.value_km : null
    if ('display_text' in body) update.display_text = (body.display_text || '').trim()
    if ('description' in body) update.description = body.description?.trim() || null
    if ('display_order' in body) update.display_order = typeof body.display_order === 'number' ? body.display_order : 0
    if ('is_active' in body) update.is_active = !!body.is_active

    const { data, error } = await supabase
      .from(TABLE)
      .update(update)
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to update service radius option' }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id || null

    const id = decodeURIComponent(params.id)

    const { data, error } = await supabase
      .from(TABLE)
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString(), updated_by: userId })
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to delete service radius option' }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  return PUT(req, ctx)
}
