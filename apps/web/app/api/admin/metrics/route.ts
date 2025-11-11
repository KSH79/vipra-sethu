import { NextRequest, NextResponse } from 'next/server'

// Minimal metrics endpoint to unblock Admin Dashboard UI
export async function GET(_req: NextRequest) {
  try {
    // TODO: Replace with real aggregation from Supabase once available
    return NextResponse.json({ pendingCount: 0, approvedThisMonth: 0, avgReviewHours: 0 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to fetch metrics' }, { status: 400 })
  }
}
