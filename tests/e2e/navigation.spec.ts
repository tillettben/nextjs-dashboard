import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';
import { NavigationHelper } from '../helpers/navigation-helper';
import { DataHelper } from '../helpers/data-helper';

test.describe('Navigation & Layout Tests', () => {
  let authHelper: AuthHelper;
  let navigationHelper: NavigationHelper;
  let dataHelper: DataHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    navigationHelper = new NavigationHelper(page);
    dataHelper = new DataHelper(page);

    // Setup test environment
    await dataHelper.setupTestEnvironment();
    await authHelper.login();
  });

  test('should display sidebar navigation correctly', async ({ page }) => {
    // Verify all main navigation links are present
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible();
    await expect(page.locator('a[href="/dashboard/invoices"]')).toBeVisible();
    await expect(page.locator('a[href="/dashboard/customers"]')).toBeVisible();

    // Verify navigation link text
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Invoices')).toBeVisible();
    await expect(page.locator('text=Customers')).toBeVisible();
  });

  test('should navigate between main sections correctly', async ({ page }) => {
    // Test navigation to Invoices
    await navigationHelper.goToInvoices();
    await navigationHelper.verifyActiveNavLink('Invoices');

    // Test navigation to Customers
    await navigationHelper.goToCustomers();
    await navigationHelper.verifyActiveNavLink('Customers');

    // Test navigation back to Dashboard
    await navigationHelper.goToDashboard();
    await navigationHelper.verifyActiveNavLink('Home');
  });

  test('should highlight active navigation link', async ({ page }) => {
    // Dashboard should be active initially
    await navigationHelper.verifyActiveNavLink('Home');

    // Navigate to invoices and verify active state
    await navigationHelper.goToInvoices();
    const activeInvoicesLink = page.locator(
      'a[href="/dashboard/invoices"].bg-sky-100.text-blue-600'
    );
    await expect(activeInvoicesLink).toBeVisible();

    // Navigate to customers and verify active state
    await navigationHelper.goToCustomers();
    const activeCustomersLink = page.locator(
      'a[href="/dashboard/customers"].bg-sky-100.text-blue-600'
    );
    await expect(activeCustomersLink).toBeVisible();
  });

  test('should update page titles correctly', async ({ page }) => {
    // Dashboard title
    await navigationHelper.verifyPageTitle('Dashboard');

    // Invoices title
    await navigationHelper.goToInvoices();
    await navigationHelper.verifyPageTitle('Invoices');

    // Customers title
    await navigationHelper.goToCustomers();
    await navigationHelper.verifyPageTitle('Customers');
  });

  test('should display breadcrumbs in invoice forms', async ({ page }) => {
    await navigationHelper.goToInvoices();

    // Go to create invoice page
    await page.click('a[href="/dashboard/invoices/create"]');
    await expect(page).toHaveURL('/dashboard/invoices/create');

    // Verify breadcrumbs
    await navigationHelper.verifyBreadcrumbPath(['Invoices', 'Create Invoice']);

    // Test breadcrumb navigation
    await navigationHelper.clickBreadcrumb('Invoices');
    await expect(page).toHaveURL('/dashboard/invoices');
  });

  test('should maintain layout consistency across pages', async ({ page }) => {
    const pages = [
      { path: '/dashboard', title: 'Dashboard' },
      { path: '/dashboard/invoices', title: 'Invoices' },
      { path: '/dashboard/customers', title: 'Customers' },
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.path);

      // Verify consistent layout elements
      await expect(page.locator('a[href="/dashboard"]')).toBeVisible(); // Sidebar navigation
      await expect(page.locator('h1')).toContainText(pageInfo.title); // Page title
      await expect(page.locator('.flex-grow')).toBeVisible(); // Main content area
    }
  });

  test('should handle logo/home navigation', async ({ page }) => {
    // Navigate away from dashboard
    await navigationHelper.goToInvoices();

    // Click logo or dashboard link to return home
    await page.click('a[href="/dashboard"]');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should display sign out button and functionality', async ({ page }) => {
    // Look for sign out functionality in the UI
    const signOutButton = page.locator(
      'button:has-text("Sign Out"), form button:has-text("Sign Out")'
    );
    await expect(signOutButton).toBeVisible();

    // Click sign out
    await signOutButton.click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should handle deep linking and direct URL access', async ({ page }) => {
    // Test direct access to various routes
    await page.goto('/dashboard/invoices');
    await expect(page.locator('h1')).toContainText('Invoices');
    await navigationHelper.verifyActiveNavLink('Invoices');

    await page.goto('/dashboard/customers');
    await expect(page.locator('h1')).toContainText('Customers');
    await navigationHelper.verifyActiveNavLink('Customers');

    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
    await navigationHelper.verifyActiveNavLink('Home');
  });
});
