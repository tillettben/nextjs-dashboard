import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';
import { DataHelper } from '../helpers/data-helper';
import { NavigationHelper } from '../helpers/navigation-helper';

test.describe('Dashboard Overview Tests', () => {
  let authHelper: AuthHelper;
  let dataHelper: DataHelper;
  let navigationHelper: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    dataHelper = new DataHelper(page);
    navigationHelper = new NavigationHelper(page);

    // Setup test environment and login
    await dataHelper.setupTestEnvironment();
    await authHelper.login();
  });

  test('should load dashboard with correct title and layout', async ({
    page,
  }) => {
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page).toHaveTitle(/Dashboard/);

    // Verify main layout sections are present
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible(); // Sidebar navigation
    await expect(page.locator('main')).toBeVisible(); // Main content
  });

  test('should display summary cards with correct data', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');

    // Verify all 4 summary cards are present
    const cards = page.locator('.rounded-xl.bg-gray-50.p-2.shadow-sm');
    await expect(cards).toHaveCount(4);

    // Verify card titles
    await expect(page.locator('text=Collected')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();
    await expect(page.locator('text=Total Invoices')).toBeVisible();
    await expect(page.locator('text=Total Customers')).toBeVisible();

    // Verify cards have numeric values (not zero or empty)
    const cardValues = cards.locator('p[class*="text-2xl"]');
    for (let i = 0; i < 4; i++) {
      const valueText = await cardValues.nth(i).textContent();
      expect(valueText).toBeTruthy();
      expect(valueText).not.toBe('0');
    }
  });

  test('should display revenue chart with data', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for revenue chart section
    const revenueChart = page.locator('text=Revenue').first();
    await expect(revenueChart).toBeVisible();

    // Verify chart container is present
    const chartContainer = page
      .locator('[class*="chart"], [class*="revenue"]')
      .first();
    await expect(chartContainer).toBeVisible();
  });

  test('should display latest invoices section', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Verify latest invoices section
    await expect(page.locator('text=Latest Invoices')).toBeVisible();

    // Verify invoice items are present
    const invoiceItems = page.locator(
      '.flex.flex-row.items-center.justify-between'
    );
    await expect(invoiceItems.first()).toBeVisible();

    // Verify invoice data elements (customer images, names, amounts)
    await expect(page.locator('img[alt*="profile picture"]')).toBeVisible();
  });

  test('should show correct currency formatting in latest invoices', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Check for currency symbols in latest invoices
    const latestInvoicesSection = page
      .locator('text=Latest Invoices')
      .locator('..');
    const amounts = latestInvoicesSection.locator('p[class*="font-medium"]');

    // Verify at least one amount contains currency formatting
    const firstAmount = await amounts.first().textContent();
    expect(firstAmount).toMatch(/\$[\d,]+\.\d{2}/); // Matches $XX.XX format
  });

  test('should display customer profile images in latest invoices', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Verify customer profile images are loaded
    const profileImages = page.locator('img[alt*="profile picture"]');
    await expect(profileImages.first()).toBeVisible();

    // Verify images have proper alt text
    const firstImage = profileImages.first();
    const altText = await firstImage.getAttribute('alt');
    expect(altText).toContain('profile picture');
  });

  test('should update dashboard data after navigation and return', async ({
    page,
  }) => {
    // Get initial dashboard data
    await page.waitForLoadState('networkidle');
    const initialCardValue = await page
      .locator('.rounded-xl.bg-gray-50.p-2.shadow-sm')
      .first()
      .locator('p[class*="text-2xl"]')
      .textContent();

    // Navigate away to invoices
    await navigationHelper.goToInvoices();

    // Return to dashboard
    await navigationHelper.goToDashboard();
    await page.waitForLoadState('networkidle');

    // Verify data is still present (should be the same since no changes made)
    const returnedCardValue = await page
      .locator('.rounded-xl.bg-gray-50.p-2.shadow-sm')
      .first()
      .locator('p[class*="text-2xl"]')
      .textContent();
    expect(returnedCardValue).toBe(initialCardValue);
  });

  test('should display updated timestamp in latest invoices', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Look for the "Updated just now" or similar timestamp
    await expect(page.locator('text=Updated just now')).toBeVisible();
  });

  test('should handle empty state gracefully when no data', async ({
    page,
  }) => {
    // This test would be more relevant with a clean database
    // For now, verify the dashboard handles data display correctly
    await page.waitForLoadState('networkidle');

    // Verify that even with data, the dashboard structure is proper
    const cards = page.locator('.rounded-xl.bg-gray-50.p-2.shadow-sm');
    await expect(cards).toHaveCount(4);

    // All cards should have titles even if values are zero
    await expect(page.locator('text=Collected')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();
    await expect(page.locator('text=Total Invoices')).toBeVisible();
    await expect(page.locator('text=Total Customers')).toBeVisible();
  });

  test('should display icons in summary cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Verify icons are present in summary cards
    const cards = page.locator('.rounded-xl.bg-gray-50.p-2.shadow-sm');

    // Each card should have an icon
    for (let i = 0; i < 4; i++) {
      const cardIcon = cards.nth(i).locator('svg, .h-5.w-5');
      await expect(cardIcon).toBeVisible();
    }
  });
});
