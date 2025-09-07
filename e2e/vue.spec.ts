import { test, expect } from '@playwright/test'

// Test the actual application functionality
test('visits the app root url', async ({ page }) => {
  await page.goto('/')

  // The app should show the auth form when not authenticated
  await expect(page.locator('h2')).toHaveText('Sign In')

  // Verify the auth form elements are present
  await expect(page.locator('input[type="email"]')).toBeVisible()
  await expect(page.locator('input[type="password"]')).toBeVisible()
  await expect(page.locator('button[type="submit"]')).toBeVisible()
})
