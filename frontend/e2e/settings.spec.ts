import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test('should display settings page', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.locator('h1')).toContainText('Cài Đặt');
  });

  test('should have API key form', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.getByText('Thêm API Key Mới')).toBeVisible();
    await expect(page.getByPlaceholder('Nhập API key của bạn...')).toBeVisible();
  });

  test('should display service dropdown', async ({ page }) => {
    await page.goto('/settings');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for the service dropdown - use heading instead of label
    await expect(page.getByText('Thêm API Key Mới')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
  });

  test('should show setup instructions', async ({ page }) => {
    await page.goto('/settings');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Hướng Dẫn Lấy API Keys')).toBeVisible();

    // Use more specific selectors to avoid strict mode violations
    await expect(page.locator('h3:has-text("YouTube Data API v3")')).toBeVisible();
    await expect(page.locator('h3:has-text("TikTok API")')).toBeVisible();
    await expect(page.locator('h3:has-text("Stable Diffusion")')).toBeVisible();
  });

  test('should navigate back to home', async ({ page }) => {
    await page.goto('/settings');

    // Click on the "Thư viện" button in the header
    await page.locator('button:has-text("Thư viện")').click();

    await expect(page).toHaveURL(/\/library/);
  });
});
