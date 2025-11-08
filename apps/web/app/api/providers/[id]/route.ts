import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSignedPhotoUrl } from '@/lib/storage'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const sb = getAdmin()

    // Prefer RPC if available; otherwise fallback to select by id
    let provider: any | null = null
    try {
      const { data, error } = await sb.rpc('get_provider_details', { provider_id: id })
      if (error) throw error
      const row = Array.isArray(data) ? (data?.[0] as any) : (data as any)
      const envelope = row?.get_provider_details ?? row
      provider = envelope?.provider ?? envelope
    } catch {
      const { data, error } = await sb
        .from('providers')
        .select(`
          *,
          categories:categories(code,name),
          sampradayas:sampradayas(code,name)
        `)
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      provider = data
    }

    if (!provider) {
      return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
    }

    // Sign thumbnail path if present
    let signedUrl: string | null = null
    try {
      if (provider.photo_url) {
        signedUrl = await getSignedPhotoUrl(provider.photo_url as string)
      }
    } catch {}

    const normalized = {
      ...provider,
      category: provider.categories,
      sampradaya: provider.sampradayas,
      photo_url: signedUrl || null,
    }

    return NextResponse.json({ ok: true, data: normalized })
  } catch (e) {
    console.error('API /providers/[id] error:', e)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}
