import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'pending_review'
  const category = searchParams.get('category') || ''
  const search = (searchParams.get('search') || '').trim()
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)))

  let query = supabase
    .from('providers')
    .select(
      `id, name, email, phone, location_text, created_at, status, approved_at, category_code, sampradaya_code`,
      { count: 'exact' }
    )
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category_code', category)
  }
  if (search) {
    // Search by name and location text
    query = query.or(
      `name.ilike.%${search}%,location_text.ilike.%${search}%`
    )
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await query.range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    providers: (data || []).map((p: any) => ({
      id: p.id,
      name: p.name || 'Unknown',
      email: p.email,
      phone: p.phone,
      location: p.location_text,
      submittedAt: p.created_at,
      status: p.status,
      category_code: p.category_code,
      sampradaya: p.sampradaya_code,
    })),
    total: count || 0,
    page,
    pageSize,
  })
}
