import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';
import { NavigationHelper } from '../helpers/navigation-helper';

test.describe('Navigation & Routing', () => {
  let authHelper: AuthHelper;
  let navigationHelper: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    navigationHelper = new NavigationHelper(page);

    await authHelper.login();
  });

  test('should navigate between main sections', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await expect(page).toHaveURL('/dashboard/invoices');

    await navigationHelper.goToCustomers();
    await expect(page).toHaveURL('/dashboard/customers');

    await navigationHelper.goToDashboard();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should navigate via breadcrumbs', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await expect(page).toHaveURL('/dashboard/invoices/create');

    await navigationHelper.clickBreadcrumb('Invoices');
    await expect(page).toHaveURL('/dashboard/invoices');
  });

  test('should handle deep links correctly', async ({ page }) => {
    await page.goto('/dashboard/invoices');
    await expect(page.locator('h1')).toContainText('Invoices');

    await page.goto('/dashboard/customers');
    await expect(page.locator('h1')).toContainText('Customers');
  });
});
