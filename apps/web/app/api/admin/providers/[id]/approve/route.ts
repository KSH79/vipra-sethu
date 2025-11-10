import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const id = params.id

    const { data: { session } } = await supabase.auth.getSession()
    const adminId = session?.user?.id || null

    const { error } = await supabase
      .from('providers')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: adminId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Internal error' }, { status: 500 })
  }
}
