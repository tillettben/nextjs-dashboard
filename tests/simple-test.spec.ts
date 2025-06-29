import { test, expect } from '@playwright/test';

test.describe('Basic Application Tests', () => {
  test('should load login page and navigate to dashboard', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Verify login page loads
    await expect(page).toHaveTitle(/Login/);
    await expect(page.locator('h1')).toContainText('Please log in to continue');

    // Fill in credentials
    await page.fill('input[name="email"]', 'user@nextmail.com');
    await page.fill('input[name="password"]', '123456');

    // Click login button
    await page.click('button:has-text("Log in")');

    // Verify navigation to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should navigate to customers page', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@nextmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button:has-text("Log in")');
    await page.waitForURL('/dashboard');

    // Navigate to customers
    await page.click('text=Customers');
    await expect(page).toHaveURL('/dashboard/customers');
    await expect(page.locator('h1')).toContainText('Customers');
  });

  test('should have customer cards with links', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@nextmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button:has-text("Log in")');
    await page.waitForURL('/dashboard');

    // Navigate to customers
    await page.goto('/dashboard/customers');

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Check if customer links exist
    const customerLinks = page.locator('a[href^="/dashboard/customers/"]');
    const linkCount = await customerLinks.count();

    console.log(`Found ${linkCount} customer links`);
    expect(linkCount).toBeGreaterThan(0);
  });
});
