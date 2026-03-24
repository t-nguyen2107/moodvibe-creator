import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('Tạo Playlist Nhạc Của Bạn');
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for navigation links using text content
    await expect(page.locator('a:has-text("Thư viện")').first()).toBeVisible();
    await expect(page.locator('a:has-text("Cài đặt")').first()).toBeVisible();
  });

  test('should have create playlist button', async ({ page }) => {
    await page.goto('/');

    const createButton = page.getByText('Tạo Playlist Mới');
    await expect(createButton).toBeVisible();
  });

  test('should navigate to create page', async ({ page }) => {
    await page.goto('/');

    await page.getByText('Tạo Playlist Mới').click();
    await expect(page).toHaveURL(/\/create/);
    await expect(page.locator('h1')).toContainText('Tạo Playlist Mới');
  });

  test('should navigate to library page', async ({ page }) => {
    await page.goto('/');

    await page.getByText('Xem Thư Viện').click();
    await expect(page).toHaveURL(/\/library/);
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Multi-Source Search')).toBeVisible();
    await expect(page.getByText('AI Generated Covers')).toBeVisible();
    await expect(page.getByText('Easy Upload')).toBeVisible();
  });
});
