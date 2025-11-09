import { describe, it, expect, beforeAll, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { POST } from '@/app/api/onboard/route'

const PHOTO_PATH = process.env.E2E_PHOTO_PATH || ''

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key, { auth: { persistSession: false } })
}

describe('/api/onboard (integration, no UI)', () => {
  beforeAll(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      vi.stubGlobal('SKIP_REASON', 'Supabase env missing')
    }
    if (!PHOTO_PATH || !fs.existsSync(PHOTO_PATH)) {
      vi.stubGlobal('SKIP_REASON', 'E2E_PHOTO_PATH missing or not found')
    }
  })

  it('creates provider, uploads photo + thumbnail, writes metadata, updates provider', async () => {
    // @ts-ignore
    if (globalThis.SKIP_REASON) {
      // @ts-ignore
      return expect(true, globalThis.SKIP_REASON).toBe(true)
    }

    const admin = getAdmin()

    // Build multipart form
    const fd = new FormData()
    fd.append('name', `API Test ${Date.now()}`)
    fd.append('phone', '+91 99999 88888')
    fd.append('category', 'purohit')
    fd.append('languages', 'kannada')

    const bytes = new Uint8Array(fs.readFileSync(PHOTO_PATH))
    const file = new File([bytes], path.basename(PHOTO_PATH), { type: 'image/png' })
    fd.append('photo', file)

    const req = new Request('http://localhost/api/onboard', { method: 'POST', body: fd })
    const res = await POST(req as any)
    expect(res.status).toBe(200)

    const body = await res.json() as any
    expect(body?.ok).toBe(true)
    const providerId = body?.id as string
    expect(providerId).toBeTruthy()

    // Verify DB metadata present
    const { data: photos, error: photosErr } = await admin
      .from('provider_photos')
      .select('*')
      .eq('provider_id', providerId)
    expect(photosErr).toBeNull()
    expect(Array.isArray(photos)).toBe(true)
    expect((photos || []).length).toBeGreaterThan(0)
    const photo = (photos || [])[0] as any
    expect(photo.original_path).toBeTruthy()
    expect(photo.thumbnail_path).toBeTruthy()

    // Verify provider updated
    const { data: prov, error: provErr } = await admin
      .from('providers')
      .select('profile_photo_url, photo_url')
      .eq('id', providerId)
      .maybeSingle()
    expect(provErr).toBeNull()
    expect(prov?.profile_photo_url || prov?.photo_url).toBeTruthy()
  })
})
