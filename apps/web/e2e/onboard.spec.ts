import { test, expect, Response } from '@playwright/test'
import { getAdmin } from './helpers/supabase'

// E2E requires a real image file path. Provide via env var E2E_PHOTO_PATH.
// If not set, this spec will be skipped to avoid flakiness.
const PHOTO_PATH = process.env.E2E_PHOTO_PATH

// Simple helper to wait for the /api/onboard response and extract provider id
async function submitAndGetProviderId(page: any) {
  const [resp] = await Promise.all([
    page.waitForResponse((r: Response) => r.url().includes('/api/onboard') && r.request().method() === 'POST'),
    page.getByRole('button', { name: /submit profile/i }).click(),
  ])
  const json = await resp.json()
  return { status: resp.status(), body: json }
}

test.describe('Onboarding end-to-end with storage + db verification', () => {
  test.skip(!PHOTO_PATH, 'E2E_PHOTO_PATH not set; skipping storage-backed onboarding test')

  test('submits profile, creates photo metadata, and uploads files', async ({ page }) => {
    const admin = getAdmin()

    await page.goto('/onboard')
    await expect(page.getByRole('heading', { name: /join our community/i })).toBeVisible()
    await page.waitForSelector('input[placeholder="Enter your full name"]')

    // Step 1 (labels are not programmatically associated; use placeholders)
    await page.locator('input[placeholder="Enter your full name"]').fill(`E2E Tester ${Date.now()}`)
    await page.getByPlaceholder('+91 98765 43210').first().fill('+91 99999 99999')
    await page.getByRole('button', { name: /next/i }).click()

    // Step 2
    const categorySelect = page.getByTestId('category-select')
    await categorySelect.waitFor({ state: 'visible' })
    await categorySelect.selectOption('purohit')
    await page.getByTestId('lang-kannada').check()
    await page.getByRole('button', { name: /next/i }).click()

    // Step 3 - photo + terms
    const input = page.locator('#photo-upload')
    await input.setInputFiles(PHOTO_PATH!)
    await page.locator('input[type="checkbox"]').check()

    const { status, body } = await submitAndGetProviderId(page)
    if (status !== 200) {
      // eslint-disable-next-line no-console
      console.log('Onboard API failure', { status, body })
    }
    expect(status).toBe(200)
    expect(body?.ok).toBe(true)
    const providerId = body?.id as string
    expect(providerId).toBeTruthy()

    // Confirm success UI
    await expect(page.getByText(/submitted for review/i)).toBeVisible()

    // DB: provider_photos has a row
    const { data: photos, error: photosErr } = await admin
      .from('provider_photos')
      .select('*')
      .eq('provider_id', providerId)
    expect(photosErr).toBeNull()
    expect(Array.isArray(photos)).toBe(true)
    expect((photos || []).length).toBeGreaterThan(0)

    const photo = (photos || [])[0]
    expect(photo.thumbnail_path).toBeTruthy()

    // Provider row exists implicitly from success; thumbnail verified via provider_photos + storage

    // Storage: list thumbnails folder for provider
    const prefix = photo.thumbnail_path.split('/').slice(0, 2).join('/') // thumbs/{providerId}
    const { data: list, error: listErr } = await admin.storage
      .from('provider-photos')
      .list(prefix)
    expect(listErr).toBeNull()
    expect(Array.isArray(list)).toBe(true)
    expect((list || []).length).toBeGreaterThan(0)
  })
})
