import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function GET() {
  const supabase = await createClient()

  // Pending count
  const { count: pendingCount, error: pendingErr } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending_review')

  if (pendingErr) return NextResponse.json({ error: pendingErr.message }, { status: 500 })

  // Approved this month
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const { count: approvedThisMonth, error: approvedErr } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')
    .gte('approved_at', firstOfMonth.toISOString())

  if (approvedErr) return NextResponse.json({ error: approvedErr.message }, { status: 500 })

  // Avg review time (hours) for items approved this month
  const { data: approvedRows, error: rowsErr } = await supabase
    .from('providers')
    .select('created_at, approved_at')
    .eq('status', 'approved')
    .gte('approved_at', firstOfMonth.toISOString())
    .limit(500)

  if (rowsErr) return NextResponse.json({ error: rowsErr.message }, { status: 500 })

  let avgHours = 0
  if (approvedRows && approvedRows.length > 0) {
    const diffs = approvedRows
      .filter(r => r.created_at && r.approved_at)
      .map(r => (new Date(r.approved_at as any).getTime() - new Date(r.created_at as any).getTime()) / 3600000)
    if (diffs.length > 0) avgHours = Math.round((diffs.reduce((a,b)=>a+b,0) / diffs.length) * 10) / 10
  }

  return NextResponse.json({
    pendingCount: pendingCount || 0,
    approvedThisMonth: approvedThisMonth || 0,
    avgReviewHours: avgHours,
  })
}
