import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';
import { DataHelper } from '../helpers/data-helper';
import { NavigationHelper } from '../helpers/navigation-helper';

test.describe('Form Handling Tests', () => {
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

  test('should validate required customer field in create form', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Fill amount and status but leave customer empty
    await page.fill('input[name="amount"]', '100.00');
    await page.click('input[value="pending"]');

    // Submit form
    await page.click('button:has-text("Create Invoice")');

    // Should show customer validation error
    await expect(page.locator('text=Please select a customer')).toBeVisible();

    // Should remain on create page
    await expect(page).toHaveURL('/dashboard/invoices/create');
  });

  test('should validate required amount field in create form', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Select customer and status but leave amount empty
    await page.selectOption(
      'select[name="customerId"]',
      dataHelper.getTestCustomerId(0)
    );
    await page.click('input[value="pending"]');

    // Submit form
    await page.click('button:has-text("Create Invoice")');

    // Should show amount validation error
    await expect(
      page.locator('text=Please enter an amount greater than $0')
    ).toBeVisible();

    // Should remain on create page
    await expect(page).toHaveURL('/dashboard/invoices/create');
  });

  test('should validate zero amount in create form', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Fill with zero amount
    await page.selectOption(
      'select[name="customerId"]',
      dataHelper.getTestCustomerId(0)
    );
    await page.fill('input[name="amount"]', '0');
    await page.click('input[value="pending"]');

    // Submit form
    await page.click('button:has-text("Create Invoice")');

    // Should show amount validation error
    await expect(
      page.locator('text=Please enter an amount greater than $0')
    ).toBeVisible();
  });

  test('should validate negative amount in create form', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Fill with negative amount
    await page.selectOption(
      'select[name="customerId"]',
      dataHelper.getTestCustomerId(0)
    );
    await page.fill('input[name="amount"]', '-50.00');
    await page.click('input[value="pending"]');

    // Submit form
    await page.click('button:has-text("Create Invoice")');

    // Should show amount validation error
    await expect(
      page.locator('text=Please enter an amount greater than $0')
    ).toBeVisible();
  });

  test('should validate required status field in create form', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Fill customer and amount but don't select status
    await page.selectOption(
      'select[name="customerId"]',
      dataHelper.getTestCustomerId(0)
    );
    await page.fill('input[name="amount"]', '100.00');

    // Submit form without selecting status
    await page.click('button:has-text("Create Invoice")');

    // Should show status validation error
    await expect(
      page.locator('text=Please select an invoice status')
    ).toBeVisible();
  });

  test('should successfully create invoice with valid data', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Fill all required fields
    await page.selectOption(
      'select[name="customerId"]',
      dataHelper.getTestCustomerId(0)
    );
    await page.fill('input[name="amount"]', '299.99');
    await page.click('input[value="paid"]');

    // Submit form
    await page.click('button:has-text("Create Invoice")');

    // Should redirect to invoices list
    await expect(page).toHaveURL('/dashboard/invoices');

    // Should show the new invoice
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=$299.99')).toBeVisible();
  });

  test('should accept decimal amounts in create form', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Test various decimal formats
    const amounts = ['99.99', '1000.50', '5.95', '12345.67'];

    for (const amount of amounts) {
      // Fill form
      await page.selectOption(
        'select[name="customerId"]',
        dataHelper.getTestCustomerId(0)
      );
      await page.fill('input[name="amount"]', amount);
      await page.click('input[value="pending"]');

      // Submit form
      await page.click('button:has-text("Create Invoice")');

      // Should redirect successfully
      await expect(page).toHaveURL('/dashboard/invoices');

      // Go back to create another
      if (amount !== amounts[amounts.length - 1]) {
        await page.click('a[href="/dashboard/invoices/create"]');
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('should preserve form data during validation errors', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Fill some fields but leave customer empty
    await page.fill('input[name="amount"]', '150.00');
    await page.click('input[value="paid"]');

    // Submit form
    await page.click('button:has-text("Create Invoice")');

    // Should show validation error
    await expect(page.locator('text=Please select a customer')).toBeVisible();

    // Form data should be preserved
    const amountValue = await page.locator('input[name="amount"]').inputValue();
    expect(amountValue).toBe('150.00');

    const paidStatus = await page.locator('input[value="paid"]').isChecked();
    expect(paidStatus).toBe(true);
  });

  test('should pre-populate edit form with existing invoice data', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Click first edit button
    const editButton = page.locator('a[href*="/edit"]').first();
    await editButton.click();

    await page.waitForLoadState('networkidle');

    // Verify form is pre-populated
    const customerSelect = page.locator('select[name="customerId"]');
    const selectedCustomer = await customerSelect.inputValue();
    expect(selectedCustomer).toBeTruthy();

    const amountInput = page.locator('input[name="amount"]');
    const amountValue = await amountInput.inputValue();
    expect(amountValue).toBeTruthy();
    expect(parseFloat(amountValue)).toBeGreaterThan(0);

    // Status should be selected
    const statusInputs = page.locator('input[name="status"]');
    const checkedStatus = await statusInputs.evaluateAll(inputs =>
      inputs.find(input => (input as HTMLInputElement).checked)
    );
    expect(checkedStatus).toBeTruthy();
  });

  test('should successfully update invoice with valid changes', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Click first edit button
    const editButton = page.locator('a[href*="/edit"]').first();
    await editButton.click();

    await page.waitForLoadState('networkidle');

    // Update amount
    await page.fill('input[name="amount"]', '777.77');

    // Change status to paid
    await page.click('input[value="paid"]');

    // Submit form
    await page.click('button:has-text("Edit Invoice")');

    // Should redirect to invoices list
    await expect(page).toHaveURL('/dashboard/invoices');

    // Should show updated invoice
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=$777.77')).toBeVisible();
  });

  test('should validate edit form with same rules as create form', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Click first edit button
    const editButton = page.locator('a[href*="/edit"]').first();
    await editButton.click();

    await page.waitForLoadState('networkidle');

    // Clear amount field
    await page.fill('input[name="amount"]', '');

    // Submit form
    await page.click('button:has-text("Edit Invoice")');

    // Should show validation error
    await expect(
      page.locator('text=Please enter an amount greater than $0')
    ).toBeVisible();

    // Should remain on edit page
    await expect(page).toHaveURL(/\/dashboard\/invoices\/.*\/edit/);
  });

  test('should handle customer dropdown population correctly', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Verify dropdown has customers
    const customerSelect = page.locator('select[name="customerId"]');
    const options = customerSelect.locator('option');
    const optionCount = await options.count();

    // Should have at least the placeholder option plus customers
    expect(optionCount).toBeGreaterThan(1);

    // Verify placeholder option
    const placeholderOption = options.first();
    const placeholderText = await placeholderOption.textContent();
    expect(placeholderText).toContain('Select a customer');

    // Verify customer options
    const customerOptions = options.nth(1);
    const customerText = await customerOptions.textContent();
    expect(customerText).toBeTruthy();
    expect(customerText).not.toBe('Select a customer');
  });

  test('should handle form submission with loading state', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Fill form
    await page.selectOption(
      'select[name="customerId"]',
      dataHelper.getTestCustomerId(0)
    );
    await page.fill('input[name="amount"]', '123.45');
    await page.click('input[value="pending"]');

    // Submit form and check if button is disabled during submission
    const submitButton = page.locator('button:has-text("Create Invoice")');
    await submitButton.click();

    // Button might be disabled during submission (optional feature)
    // This is good UX but not required, so we don't assert it

    // Should eventually redirect
    await expect(page).toHaveURL('/dashboard/invoices');
  });

  test('should cancel form and return to invoice list', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Fill some data
    await page.fill('input[name="amount"]', '100.00');

    // Click cancel
    await page.click('a:has-text("Cancel")');

    // Should return to invoices list
    await expect(page).toHaveURL('/dashboard/invoices');
    await expect(page.locator('h1')).toContainText('Invoices');
  });

  test('should handle large amount values', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Test large amount
    await page.selectOption(
      'select[name="customerId"]',
      dataHelper.getTestCustomerId(0)
    );
    await page.fill('input[name="amount"]', '999999.99');
    await page.click('input[value="pending"]');

    // Submit form
    await page.click('button:has-text("Create Invoice")');

    // Should handle successfully
    await expect(page).toHaveURL('/dashboard/invoices');
  });

  test('should handle form with special amount formats', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Test amount with many decimal places (should be handled by step="0.01")
    await page.selectOption(
      'select[name="customerId"]',
      dataHelper.getTestCustomerId(0)
    );
    await page.fill('input[name="amount"]', '99.999');
    await page.click('input[value="pending"]');

    // Submit form
    await page.click('button:has-text("Create Invoice")');

    // Should handle and likely round to 2 decimal places
    await expect(page).toHaveURL('/dashboard/invoices');
  });

  test('should display proper error messages for multiple validation failures', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Submit empty form
    await page.click('button:has-text("Create Invoice")');

    // Should show all validation errors
    await expect(page.locator('text=Please select a customer')).toBeVisible();
    await expect(
      page.locator('text=Please enter an amount greater than $0')
    ).toBeVisible();
    await expect(
      page.locator('text=Please select an invoice status')
    ).toBeVisible();

    // Should also show general error message
    await expect(
      page.locator('text=Missing Fields. Failed to Create Invoice')
    ).toBeVisible();
  });

  test('should maintain form state when switching between status options', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Fill customer and amount
    await page.selectOption(
      'select[name="customerId"]',
      dataHelper.getTestCustomerId(0)
    );
    await page.fill('input[name="amount"]', '50.00');

    // Select pending
    await page.click('input[value="pending"]');

    // Switch to paid
    await page.click('input[value="paid"]');

    // Verify other form data is preserved
    const customerValue = await page
      .locator('select[name="customerId"]')
      .inputValue();
    expect(customerValue).toBe(dataHelper.getTestCustomerId(0));

    const amountValue = await page.locator('input[name="amount"]').inputValue();
    expect(amountValue).toBe('50.00');

    // Verify paid is selected
    const paidChecked = await page.locator('input[value="paid"]').isChecked();
    expect(paidChecked).toBe(true);
  });
});
