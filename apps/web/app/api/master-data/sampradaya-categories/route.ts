import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

// Public read-only endpoint for sampradaya-category mapping
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const sampradaya_code = req.nextUrl.searchParams.get('sampradaya_code') || undefined
    const category_code = req.nextUrl.searchParams.get('category_code') || undefined

    let query = supabase.from('sampradaya_categories').select('sampradaya_code,category_code,created_at')
    if (sampradaya_code) query = query.eq('sampradaya_code', sampradaya_code)
    if (category_code) query = query.eq('category_code', category_code)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to fetch mappings' }, { status: 400 })
  }
}
