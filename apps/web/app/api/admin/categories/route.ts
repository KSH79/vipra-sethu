import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('categories')
      .select('code,name')
      .is('deleted_at', null)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ ok: true, categories: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to fetch categories' }, { status: 400 })
  }
}
