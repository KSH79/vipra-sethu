import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient()

    // Pending count
    const { count: pendingCount, error: e1 } = await supabase
      .from('providers')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending_review')
    if (e1) throw e1

    // Approved this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const { count: approvedThisMonth, error: e2 } = await supabase
      .from('providers')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .gte('approved_at', startOfMonth.toISOString())
    if (e2) throw e2

    // Average review hours: approved providers with approved_at and created_at
    const { data: approvedRows, error: e3 } = await supabase
      .from('providers')
      .select('created_at, approved_at')
      .eq('status', 'approved')
      .not('approved_at', 'is', null)
      .limit(2000)
    if (e3) throw e3

    let avgReviewHours = 0
    if (approvedRows && approvedRows.length > 0) {
      const diffs = approvedRows
        .map(r => {
          const c = r.created_at ? new Date(r.created_at).getTime() : NaN
          const a = r.approved_at ? new Date(r.approved_at).getTime() : NaN
          return isFinite(c) && isFinite(a) && a >= c ? (a - c) / (1000 * 60 * 60) : null
        })
        .filter((x): x is number => x != null)
      if (diffs.length > 0) {
        avgReviewHours = Math.round((diffs.reduce((s, v) => s + v, 0) / diffs.length) * 10) / 10
      }
    }

    return NextResponse.json({ pendingCount: pendingCount || 0, approvedThisMonth: approvedThisMonth || 0, avgReviewHours })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to fetch metrics' }, { status: 400 })
  }
}
