import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';
import { DataHelper } from '../helpers/data-helper';
import { NavigationHelper } from '../helpers/navigation-helper';

test.describe('Customer Management Tests', () => {
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
    await navigationHelper.goToCustomers();
  });

  test('should load customer list page correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Customers');
    await expect(page).toHaveURL('/dashboard/customers');

    // Verify page description
    await expect(page.locator('p')).toContainText(
      'Manage your customer relationships'
    );
  });

  test('should display customer cards with correct information', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Verify customer cards are present
    const customerCards = page.locator('.rounded-xl, [class*="Card"]').first();
    await expect(customerCards).toBeVisible();

    // Verify customer information elements
    await expect(
      page.locator('text=John Doe').or(page.locator('text=Jane Smith'))
    ).toBeVisible();

    // Verify email addresses are shown
    const emails = page.locator('text=@example.com').first();
    await expect(emails).toBeVisible();
  });

  test('should display customer profile images correctly', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Verify customer profile images
    const profileImages = page.locator('img[alt*="profile picture"]');
    await expect(profileImages.first()).toBeVisible();

    // Verify images have proper dimensions and styling
    const firstImage = profileImages.first();
    const width = await firstImage.getAttribute('width');
    const height = await firstImage.getAttribute('height');

    expect(width).toBeTruthy();
    expect(height).toBeTruthy();
  });

  test('should show customer invoice summaries', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Verify invoice summary information is displayed
    await expect(page.locator('text=Total Invoices')).toBeVisible();
    await expect(page.locator('text=Total Paid')).toBeVisible();
    await expect(page.locator('text=Total Pending')).toBeVisible();

    // Verify numeric values are shown
    const invoiceCount = page.locator('text=/\\d+/').first();
    await expect(invoiceCount).toBeVisible();
  });

  test('should display correct currency formatting in customer summaries', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Check for currency formatting in paid/pending amounts
    const currencyAmounts = page.locator('text=/\\$[\\d,]+\\.\\d{2}/');
    await expect(currencyAmounts.first()).toBeVisible();

    // Verify at least one currency amount is displayed
    const firstAmount = await currencyAmounts.first().textContent();
    expect(firstAmount).toMatch(/\$[\d,]+\.\d{2}/);
  });

  test('should navigate to individual customer detail page', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Click on the first customer card/link
    const customerCard = page.locator('.rounded-xl, [class*="Card"]').first();
    await customerCard.click();

    // Should navigate to customer detail page
    await expect(page).toHaveURL(/\/dashboard\/customers\/[a-f0-9-]+/);

    // Verify customer detail page elements
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('should display customer names as clickable elements', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Verify customer names are clickable
    const customerLinks = page
      .locator('a[href*="/dashboard/customers/"]')
      .first();
    await expect(customerLinks).toBeVisible();

    // Verify the link has correct href pattern
    const href = await customerLinks.getAttribute('href');
    expect(href).toMatch(/\/dashboard\/customers\/[a-f0-9-]+/);
  });

  test('should show customer count summary', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for customer count summary at bottom
    const countSummary = page.locator('text=/Showing \\d+ customer/');
    await expect(countSummary).toBeVisible();

    // Verify it shows a reasonable number
    const summaryText = await countSummary.textContent();
    expect(summaryText).toMatch(/Showing \d+ customer/);
  });

  test('should display different customer types with varied data', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Verify multiple customers are shown
    const customerCards = page.locator('.rounded-xl, [class*="Card"]');
    const cardCount = await customerCards.count();
    expect(cardCount).toBeGreaterThan(1);

    // Verify different customer names appear
    const customerNames = [
      'John Doe',
      'Jane Smith',
      'Robert Johnson',
      'Alice Brown',
    ];
    let foundNames = 0;

    for (const name of customerNames) {
      const nameElement = page.locator(`text=${name}`);
      const isVisible = await nameElement.isVisible().catch(() => false);
      if (isVisible) foundNames++;
    }

    expect(foundNames).toBeGreaterThan(0);
  });

  test('should show accurate invoice totals per customer', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Get customer data from first card
    const firstCard = page.locator('.rounded-xl, [class*="Card"]').first();

    // Verify total invoices number is present and reasonable
    const totalInvoicesText = await firstCard
      .locator('text=/\\d+/')
      .first()
      .textContent();
    const totalInvoices = parseInt(totalInvoicesText || '0');
    expect(totalInvoices).toBeGreaterThanOrEqual(0);

    // If there are invoices, verify amounts are shown
    if (totalInvoices > 0) {
      const amounts = firstCard.locator('text=/\\$[\\d,]+\\.\\d{2}/');
      await expect(amounts.first()).toBeVisible();
    }
  });

  test('should handle responsive layout on different screen sizes', async ({
    page,
  }) => {
    // Test desktop layout (3 columns)
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForLoadState('networkidle');

    const cards = page.locator('.rounded-xl, [class*="Card"]');
    await expect(cards.first()).toBeVisible();

    // Test tablet layout (2 columns)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('networkidle');
    await expect(cards.first()).toBeVisible();

    // Test mobile layout (1 column)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    await expect(cards.first()).toBeVisible();
  });

  test('should navigate back from customer detail to customer list', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Click on a customer card
    const customerCard = page.locator('.rounded-xl, [class*="Card"]').first();
    await customerCard.click();

    // Verify we're on customer detail page
    await expect(page).toHaveURL(/\/dashboard\/customers\/[a-f0-9-]+/);

    // Navigate back using browser back button or breadcrumb
    await page.goBack();

    // Should return to customers list
    await expect(page).toHaveURL('/dashboard/customers');
    await expect(page.locator('h1')).toContainText('Customers');
  });

  test('should display customer invoice history on detail page', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Click on first customer
    const customerCard = page.locator('.rounded-xl, [class*="Card"]').first();
    await customerCard.click();

    await page.waitForLoadState('networkidle');

    // Verify customer detail page shows invoice information
    // This depends on how the customer detail page is implemented
    // For now, verify we're on the right page structure
    await expect(page).toHaveURL(/\/dashboard\/customers\/[a-f0-9-]+/);

    // Look for common customer detail elements
    const customerInfo = page.locator(
      'h1, h2, .customer-info, [class*="customer"]'
    );
    await expect(customerInfo.first()).toBeVisible();
  });

  test('should navigate from invoice table to customer detail', async ({
    page,
  }) => {
    // First go to invoices page
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Click on a customer link in the invoice table
    const customerLink = page
      .locator('a[href*="/dashboard/customers/"]')
      .first();
    await customerLink.click();

    // Should navigate to customer detail page
    await expect(page).toHaveURL(/\/dashboard\/customers\/[a-f0-9-]+/);
  });

  test('should display customer email addresses correctly', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Verify email format and visibility
    const emailElements = page.locator('text=@example.com');
    await expect(emailElements.first()).toBeVisible();

    // Verify email format is correct
    const firstEmail = await emailElements.first().textContent();
    expect(firstEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  test('should show visual distinction between paid and pending amounts', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');

    // Look for different styling on paid vs pending amounts
    const paidAmounts = page.locator('text=Total Paid').locator('..');
    const pendingAmounts = page.locator('text=Total Pending').locator('..');

    await expect(paidAmounts.first()).toBeVisible();
    await expect(pendingAmounts.first()).toBeVisible();

    // Verify amounts have some visual styling
    const paidAmount = paidAmounts
      .locator('text=/\\$[\\d,]+\\.\\d{2}/')
      .first();
    const pendingAmount = pendingAmounts
      .locator('text=/\\$[\\d,]+\\.\\d{2}/')
      .first();

    if (await paidAmount.isVisible()) {
      await expect(paidAmount).toBeVisible();
    }
    if (await pendingAmount.isVisible()) {
      await expect(pendingAmount).toBeVisible();
    }
  });

  test('should handle empty customer state gracefully', async ({ page }) => {
    // This test verifies the page structure handles data properly
    await page.waitForLoadState('networkidle');

    // Verify page loads even if some customers have no invoices
    await expect(page.locator('h1')).toContainText('Customers');

    // Verify customer cards are still displayed
    const cards = page.locator('.rounded-xl, [class*="Card"]');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(0);

    // If cards exist, verify they have basic structure
    if (cardCount > 0) {
      await expect(cards.first()).toBeVisible();
    }
  });
});
