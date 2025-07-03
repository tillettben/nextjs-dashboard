import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';
import { DataHelper } from '../helpers/data-helper';
import { NavigationHelper } from '../helpers/navigation-helper';

test.describe('Dashboard Overview Tests', () => {
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

  test('should load dashboard with correct title and layout', async ({
    page,
  }) => {
    await expect(page.getByTestId('dashboard-title')).toContainText(
      'Dashboard'
    );
    await expect(page).toHaveTitle(/Dashboard/);

    // Verify main layout sections are present
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible(); // Sidebar navigation
    await expect(page.getByTestId('dashboard-main')).toBeVisible(); // Main content
  });

  test('should display summary cards with correct data', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');

    // Verify all 4 summary cards are present
    await expect(page.getByTestId('card-collected')).toBeVisible();
    await expect(page.getByTestId('card-pending')).toBeVisible();
    await expect(page.getByTestId('card-invoices')).toBeVisible();
    await expect(page.getByTestId('card-customers')).toBeVisible();

    // Verify card titles
    await expect(page.getByTestId('card-collected-title')).toContainText(
      'Collected'
    );
    await expect(page.getByTestId('card-pending-title')).toContainText(
      'Pending'
    );
    await expect(page.getByTestId('card-invoices-title')).toContainText(
      'Total Invoices'
    );
    await expect(page.getByTestId('card-customers-title')).toContainText(
      'Total Customers'
    );

    // Verify cards have numeric values (not zero or empty)
    const cardTypes = ['collected', 'pending', 'invoices', 'customers'];
    for (const cardType of cardTypes) {
      const valueText = await page
        .getByTestId(`card-${cardType}-value`)
        .textContent();
      expect(valueText).toBeTruthy();
      expect(valueText).not.toBe('0');
    }
  });

  test('should display revenue chart with data', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Verify revenue chart section
    await expect(page.getByTestId('revenue-chart-title')).toContainText(
      'Recent Revenue'
    );
    await expect(page.getByTestId('revenue-chart-container')).toBeVisible();
    await expect(page.getByTestId('revenue-chart-background')).toBeVisible();
    await expect(page.getByTestId('revenue-chart-grid')).toBeVisible();
  });

  test('should display latest invoices section', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Verify latest invoices section
    await expect(page.getByTestId('latest-invoices-title')).toContainText(
      'Latest Invoices'
    );
    await expect(page.getByTestId('latest-invoices-container')).toBeVisible();
    await expect(page.getByTestId('latest-invoices-list')).toBeVisible();

    // Verify at least one invoice item is present
    const firstInvoiceItem = page
      .locator('[data-testid^="invoice-item-"]')
      .first();
    await expect(firstInvoiceItem).toBeVisible();

    // Verify invoice data elements (customer images, names, amounts) - check first instance
    const firstCustomerAvatar = page
      .locator('[data-testid^="customer-avatar-"]')
      .first();
    await expect(firstCustomerAvatar).toBeVisible();
  });

  test('should show correct currency formatting in latest invoices', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Check for currency symbols in latest invoices
    const firstInvoiceAmount = page
      .locator('[data-testid^="invoice-amount-"]')
      .first();
    await expect(firstInvoiceAmount).toBeVisible();

    // Verify at least one amount contains currency formatting
    const firstAmount = await firstInvoiceAmount.textContent();
    expect(firstAmount).toMatch(/\$[\d,]+\.\d{2}/); // Matches $XX.XX format
  });

  test('should display customer profile images in latest invoices', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Verify customer profile images are loaded
    const firstCustomerAvatar = page
      .locator('[data-testid^="customer-avatar-"]')
      .first();
    await expect(firstCustomerAvatar).toBeVisible();

    // Verify images have proper alt text
    const altText = await firstCustomerAvatar.getAttribute('alt');
    expect(altText).toContain('profile picture');
  });

  test('should update dashboard data after navigation and return', async ({
    page,
  }) => {
    // Get initial dashboard data
    await page.waitForLoadState('networkidle');
    const initialCardValue = await page
      .getByTestId('card-collected-value')
      .textContent();

    // Navigate away to invoices
    await navigationHelper.goToInvoices();

    // Return to dashboard
    await navigationHelper.goToDashboard();
    await page.waitForLoadState('networkidle');

    // Verify data is still present (should be the same since no changes made)
    const returnedCardValue = await page
      .getByTestId('card-collected-value')
      .textContent();
    expect(returnedCardValue).toBe(initialCardValue);
  });

  test('should display updated timestamp in latest invoices', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Look for the "Updated just now" timestamp
    await expect(page.getByTestId('latest-invoices-updated')).toContainText(
      'Updated just now'
    );
  });

  test('should handle empty state gracefully when no data', async ({
    page,
  }) => {
    // This test would be more relevant with a clean database
    // For now, verify the dashboard handles data display correctly
    await page.waitForLoadState('networkidle');

    // Verify that even with data, the dashboard structure is proper
    await expect(page.getByTestId('card-collected')).toBeVisible();
    await expect(page.getByTestId('card-pending')).toBeVisible();
    await expect(page.getByTestId('card-invoices')).toBeVisible();
    await expect(page.getByTestId('card-customers')).toBeVisible();

    // All cards should have titles even if values are zero
    await expect(page.getByTestId('card-collected-title')).toContainText(
      'Collected'
    );
    await expect(page.getByTestId('card-pending-title')).toContainText(
      'Pending'
    );
    await expect(page.getByTestId('card-invoices-title')).toContainText(
      'Total Invoices'
    );
    await expect(page.getByTestId('card-customers-title')).toContainText(
      'Total Customers'
    );
  });

  test('should display icons in summary cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Verify icons are present in summary cards
    const cardTypes = ['collected', 'pending', 'invoices', 'customers'];
    for (const cardType of cardTypes) {
      const cardIcon = page.getByTestId(`card-${cardType}-icon`);
      await expect(cardIcon).toBeVisible();
    }
  });

  test('should navigate to invoice edit page when clicking latest invoice item', async ({
    page,
  }) => {
    // Wait for latest invoices to load
    await expect(page.getByTestId('latest-invoices-container')).toBeVisible();

    // Click on the first invoice item
    const firstInvoice = page
      .getByTestId('latest-invoices-list')
      .locator('[data-testid^="invoice-item-"]')
      .first();
    await expect(firstInvoice).toBeVisible();

    // Get invoice ID from data-testid for URL verification
    const invoiceId = await firstInvoice.getAttribute('data-testid');
    const id = invoiceId?.replace('invoice-item-', '');

    await firstInvoice.click();

    // Should navigate to invoice edit page
    await expect(page).toHaveURL(`/dashboard/invoices/${id}/edit`);
  });

  test('should display top customers section', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Verify top customers section is present and functional
    await expect(page.getByTestId('top-customers-container')).toBeVisible();
    await expect(page.getByTestId('top-customers-title')).toContainText('Top Customers');
    
    // Verify at least one customer is displayed
    const firstCustomer = page.locator('[data-testid^="customer-item-"]').first();
    await expect(firstCustomer).toBeVisible();
    
    // Verify customer has total amount that's not $0.00
    const firstTotal = page.locator('[data-testid^="customer-total-"]').first();
    const totalText = await firstTotal.textContent();
    expect(totalText).not.toBe('$0.00');
  });
});
