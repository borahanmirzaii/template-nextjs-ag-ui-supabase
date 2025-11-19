import { test, expect } from '@playwright/test'

test.describe('Knowledge Base', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/knowledge-base')
    await page.waitForLoadState('networkidle')
  })

  test('should display knowledge base interface', async ({ page }) => {
    // Check for main elements
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should have search functionality', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Ask"]').or(page.locator('input[placeholder*="Search"]'))
    await expect(searchInput.first()).toBeVisible()
  })

  test('should display tabs for chat and search', async ({ page }) => {
    // Check for tab navigation
    const tabs = page.locator('[role="tablist"]').or(page.locator('button:has-text("Chat")'))
    await expect(tabs.first()).toBeVisible()
  })
})

