import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

const TABLE = 'terms'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id || null

    const id = decodeURIComponent(params.id)
    const body = await req.json()

    const update: any = { updated_at: new Date().toISOString(), updated_by: userId }
    if ('type' in body) update.type = (body.type || '').trim()
    if ('version' in body) update.version = (body.version || '').trim()
    if ('content' in body) update.content = (body.content || '').trim()
    if ('effective_date' in body) update.effective_date = body.effective_date || null
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

    // Ensure unique active per type if is_active true
    if (update.is_active === true && data?.type) {
      const { error: e1 } = await supabase.from(TABLE).update({ is_active: false }).eq('type', data.type).neq('id', data.id)
      if (e1) throw e1
    }

    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to update terms' }, { status: 400 })
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
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to delete terms' }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  return PUT(req, ctx)
}
