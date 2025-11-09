import { test, expect } from '@playwright/test'

// Requires an authenticated admin session and at least one provider in list
// Configure storageState in playwright config for real run

test.skip('Admin Drawer: opens, shows fields, backdrop/Escape do not close, actions clickable', async ({ page }) => {
  await page.goto('/admin')
  const view = page.getByRole('button', { name: 'View' }).first()
  await expect(view).toBeVisible()
  await view.click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeVisible()

  await page.mouse.click(10, 10)
  await expect(dialog).toBeVisible()

  await expect(dialog.getByText('WhatsApp:')).toBeVisible()
  await expect(dialog.getByText('Languages:')).toBeVisible()
  await expect(dialog.getByText('Experience:')).toBeVisible()
  await expect(dialog.getByText('About:')).toBeVisible()

  await dialog.getByRole('button', { name: 'Close' }).click()
  await expect(dialog).toBeHidden()
})
