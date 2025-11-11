import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

const TABLE = 'sampradayas'

export async function PUT(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id || null

    const code = decodeURIComponent(params.code)
    const body = await req.json()

    const update: any = {
      updated_at: new Date().toISOString(),
      updated_by: userId,
    }
    if (typeof body.name === 'string') update.name = body.name.trim()
    if (typeof body.description === 'string') update.description = body.description.trim()
    if (typeof body.display_order === 'number') update.display_order = body.display_order
    if (typeof body.is_active === 'boolean') update.is_active = body.is_active

    const { data, error } = await supabase
      .from(TABLE)
      .update(update)
      .eq('code', code)
      .select('*')
      .maybeSingle()

    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to update sampradaya' }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id || null

    const code = decodeURIComponent(params.code)

    const { data, error } = await supabase
      .from(TABLE)
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString(), updated_by: userId })
      .eq('code', code)
      .select('*')
      .maybeSingle()

    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to delete sampradaya' }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest, ctx: { params: { code: string } }) {
  return PUT(req, ctx)
}
