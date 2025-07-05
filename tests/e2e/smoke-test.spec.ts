import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';

test.describe('Application Smoke Test', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('should complete full application smoke test', async ({ page }) => {
    // Login
    await authHelper.login();
    await expect(page).toHaveURL('/dashboard');

    // Dashboard loads
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.getByTestId('card-collected')).toBeVisible();

    // Invoices page loads
    await page.click('a[href="/dashboard/invoices"]');
    await expect(page).toHaveURL('/dashboard/invoices');
    await expect(page.locator('h1')).toContainText('Invoices');

    // Customers page loads  
    await page.click('a[href="/dashboard/customers"]');
    await expect(page).toHaveURL('/dashboard/customers');
    await expect(page.locator('h1')).toContainText('Customers');

    // Create invoice form loads
    await page.click('a[href="/dashboard/invoices"]');
    await page.click('a[href="/dashboard/invoices/create"]');
    await expect(page).toHaveURL('/dashboard/invoices/create');
    await expect(page.locator('select[name="customerId"]')).toBeVisible();
  });
});