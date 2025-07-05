import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';
import { NavigationHelper } from '../helpers/navigation-helper';

test.describe('Customer Management Workflow', () => {
  let authHelper: AuthHelper;
  let navigationHelper: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    navigationHelper = new NavigationHelper(page);

    await authHelper.login();
    await navigationHelper.goToCustomers();
  });

  test('should access customer list page', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard/customers');
    await expect(page.locator('h1')).toContainText('Customers');
  });

  test('should navigate to customer detail page', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const customerCard = page.locator('[data-testid="customer-card"]').first();
    await customerCard.click();

    await expect(page).toHaveURL(/\/dashboard\/customers\/[a-f0-9-]+/);
  });

  test('should navigate back from customer detail to list', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const customerCard = page.locator('[data-testid="customer-card"]').first();
    await customerCard.click();
    await expect(page).toHaveURL(/\/dashboard\/customers\/[a-f0-9-]+/);

    await page.goBack();
    await expect(page).toHaveURL('/dashboard/customers');
  });

  test('should navigate from invoice to customer detail', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    const customerLink = page
      .locator('tbody tr')
      .first()
      .locator('a[href*="/dashboard/customers/"]');
    
    await customerLink.click();
    await expect(page).toHaveURL(/\/dashboard\/customers\/[a-f0-9-]+/);
  });
});
