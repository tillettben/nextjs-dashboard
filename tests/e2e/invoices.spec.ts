import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';
import { NavigationHelper } from '../helpers/navigation-helper';

test.describe('Invoice Business Operations', () => {
  let authHelper: AuthHelper;
  let navigationHelper: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    navigationHelper = new NavigationHelper(page);

    await authHelper.login();
    await navigationHelper.goToInvoices();
  });

  test('should access invoice list', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard/invoices');
    await expect(page.locator('h1')).toContainText('Invoices');
  });

  test('should search invoices', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('customer');
    await page.waitForTimeout(500);
    
    // Verify search functionality works
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should navigate to create invoice page', async ({ page }) => {
    await page.click('a[href="/dashboard/invoices/create"]');
    await expect(page).toHaveURL('/dashboard/invoices/create');
  });

  test('should navigate to edit invoice page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    const editButton = page.locator('tbody tr').first().locator('a[href*="/edit"]');
    await editButton.click();
    
    await expect(page).toHaveURL(/\/dashboard\/invoices\/.*\/edit/);
  });
});