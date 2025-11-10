import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

const TABLE = 'sampradaya_categories'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const sampradaya_code = req.nextUrl.searchParams.get('sampradaya_code') || undefined
    const category_code = req.nextUrl.searchParams.get('category_code') || undefined

    let query = supabase.from(TABLE).select('*')
    if (sampradaya_code) query = query.eq('sampradaya_code', sampradaya_code)
    if (category_code) query = query.eq('category_code', category_code)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to fetch sampradaya-category mappings' }, { status: 400 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id || null

    const body = await req.json()
    const sampradaya_code = (body.sampradaya_code || '').trim()
    const category_code = (body.category_code || '').trim()
    if (!sampradaya_code || !category_code) return NextResponse.json({ ok: false, error: 'sampradaya_code and category_code are required' }, { status: 400 })

    const { data, error } = await supabase
      .from(TABLE)
      .insert({ sampradaya_code, category_code, created_by: userId })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to create mapping' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const _userId = session?.user?.id || null

    const body = await req.json()
    const sampradaya_code = (body.sampradaya_code || '').trim()
    const category_code = (body.category_code || '').trim()
    if (!sampradaya_code || !category_code) return NextResponse.json({ ok: false, error: 'sampradaya_code and category_code are required' }, { status: 400 })

    const { data, error } = await supabase
      .from(TABLE)
      .delete()
      .eq('sampradaya_code', sampradaya_code)
      .eq('category_code', category_code)
      .select('*')

    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to delete mapping' }, { status: 400 })
  }
}
