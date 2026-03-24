import { test, expect } from '@playwright/test';

test.describe('Create Playlist Wizard', () => {
  test('should start create playlist flow', async ({ page }) => {
    await page.goto('/create');

    await expect(page.locator('h1')).toContainText('Tạo Playlist Mới');
  });

  test('should display mood options', async ({ page }) => {
    await page.goto('/create');

    await expect(page.getByText('chill')).toBeVisible();
    await expect(page.getByText('happy')).toBeVisible();
    await expect(page.getByText('sad')).toBeVisible();
  });

  test('should display genre options', async ({ page }) => {
    await page.goto('/create');

    // Genres are displayed with underscores replaced by spaces
    await expect(page.getByText('vietnam')).toBeVisible();
    await expect(page.getByText('us uk')).toBeVisible();
    await expect(page.getByText('korean')).toBeVisible();
  });

  test('should select mood and genre', async ({ page }) => {
    await page.goto('/create');

    // Select mood
    await page.getByText('chill').click();
    await expect(page.getByText('chill')).toHaveClass(/bg-purple-600/);

    // Select genre
    await page.getByText('vietnam').click();
    await expect(page.getByText('vietnam')).toHaveClass(/bg-purple-600/);
  });

  test('should proceed to step 2', async ({ page }) => {
    await page.goto('/create');

    // Select mood and genre
    await page.getByText('chill').click();
    await page.getByText('vietnam').click();

    // Click next
    await page.getByText('Tiếp tục').click();

    // Should be on step 2
    await expect(page.getByText('Chọn Bài Hát')).toBeVisible();
  });

  test('should search for music', async ({ page }) => {
    await page.goto('/create');

    // Complete step 1
    await page.getByText('chill').click();
    await page.getByText('vietnam').click();
    await page.getByText('Tiếp tục').click();

    // Search for music
    await page.fill('input[placeholder="Tìm kiếm bài hát..."]', 'lofi');
    await page.getByText('Tìm kiếm').click();

    // Wait for search
    await page.waitForTimeout(2000);
  });

  test('should display song cards with royalty free badge', async ({ page }) => {
    await page.goto('/create');

    await page.getByText('chill').click();
    await page.getByText('vietnam').click();
    await page.getByText('Tiếp tục').click();

    await page.fill('input[placeholder="Tìm kiếm bài hát..."]', 'music');
    await page.getByText('Tìm kiếm').click();

    await page.waitForTimeout(3000);

    // Check for royalty free badge
    const badges = page.getByText('Miễn phí bản quyền');
    await expect(badges.first()).toBeVisible();
  });

  test('should display selected songs count', async ({ page }) => {
    await page.goto('/create');

    await page.getByText('chill').click();
    await page.getByText('vietnam').click();
    await page.getByText('Tiếp tục').click();

    // Should show "Đã chọn 0/20 bài hát"
    await expect(page.getByText(/0\/20 bài hát/)).toBeVisible();
  });

  test('should navigate back to step 1', async ({ page }) => {
    await page.goto('/create');

    await page.getByText('chill').click();
    await page.getByText('vietnam').click();
    await page.getByText('Tiếp tục').click();

    // Wait for step 2 to be visible
    await expect(page.getByText('Chọn Bài Hát')).toBeVisible();

    // Find and click the "Quay lại" button in the main navigation area
    const navContainer = page.locator('.flex.justify-between.mt-8');
    await navContainer.locator('button:has-text("Quay lại")').click();

    // Should be back to step 1 - use specific selector to avoid strict mode violation
    await expect(page.locator('h3:has-text("Chọn Mood")')).toBeVisible();
  });
});
