import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';

test.describe('Dashboard Overview', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.login();
  });

  test('should access dashboard page', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should display summary cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Verify summary cards are present and have data
    await expect(page.getByTestId('card-collected')).toBeVisible();
    await expect(page.getByTestId('card-pending')).toBeVisible();
    await expect(page.getByTestId('card-invoices')).toBeVisible();
    await expect(page.getByTestId('card-customers')).toBeVisible();
  });

  test('should display revenue chart', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('revenue-chart-container')).toBeVisible();
    await expect(page.getByTestId('revenue-chart-title')).toContainText('Recent Revenue');
  });

  test('should display latest invoices', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('latest-invoices-container')).toBeVisible();
    await expect(page.getByTestId('latest-invoices-title')).toContainText('Latest Invoices');
  });
});