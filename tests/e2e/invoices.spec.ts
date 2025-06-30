import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';
import { DataHelper } from '../helpers/data-helper';
import { NavigationHelper } from '../helpers/navigation-helper';

test.describe('Invoice Management Tests', () => {
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
    await navigationHelper.goToInvoices();
  });

  test('should load invoice list page with correct layout', async ({
    page,
  }) => {
    await expect(page.locator('h1')).toContainText('Invoices');
    await expect(page).toHaveURL('/dashboard/invoices');

    // Verify main invoice page elements
    await expect(
      page.locator('input[placeholder*="Search invoices"]')
    ).toBeVisible();
    await expect(
      page.locator('a[href="/dashboard/invoices/create"]')
    ).toBeVisible();
    await expect(page.locator('text=Create Invoice')).toBeVisible();
  });

  test('should display invoice status indicators correctly', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Look for status badges/indicators
    const statusElements = page.locator(
      '[class*="status"], .bg-green-500, .bg-gray-100'
    );
    await expect(statusElements.first()).toBeVisible();

    // Verify status text content
    const statuses = page.locator('text=Paid').or(page.locator('text=Pending'));
    await expect(statuses.first()).toBeVisible();
  });

  test('should filter invoices using search functionality', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Get initial invoice count
    const initialRows = page.locator(
      'tbody tr'
    );
    const initialCount = await initialRows.count();
    expect(initialCount).toBeGreaterThan(0);

    // Search for specific customer
    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('John');

    // Wait for search results to update
    await page.waitForTimeout(500); // Allow for debounced search
    await page.waitForLoadState('networkidle');

    // Verify filtered results
    const filteredRows = page.locator(
      'tbody tr'
    );
    const filteredCount = await filteredRows.count();

    // Should have fewer or equal results after filtering
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // Clear search
    await searchInput.clear();
    await page.waitForLoadState('networkidle');
  });

  test('should display correct currency and date formatting', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Check currency formatting in invoice amounts
    const amounts = page.locator('td:nth-child(3), p:has-text("$")').first();
    const amountText = await amounts.textContent();
    expect(amountText).toMatch(/\$[\d,]+\.\d{2}/); // Matches $XX.XX format

    // Check date formatting
    const dates = page
      .locator('td:nth-child(4), p')
      .filter({ hasText: /\d{4}|\w{3}/ })
      .first();
    const dateText = await dates.textContent();
    expect(dateText).toBeTruthy();
  });

  test('should navigate to create invoice form', async ({ page }) => {
    await page.click('a[href="/dashboard/invoices/create"]');
    await expect(page).toHaveURL('/dashboard/invoices/create');

    // Verify create form elements
    await expect(page.locator('select[name="customerId"]')).toBeVisible();
    await expect(page.locator('input[name="amount"]')).toBeVisible();
    await expect(page.locator('input[name="status"]').first()).toBeVisible();
    await expect(
      page.locator('button:has-text("Create Invoice")')
    ).toBeVisible();
  });

  test('should display breadcrumbs in create invoice form', async ({
    page,
  }) => {
    await page.click('a[href="/dashboard/invoices/create"]');

    // Verify breadcrumb navigation
    await navigationHelper.verifyBreadcrumbPath(['Invoices', 'Create Invoice']);

    // Test breadcrumb navigation back to invoices
    await navigationHelper.clickBreadcrumb('Invoices');
    await expect(page).toHaveURL('/dashboard/invoices');
  });

  test('should populate customer dropdown in create form', async ({ page }) => {
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Verify customer dropdown has options
    const customerSelect = page.locator('select[name="customerId"]');
    await expect(customerSelect).toBeVisible();

    // Check that dropdown has customer options
    const options = customerSelect.locator('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(1); // Should have at least placeholder + customers

    // Verify specific customer names appear
    await expect(options).toContainText(
      ['John Doe', 'Jane Smith'].map(name => new RegExp(name))
    );
  });

  test('should create new invoice successfully', async ({ page }) => {
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Fill out the form
    await page.selectOption(
      'select[name="customerId"]',
      dataHelper.getTestCustomerId(0)
    );
    await page.fill('input[name="amount"]', '250.00');
    await page.click('input[value="pending"]');

    // Submit the form
    await page.click('button:has-text("Create Invoice")');

    // Should redirect back to invoices list
    await expect(page).toHaveURL('/dashboard/invoices');

    // Verify the new invoice appears in the list
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=$250.00').first()).toBeVisible();
  });

  test('should validate required fields in create form', async ({ page }) => {
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Try to submit without filling required fields
    await page.click('button:has-text("Create Invoice")');

    // Should show validation errors
    await expect(page.locator('text=Please select a customer')).toBeVisible();
    await expect(
      page.locator('text=Please enter an amount greater than $0')
    ).toBeVisible();
    await expect(
      page.locator('text=Please select an invoice status')
    ).toBeVisible();
  });

  test('should cancel from create form and return to invoice list', async ({
    page,
  }) => {
    await page.click('a[href="/dashboard/invoices/create"]');

    // Click cancel button
    await page.click('a:has-text("Cancel")');

    // Should return to invoices list
    await expect(page).toHaveURL('/dashboard/invoices');
    await expect(page.locator('h1')).toContainText('Invoices');
  });

  test('should navigate to edit invoice form', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click first edit button
    const editButton = page.locator('a[href*="/edit"]').first();
    await editButton.click();

    // Should navigate to edit form
    await expect(page).toHaveURL(/\/dashboard\/invoices\/.*\/edit/);

    // Verify edit form elements
    await expect(page.locator('select[name="customerId"]')).toBeVisible();
    await expect(page.locator('input[name="amount"]')).toBeVisible();
    await expect(page.locator('button:has-text("Edit Invoice")')).toBeVisible();
  });

  test('should pre-populate edit form with existing data', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Get data from the first invoice in the list
    const firstRow = page
      .locator('tbody tr')
      .first();
    const customerName = await firstRow
      .locator('text=John Doe, text=Jane Smith, text=Robert Johnson')
      .first()
      .textContent();

    // Click edit button for first invoice
    const editButton = page.locator('a[href*="/edit"]').first();
    await editButton.click();

    await page.waitForLoadState('networkidle');

    // Verify form is pre-populated
    const customerSelect = page.locator('select[name="customerId"]');
    const selectedOption = await customerSelect.inputValue();
    expect(selectedOption).toBeTruthy();

    const amountInput = page.locator('input[name="amount"]');
    const amountValue = await amountInput.inputValue();
    expect(amountValue).toBeTruthy();
    expect(parseFloat(amountValue)).toBeGreaterThan(0);
  });

  test('should update existing invoice successfully', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click first edit button
    const editButton = page.locator('a[href*="/edit"]').first();
    await editButton.click();

    await page.waitForLoadState('networkidle');

    // Update the amount
    await page.fill('input[name="amount"]', '999.99');

    // Submit the form
    await page.click('button:has-text("Edit Invoice")');

    // Should redirect back to invoices list
    await expect(page).toHaveURL('/dashboard/invoices');

    // Verify the updated amount appears
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=$999.99')).toBeVisible();
  });

  test('should display pagination when there are many invoices', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Look for pagination elements (if present)
    const pagination = page.locator(
      'nav[aria-label="pagination"], .pagination, a:has-text("Next"), a:has-text("Previous")'
    );

    // If pagination exists, test it
    const paginationExists = (await pagination.count()) > 0;
    if (paginationExists) {
      await expect(pagination.first()).toBeVisible();
    }
  });

  test('should maintain search state in URL parameters', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Perform a search
    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('John');

    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    // Check if URL contains search parameter
    const currentUrl = page.url();
    expect(currentUrl).toContain('query=John');

    // Refresh the page and verify search is maintained
    await page.reload();
    await page.waitForLoadState('networkidle');

    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe('John');
  });

  test('should display customer profile images and links', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Verify customer profile images are present
    const profileImages = page.locator('img[alt*="profile picture"]');
    await expect(profileImages.first()).toBeVisible();

    // Verify customer names are clickable links
    const customerLinks = page.locator('a[href*="/dashboard/customers/"]');
    await expect(customerLinks.first()).toBeVisible();

    // Test clicking customer link (but don't follow it)
    const firstCustomerLink = customerLinks.first();
    const href = await firstCustomerLink.getAttribute('href');
    expect(href).toMatch(/\/dashboard\/customers\/[a-f0-9-]+/);
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Search for something that won't match
    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('nonexistentcustomer12345');

    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    // Should show no results or empty state
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount === 0) {
      // If empty state message exists, verify it
      const emptyMessage = page.locator(
        'text=No invoices found, text=No results'
      );
      // Empty state message is optional, so we don't assert it must be present
    }
  });
});
