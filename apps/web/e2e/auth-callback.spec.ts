import { test, expect } from '@playwright/test'

test.describe('Auth callback smoke', () => {
  test('redirects to login when code is missing', async ({ page }) => {
    const resp = await page.goto('/auth/callback?next=%2Fadmin')
    // Next.js returns 307 to /login?error=auth_failed
    expect(resp?.status()).toBe(200)
    await expect(page).toHaveURL(/\/login\?error=auth_failed/)
    // The login page heading is "Welcome Back"; alternatively assert the button exists
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: /send magic link/i })).toBeVisible()
  })
})
