import { NextRequest, NextResponse } from 'next/server'

// Minimal stub to unblock Admin Dashboard list
export async function GET(req: NextRequest) {
  try {
    // Accept query params to mirror expected interface
    const _status = req.nextUrl.searchParams.get('status') || 'pending_review'
    const _category = req.nextUrl.searchParams.get('category') || ''
    const _search = req.nextUrl.searchParams.get('search') || ''
    const page = Number(req.nextUrl.searchParams.get('page') || '1')
    const pageSize = Number(req.nextUrl.searchParams.get('pageSize') || '10')

    // TODO: Replace with real DB query
    const providers: any[] = []
    const total = 0

    return NextResponse.json({ providers, total, page, pageSize })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to fetch providers' }, { status: 400 })
  }
}
