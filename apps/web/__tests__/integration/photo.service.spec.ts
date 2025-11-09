import { describe, it, expect, beforeAll, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { uploadWithThumbnail } from '@/lib/photo'

const PHOTO_PATH = process.env.E2E_PHOTO_PATH || ''

// Simple UUID for a fake provider id for namespacing objects in storage
function fakeProviderId() {
  // Not a true UUID but sufficient for namespacing in tests
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

describe('uploadWithThumbnail service (integration)', () => {
  beforeAll(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      vi.stubGlobal('SKIP_REASON', 'Supabase env missing')
    }
    if (!PHOTO_PATH || !fs.existsSync(PHOTO_PATH)) {
      vi.stubGlobal('SKIP_REASON', 'E2E_PHOTO_PATH missing or not found')
    }
  })

  it('uploads original and thumbnail to storage', async () => {
    // Skip if preconditions are not met
    // @ts-ignore
    if (globalThis.SKIP_REASON) {
      // @ts-ignore
      return expect(true, globalThis.SKIP_REASON).toBe(true)
    }

    const providerId = fakeProviderId()

    // Construct a File from the local image
    const bytes = new Uint8Array(fs.readFileSync(PHOTO_PATH))
    const file = new File([bytes], path.basename(PHOTO_PATH), { type: 'image/png' })

    const res = await uploadWithThumbnail(file, providerId)
    expect(res.originalPath).toContain(`originals/${providerId}/`)
    expect(res.thumbnailPath).toContain(`thumbs/${providerId}/`)
    expect(res.mimeType).toMatch(/image\//)
    expect(res.sizeBytes).toBeGreaterThan(0)
  })
})
