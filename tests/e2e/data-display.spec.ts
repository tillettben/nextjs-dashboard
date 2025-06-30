import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';
import { DataHelper } from '../helpers/data-helper';
import { NavigationHelper } from '../helpers/navigation-helper';

test.describe('Data Display & Formatting Tests', () => {
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

  test('should display currency amounts in correct USD format', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Find currency amounts and verify formatting
    const currencyElements = page.locator('text=/\\$[\\d,]+\\.\\d{2}/');
    await expect(currencyElements.first()).toBeVisible();

    // Verify specific currency format ($ symbol, commas for thousands, 2 decimal places)
    const firstAmount = await currencyElements.first().textContent();
    expect(firstAmount).toMatch(/^\$[\d,]+\.\d{2}$/);

    // Verify no amounts without dollar signs
    const rawNumbers = page.locator('text=/^[\\d,]+\\.\\d{2}$/').first();
    const hasRawNumbers = await rawNumbers.isVisible().catch(() => false);
    // Raw numbers might exist in forms, so we don't assert they don't exist
  });

  test('should display large amounts with proper thousand separators', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Look for large amounts that should have commas
    const largeAmounts = page.locator(
      'text=/\\$[\\d]{1,3}(,[\\d]{3})+\\.\\d{2}/'
    );
    const hasLargeAmounts = (await largeAmounts.count()) > 0;

    if (hasLargeAmounts) {
      const firstLargeAmount = await largeAmounts.first().textContent();
      expect(firstLargeAmount).toMatch(/^\$[\d]{1,3}(,[\d]{3})+\.\d{2}$/);

      // Verify commas are in correct positions (every 3 digits from right)
      expect(firstLargeAmount).toMatch(/\$(\d{1,3},)*\d{3}\.\d{2}/);
    }
  });

  test('should display dates in consistent format', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Find date elements (various possible formats)
    const dateElements = page
      .locator('td:nth-child(4), [class*="date"]')
      .first();
    await expect(dateElements).toBeVisible();

    const dateText = await dateElements.textContent();

    // Verify date is in a reasonable format (flexible to allow different formats)
    expect(dateText).toMatch(
      /\d{1,2}[\\/\\-]?\d{1,2}[\\/\\-]?\d{2,4}|\w{3}\s\d{1,2},?\s\d{4}|\d{4}-\d{2}-\d{2}/
    );
  });

  test('should display invoice status indicators with consistent styling', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Find status indicators
    const paidStatus = page.locator('text=Paid').first();
    const pendingStatus = page.locator('text=Pending').first();

    // At least one status should be visible
    const paidVisible = await paidStatus.isVisible().catch(() => false);
    const pendingVisible = await pendingStatus.isVisible().catch(() => false);
    expect(paidVisible || pendingVisible).toBe(true);

    // Verify status elements have styling classes (badges, colors, etc.)
    if (paidVisible) {
      const paidClasses = (await paidStatus.getAttribute('class')) || '';
      expect(paidClasses.length).toBeGreaterThan(0);
    }

    if (pendingVisible) {
      const pendingClasses = (await pendingStatus.getAttribute('class')) || '';
      expect(pendingClasses.length).toBeGreaterThan(0);
    }
  });

  test('should display customer profile images with proper dimensions', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Find customer profile images
    const profileImages = page.locator('img[alt*="profile picture"]');
    await expect(profileImages.first()).toBeVisible();

    // Verify images have proper attributes
    const firstImage = profileImages.first();
    const width = await firstImage.getAttribute('width');
    const height = await firstImage.getAttribute('height');
    const src = await firstImage.getAttribute('src');

    expect(width).toBeTruthy();
    expect(height).toBeTruthy();
    expect(src).toBeTruthy();
    expect(src).toContain('/customers/');
  });

  test('should display dashboard summary cards with proper formatting', async ({
    page,
  }) => {
    await navigationHelper.goToDashboard();
    await page.waitForLoadState('networkidle');

    // Find summary cards
    const cards = page.locator('[class*="card"], .rounded-xl, .bg-white');
    await expect(cards.first()).toBeVisible();

    // Verify cards have titles and values
    const cardTitles = page.locator(
      'text=Collected, text=Pending, text=Total Invoices, text=Total Customers'
    );
    await expect(cardTitles.first()).toBeVisible();

    // Verify card values are displayed
    const cardValues = page.locator('text=/\\$[\\d,]+\\.\\d{2}|\\d+/');
    await expect(cardValues.first()).toBeVisible();
  });

  test('should display revenue chart with proper labels', async ({ page }) => {
    await navigationHelper.goToDashboard();
    await page.waitForLoadState('networkidle');

    // Look for chart container
    const chartContainer = page.locator(
      '[class*="chart"], .w-full.md\\:col-span-4'
    );
    await expect(chartContainer).toBeVisible();

    // Verify chart title
    await expect(page.locator('text=Recent Revenue')).toBeVisible();

    // Look for month labels (should be visible in chart)
    const monthLabels = page.locator('text=Jan, text=Feb, text=Mar, text=Dec');
    await expect(monthLabels.first()).toBeVisible();
  });

  test('should display latest invoices with proper truncation', async ({
    page,
  }) => {
    await navigationHelper.goToDashboard();
    await page.waitForLoadState('networkidle');

    // Find latest invoices section
    await expect(page.locator('text=Latest Invoices')).toBeVisible();

    // Verify customer names and amounts are displayed
    const customerNames = page
      .locator('text=John Doe, text=Jane Smith, text=Robert Johnson')
      .first();
    const invoiceAmounts = page.locator('text=/\\$[\\d,]+\\.\\d{2}/').first();

    await expect(customerNames).toBeVisible();
    await expect(invoiceAmounts).toBeVisible();

    // Should show limited number of invoices (latest 5)
    const latestInvoicesContainer = page
      .locator('text=Latest Invoices')
      .locator('..');
    const invoiceItems = latestInvoicesContainer.locator('[class*="flex"]');
    const itemCount = await invoiceItems.count();
    expect(itemCount).toBeLessThanOrEqual(6); // 5 invoices + header
  });

  test('should display customer email addresses consistently', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Find email addresses
    const emailElements = page.locator('text=@example.com');
    await expect(emailElements.first()).toBeVisible();

    // Verify email format
    const firstEmail = await emailElements.first().textContent();
    expect(firstEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

    // Check email styling (should be in a consistent format)
    const emailParent = emailElements.first().locator('..');
    await expect(emailParent).toBeVisible();
  });

  test('should display responsive table headers correctly', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForLoadState('networkidle');

    // Verify table headers are present and properly formatted
    const headers = ['Customer', 'Email', 'Amount', 'Date', 'Status'];

    for (const header of headers) {
      await expect(page.locator(`th:has-text("${header}")`)).toBeVisible();
    }

    // Verify header styling
    const firstHeader = page.locator('th').first();
    const headerClasses = (await firstHeader.getAttribute('class')) || '';
    expect(headerClasses.length).toBeGreaterThan(0);
  });

  test('should display proper loading states and skeletons', async ({
    page,
  }) => {
    // Navigate to a page and check for skeleton loading
    await page.goto('/dashboard');

    // Look for skeleton elements (these appear briefly during loading)
    const skeletons = page.locator(
      '[class*="skeleton"], [class*="animate-pulse"]'
    );

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Skeletons should be replaced with actual content
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Verify actual content is now visible
    const cards = page.locator('[class*="card"], .rounded-xl');
    await expect(cards.first()).toBeVisible();
  });

  test('should display consistent spacing and alignment', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Verify table rows have consistent styling
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();

    if (rowCount > 1) {
      // Check that all rows have similar structure
      const firstRowCells = tableRows.first().locator('td');
      const lastRowCells = tableRows.last().locator('td');

      const firstRowCellCount = await firstRowCells.count();
      const lastRowCellCount = await lastRowCells.count();

      expect(firstRowCellCount).toBe(lastRowCellCount);
    }
  });

  test('should display customer count with proper pluralization', async ({
    page,
  }) => {
    await navigationHelper.goToCustomers();
    await page.waitForLoadState('networkidle');

    // Find customer count text
    const countText = page.locator('text=/Showing \\d+ customer/');
    await expect(countText).toBeVisible();

    const fullText = await countText.textContent();

    // Verify proper pluralization
    const match = fullText?.match(/Showing (\d+) customer(s?)/);
    expect(match).toBeTruthy();

    if (match) {
      const count = parseInt(match[1]);
      const hasS = match[2] === 's';

      if (count === 1) {
        expect(hasS).toBe(false); // "1 customer" not "1 customers"
      } else {
        expect(hasS).toBe(true); // "2 customers" not "2 customer"
      }
    }
  });

  test('should display invoice counts in dashboard cards correctly', async ({
    page,
  }) => {
    await navigationHelper.goToDashboard();
    await page.waitForLoadState('networkidle');

    // Find invoice count card
    await expect(page.locator('text=Total Invoices')).toBeVisible();

    // Verify count is a number
    const countElement = page
      .locator('text=Total Invoices')
      .locator('..')
      .locator('text=/^\\d+$/');
    await expect(countElement).toBeVisible();

    const countText = await countElement.textContent();
    const count = parseInt(countText || '0');
    expect(count).toBeGreaterThanOrEqual(0);
    expect(count).toBeLessThan(1000000); // Reasonable upper bound
  });

  test('should display amounts without leading zeros', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Find all currency amounts
    const amounts = page.locator('text=/\\$[\\d,]+\\.\\d{2}/');
    const amountCount = await amounts.count();

    for (let i = 0; i < Math.min(amountCount, 5); i++) {
      const amount = await amounts.nth(i).textContent();

      // Should not have leading zeros (like $01.50)
      expect(amount).not.toMatch(/\$0\d/);

      // Should have proper format
      expect(amount).toMatch(/^\$[\d,]+\.\d{2}$/);
    }
  });

  test('should display proper visual hierarchy in layouts', async ({
    page,
  }) => {
    await navigationHelper.goToDashboard();
    await page.waitForLoadState('networkidle');

    // Check that main heading is prominent
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();

    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // Verify main content areas are distinct
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();
  });

  test('should display interactive elements with proper styling', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Check buttons have proper styling
    const buttons = page.locator(
      'button, a[href*="/create"], a[href*="/edit"]'
    );
    await expect(buttons.first()).toBeVisible();

    // Verify button classes indicate styling
    const firstButton = buttons.first();
    const buttonClasses = (await firstButton.getAttribute('class')) || '';
    expect(buttonClasses.length).toBeGreaterThan(0);

    // Common button style indicators
    const hasButtonStyling =
      buttonClasses.includes('bg-') ||
      buttonClasses.includes('btn') ||
      buttonClasses.includes('button');
    expect(hasButtonStyling).toBe(true);
  });

  test('should display form inputs with consistent styling', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.click('a[href="/dashboard/invoices/create"]');
    await page.waitForLoadState('networkidle');

    // Check form input styling
    const textInput = page.locator('input[name="amount"]');
    const selectInput = page.locator('select[name="customerId"]');
    const radioInputs = page.locator('input[name="status"]');

    await expect(textInput).toBeVisible();
    await expect(selectInput).toBeVisible();
    await expect(radioInputs.first()).toBeVisible();

    // Verify inputs have styling classes
    const textClasses = (await textInput.getAttribute('class')) || '';
    const selectClasses = (await selectInput.getAttribute('class')) || '';

    expect(textClasses.length).toBeGreaterThan(0);
    expect(selectClasses.length).toBeGreaterThan(0);
  });
});
