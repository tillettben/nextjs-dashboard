import { test, expect } from '@playwright/test';
import { DataHelper } from '../helpers/data-helper';
import { AuthHelper } from '../helpers/auth-helper';

test.describe('Database Seeding Tests', () => {
  let dataHelper: DataHelper;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    dataHelper = new DataHelper(page);
    authHelper = new AuthHelper(page);
  });

  test('should seed database successfully via API endpoint', async ({
    page,
  }) => {
    const response = await dataHelper.seedTestData();

    // Verify seeding response
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('message');
    expect(responseBody.message).toContain('Test database seeded successfully');
  });

  test('should be able to access seeded data through application', async ({
    page,
  }) => {
    // Seed the database
    await dataHelper.setupTestEnvironment();

    // Login to access the application
    await authHelper.login();

    // Verify dashboard loads with seeded data
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Check that summary cards show data (non-zero values)
    const cards = page.locator('.rounded-xl.bg-gray-50.p-2.shadow-sm');
    await expect(cards).toHaveCount(4);

    // Verify cards have content (indicating data was seeded)
    const cardValues = cards.locator('p[class*="text-2xl"]');
    const firstCardText = await cardValues.first().textContent();
    expect(firstCardText).not.toBe('0');
    expect(firstCardText).not.toBe('$0');
    expect(firstCardText).not.toBe('$0.00');
  });

  test('should have customers available after seeding', async ({ page }) => {
    await dataHelper.setupTestEnvironment();
    await authHelper.login();

    // Navigate to customers page
    await page.click('a[href="/dashboard/customers"]');
    await expect(page).toHaveURL('/dashboard/customers');

    // Verify customers are present
    await expect(page.locator('h1')).toContainText('Customers');

    // Wait for content to load and check for customer cards
    await page.waitForLoadState('networkidle');
    const customerCards = page.locator('[class*="Card"], .rounded-xl');
    await expect(customerCards.first()).toBeVisible();

    // Verify at least one customer name is visible
    const customerNames = page
      .locator('text=John Doe')
      .or(page.locator('text=Jane Smith'))
      .or(page.locator('text=Robert Johnson'));
    await expect(customerNames.first()).toBeVisible();
  });

  test('should have invoices available after seeding', async ({ page }) => {
    await dataHelper.setupTestEnvironment();
    await authHelper.login();

    // Navigate to invoices page
    await page.click('a[href="/dashboard/invoices"]');
    await expect(page).toHaveURL('/dashboard/invoices');

    // Verify invoices are present
    await expect(page.locator('h1')).toContainText('Invoices');

    // Wait for table/cards to load
    await page.waitForLoadState('networkidle');

    // Check for invoice data in table
    const invoiceRows = page.locator('tbody tr');
    await expect(invoiceRows.first()).toBeVisible();
  });

  test('should have revenue data available after seeding', async ({ page }) => {
    await dataHelper.setupTestEnvironment();
    await authHelper.login();

    // Verify revenue chart is present on dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Look for revenue chart elements
    await page.waitForLoadState('networkidle');

    // The revenue chart should be visible
    const revenueSection = page.locator('text=Revenue').first();
    await expect(revenueSection).toBeVisible();
  });

  test('should be idempotent - multiple seeding calls should not cause errors', async ({
    page,
  }) => {
    // Seed multiple times
    const response1 = await dataHelper.seedTestData();
    expect(response1.status()).toBe(200);

    const response2 = await dataHelper.seedTestData();
    expect(response2.status()).toBe(200);

    const response3 = await dataHelper.seedTestData();
    expect(response3.status()).toBe(200);

    // Verify data is still accessible
    await authHelper.login();
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should create users that can authenticate', async ({ page }) => {
    await dataHelper.setupTestEnvironment();

    // Verify the seeded test user can log in
    await authHelper.login('test@nextmail.com', '123456');
    await expect(page).toHaveURL('/dashboard');

    // Logout and try admin user
    await authHelper.logout();
    await authHelper.loginAsAdmin();
    await expect(page).toHaveURL('/dashboard');
  });
});
