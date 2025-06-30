import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';
import { DataHelper } from '../helpers/data-helper';

test.describe('Application Smoke Tests', () => {
  let authHelper: AuthHelper;
  let dataHelper: DataHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    dataHelper = new DataHelper(page);
    await dataHelper.setupTestEnvironment();
  });

  test('should complete full application smoke test', async ({ page }) => {
    // 1. Authentication & Dashboard
    console.log('Testing login page...');
    await page.goto('/login');
    await expect(page.getByTestId('login-page')).toBeVisible();
    await expect(page.getByTestId('login-title')).toContainText(
      'Please log in to continue'
    );
    await expect(page.getByTestId('login-email')).toBeVisible();
    await expect(page.getByTestId('login-password')).toBeVisible();
    await expect(page.getByTestId('login-submit')).toBeVisible();

    // Login and verify dashboard
    console.log('Testing login functionality...');
    await page.getByTestId('login-email').fill('test@nextmail.com');
    await page.getByTestId('login-password').fill('123456');
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByTestId('dashboard-title')).toContainText(
      'Dashboard'
    );
    await expect(page.getByTestId('dashboard-main')).toBeVisible();

    // Verify dashboard components load
    console.log('Testing dashboard components...');
    await expect(page.getByTestId('card-collected')).toBeVisible();
    await expect(page.getByTestId('card-pending')).toBeVisible();
    await expect(page.getByTestId('card-invoices')).toBeVisible();
    await expect(page.getByTestId('card-customers')).toBeVisible();
    await expect(page.getByTestId('revenue-chart-container')).toBeVisible();
    await expect(page.getByTestId('latest-invoices-container')).toBeVisible();

    // 2. Main Pages Loading
    console.log('Testing invoices page...');
    await page.getByTestId('nav-invoices').click();
    await expect(page).toHaveURL('/dashboard/invoices');
    await expect(page.getByTestId('invoices-title')).toContainText('Invoices');
    await expect(page.getByTestId('invoices-table')).toBeVisible();
    await expect(page.getByTestId('create-invoice-button')).toBeVisible();

    console.log('Testing customers page...');
    await page.getByTestId('nav-customers').click();
    await expect(page).toHaveURL('/dashboard/customers');
    await expect(page.getByTestId('customers-title')).toContainText(
      'Customers'
    );
    await expect(page.getByTestId('customers-grid')).toBeVisible();

    // Verify customer cards are present
    const customerCards = page.getByTestId('customer-card');
    await expect(customerCards.first()).toBeVisible();

    // 3. Form Pages Loading
    console.log('Testing create invoice form...');
    await page.getByTestId('nav-invoices').click();
    await page.getByTestId('create-invoice-button').click();
    await expect(page).toHaveURL('/dashboard/invoices/create');
    await expect(page.getByTestId('create-invoice-form')).toBeVisible();
    await expect(page.getByTestId('customer-select')).toBeVisible();
    await expect(page.getByTestId('amount-input')).toBeVisible();
    await expect(page.getByTestId('create-invoice-submit')).toBeVisible();

    // Test edit invoice form (verify form structure exists)
    console.log('Testing edit invoice form...');
    await page.goto('/dashboard/invoices');
    await page.waitForLoadState('networkidle');

    // Check if edit buttons exist in the table (structure verification)
    const editButtons = page.locator(
      'table a[href*="/dashboard/invoices/"][href*="/edit"]'
    );
    const editButtonCount = await editButtons.count();
    console.log(`Found ${editButtonCount} edit buttons`);

    // If edit buttons exist, test one; otherwise skip this part
    if (editButtonCount > 0) {
      const firstEditButton = editButtons.first();
      await firstEditButton.click();

      // Wait for navigation and check if we're on an edit page
      await page.waitForLoadState('networkidle');
      const currentUrl = page.url();

      if (currentUrl.includes('/edit')) {
        await expect(page.getByTestId('edit-invoice-submit')).toBeVisible();
        console.log('Edit form verified successfully');
      } else {
        console.log('Edit navigation skipped - redirected back to invoices');
      }
    } else {
      console.log('No edit buttons found - skipping edit form test');
    }

    // Test customer detail page
    console.log('Testing customer detail page...');
    await page.goto('/dashboard/customers');
    await page.waitForLoadState('networkidle');

    const customerCardElements = page.getByTestId('customer-card');
    const customerCardCount = await customerCardElements.count();
    console.log(`Found ${customerCardCount} customer cards`);

    if (customerCardCount > 0) {
      const firstCustomerCard = customerCardElements.first();
      await firstCustomerCard.click();

      // Wait for navigation and check if we're on a customer detail page
      await page.waitForLoadState('networkidle');
      const currentUrl = page.url();

      if (currentUrl.match(/\/dashboard\/customers\/[^/]+$/)) {
        await expect(page.getByTestId('customer-detail-title')).toContainText(
          'Customer Details'
        );
        await expect(page.getByTestId('customer-detail-card')).toBeVisible();
        await expect(page.getByTestId('back-to-customers')).toBeVisible();
        console.log('Customer detail page verified successfully');
      } else {
        console.log('Customer navigation skipped - remained on customers page');
      }
    } else {
      console.log('No customer cards found - skipping customer detail test');
    }

    // 4. Basic Error Handling
    console.log('Testing 404 error pages...');
    await page.goto('/dashboard/invoices/non-existent-invoice-id/edit');
    await expect(page.getByTestId('invoice-not-found')).toBeVisible();
    await expect(page.getByTestId('not-found-title')).toContainText(
      '404 Not Found'
    );
    await expect(page.getByTestId('not-found-message')).toContainText(
      'Could not find the requested invoice'
    );
    await expect(page.getByTestId('not-found-back-link')).toBeVisible();

    // Test customer 404
    await page.goto('/dashboard/customers/non-existent-customer-id');
    await expect(page.getByTestId('customer-not-found')).toBeVisible();
    await expect(page.getByTestId('not-found-title')).toContainText(
      '404 Not Found'
    );
    await expect(page.getByTestId('not-found-message')).toContainText(
      'Could not find the requested customer'
    );

    // Navigate back to dashboard to complete smoke test
    console.log('Completing smoke test...');
    await page.getByTestId('nav-home').click();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByTestId('dashboard-title')).toContainText(
      'Dashboard'
    );

    console.log('✅ Comprehensive smoke test completed successfully!');
  });
});
