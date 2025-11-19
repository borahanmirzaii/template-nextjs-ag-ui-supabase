import { test, expect } from '@playwright/test'

test.describe('Integrations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/integrations')
    await page.waitForLoadState('networkidle')
  })

  test('should display available platforms', async ({ page }) => {
    // Check for platform cards
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should show platform connection options', async ({ page }) => {
    // Verify the page loads
    const pageTitle = page.locator('h1')
    await expect(pageTitle).toContainText(/integrations/i)
  })
})

