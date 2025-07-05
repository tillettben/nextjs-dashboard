import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';
import { NavigationHelper } from '../helpers/navigation-helper';

test.describe('Invoice CRUD Operations', () => {
  let authHelper: AuthHelper;
  let navigationHelper: NavigationHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    navigationHelper = new NavigationHelper(page);

    await authHelper.login();
  });

  test('should create new invoice', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Wait for dropdown to populate
    await page.waitForFunction(
      () => {
        const select = document.querySelector('select[name="customerId"]') as HTMLSelectElement;
        return select && select.options.length > 1;
      },
      { timeout: 10000 }
    );

    // Fill form with the first available customer
    const customerOptions = page.locator('select[name="customerId"] option');
    const firstCustomerValue = await customerOptions.nth(1).getAttribute('value');
    
    await page.selectOption('select[name="customerId"]', firstCustomerValue || '');
    await page.fill('input[name="amount"]', '299.99');
    await page.click('input[value="paid"]');

    await page.click('button:has-text("Create Invoice")');

    await expect(page).toHaveURL('/dashboard/invoices');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('tbody').locator('text=$299.99').first()).toBeVisible();
  });

  test('should edit existing invoice', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    const editButton = page.locator('tbody tr').first().locator('a[href*="/edit"]');
    await editButton.click();
    await page.waitForLoadState('networkidle');

    // Verify form is pre-populated
    const amountValue = await page.locator('input[name="amount"]').inputValue();
    expect(parseFloat(amountValue)).toBeGreaterThan(0);

    // Update amount
    await page.fill('input[name="amount"]', '777.77');
    await page.click('input[value="paid"]');
    await page.click('button:has-text("Edit Invoice")');

    await expect(page).toHaveURL('/dashboard/invoices');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('tbody').locator('text=$777.77').first()).toBeVisible();
  });

  test('should cancel form and return to invoice list', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    await page.click('a:has-text("Cancel")');
    await expect(page).toHaveURL('/dashboard/invoices');
  });
});
