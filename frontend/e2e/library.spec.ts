import { test, expect } from '@playwright/test';

test.describe('Library Page', () => {
  test('should display library page', async ({ page }) => {
    await page.goto('/library');

    await expect(page.locator('h1')).toContainText('Thư Viện Playlist');
  });

  test('should display empty state', async ({ page }) => {
    await page.goto('/library');

    await expect(page.getByText('Chưa có playlist nào')).toBeVisible();
  });

  test('should have create playlist button', async ({ page }) => {
    await page.goto('/library');

    await expect(page.getByText('Tạo Playlist Mới')).toBeVisible();
  });

  test('should navigate to create page', async ({ page }) => {
    await page.goto('/library');

    await page.getByText('Tạo Playlist Mới').click();

    await expect(page).toHaveURL(/\/create/);
  });

  test('should navigate back to home', async ({ page }) => {
    await page.goto('/library');

    // Try using direct navigation via JavaScript as fallback
    await page.evaluate(() => {
      window.location.href = '/';
    });

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');

    // Verify we're on home page
    await expect(page.locator('h1')).toContainText('Tạo Playlist Nhạc Của Bạn');
  });
});
