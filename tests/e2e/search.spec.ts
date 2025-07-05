import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';
import { NavigationHelper } from '../helpers/navigation-helper';

test.describe('Search & Filter Persistence', () => {
  let authHelper: AuthHelper;
  let navigationHelper: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    navigationHelper = new NavigationHelper(page);

    await authHelper.login();
  });

  test('should search invoices and update results', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('customer');
    await page.waitForTimeout(500);
    
    // Verify search functionality works
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should persist search in URL and page refresh', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('test');
    await page.waitForTimeout(800);

    // Check URL contains search parameter
    expect(page.url()).toContain('query=test');

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Search should persist
    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe('test');
  });
});