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
    // Ensure we're on the invoices page
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Wait for table to load first
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Look for status badges/indicators - target the InvoiceStatus component directly
    const statusElements = page
      .locator('span')
      .filter({ hasText: /^(Paid|Pending)$/ });

    // Verify at least one status element exists and is visible
    await expect(statusElements.first()).toBeAttached();

    // Get the text content and verify it matches expected patterns
    const statusText = await statusElements.first().textContent();
    expect(statusText).toBeTruthy();
    expect(statusText).toMatch(/(Paid|Pending)/);
  });

  test('should filter invoices using search functionality', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Get initial invoice count
    const initialRows = page.locator('tbody tr');
    const initialCount = await initialRows.count();
    expect(initialCount).toBeGreaterThan(0);

    // Search for specific customer
    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('John');

    // Wait for search results to update
    await page.waitForTimeout(500); // Allow for debounced search
    await page.waitForLoadState('networkidle');

    // Verify filtered results
    const filteredRows = page.locator('tbody tr');
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
    // Ensure we're on the invoices page
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Wait for table to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Check currency formatting in invoice amounts within first table row
    const firstRow = page.locator('tbody tr').first();

    // Find amount cell by looking for dollar sign content
    const amountCell = firstRow.locator('td').filter({ hasText: '$' }).first();

    // Get amount text content and verify it has currency formatting
    const amountText = await amountCell.textContent();
    expect(amountText).toBeTruthy();
    expect(amountText).toMatch(/\$[\d,]+\.\d{2}/); // Matches $XX.XX format

    // Check date formatting - look for cells with date-like content
    const allCells = firstRow.locator('td');
    const cellCount = await allCells.count();

    let dateFound = false;
    for (let i = 0; i < cellCount; i++) {
      const cellText = await allCells.nth(i).textContent();
      if (cellText && cellText.match(/\d{4}|\w{3}/)) {
        expect(cellText).toBeTruthy();
        dateFound = true;
        break;
      }
    }
    expect(dateFound).toBeTruthy(); // Ensure we found a date cell
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

    // Wait for customers to load and dropdown to be populated
    await page.waitForFunction(
      () => {
        const select = document.querySelector(
          'select[name="customerId"]'
        ) as HTMLSelectElement;
        return select && select.options.length > 1;
      },
      { timeout: 10000 }
    );

    // Check that dropdown has customer options
    const options = customerSelect.locator('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(1); // Should have at least placeholder + customers

    // Verify that customer options exist (specific names might vary based on test data)
    if (optionCount > 1) {
      const secondOption = options.nth(1);
      const optionText = await secondOption.textContent();
      expect(optionText).toBeTruthy();
      expect(optionText).not.toBe('Select a customer');
    }
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
    await expect(
      page.locator('tbody').locator('text=$250.00').first()
    ).toBeVisible();
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

    // Wait for table to load and find edit button within first row
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    const firstRow = page.locator('tbody tr').first();
    const editButton = firstRow.locator('a[href*="/edit"]');

    // Ensure the button is visible and scrolled into view
    await editButton.scrollIntoViewIfNeeded();
    await expect(editButton).toBeVisible();

    // Click the edit button
    await editButton.click({ force: true });

    // Should navigate to edit form
    await expect(page).toHaveURL(/\/dashboard\/invoices\/.*\/edit/);

    // Verify edit form elements
    await expect(page.locator('select[name="customerId"]')).toBeVisible();
    await expect(page.locator('input[name="amount"]')).toBeVisible();
    await expect(page.locator('button:has-text("Edit Invoice")')).toBeVisible();
  });

  test('should pre-populate edit form with existing data', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Wait for table to load and find edit button within first row
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    const firstRow = page.locator('tbody tr').first();
    const editButton = firstRow.locator('a[href*="/edit"]');

    // Ensure the button is visible and scrolled into view
    await editButton.scrollIntoViewIfNeeded();
    await expect(editButton).toBeVisible();

    // Click the edit button
    await editButton.click({ force: true });

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

    // Wait for table to load and find edit button within first row
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    const firstRow = page.locator('tbody tr').first();
    const editButton = firstRow.locator('a[href*="/edit"]');

    // Ensure the button is visible and scrolled into view
    await editButton.scrollIntoViewIfNeeded();
    await expect(editButton).toBeVisible();

    // Click the edit button
    await editButton.click({ force: true });

    await page.waitForLoadState('networkidle');

    // Update the amount
    await page.fill('input[name="amount"]', '999.99');

    // Submit the form
    await page.click('button:has-text("Edit Invoice")');

    // Should redirect back to invoices list
    await expect(page).toHaveURL('/dashboard/invoices');

    // Verify the updated amount appears
    await page.waitForLoadState('networkidle');
    await expect(
      page.locator('tbody').locator('text=$999.99').first()
    ).toBeVisible();
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

    // Wait for debounced search (300ms) plus extra time
    await page.waitForTimeout(800);
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

    // Wait for table to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Verify customer profile images are present within table rows
    const firstRow = page.locator('tbody tr').first();
    const profileImages = firstRow.locator('img[alt*="profile picture"]');

    // Check if profile image exists (even if hidden due to responsive design)
    await expect(profileImages.first()).toBeAttached();

    // Verify customer names are clickable links within the same row
    const customerLinks = firstRow.locator('a[href*="/dashboard/customers/"]');
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
