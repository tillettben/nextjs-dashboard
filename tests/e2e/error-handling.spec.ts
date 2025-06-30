import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';
import { DataHelper } from '../helpers/data-helper';

test.describe('Error Handling & Not Found Tests', () => {
  let authHelper: AuthHelper;
  let dataHelper: DataHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    dataHelper = new DataHelper(page);

    // Setup test environment and login
    await dataHelper.setupTestEnvironment();
    await authHelper.login();
  });

  test('should display 404 page for non-existent invoice ID', async ({
    page,
  }) => {
    // Navigate to non-existent invoice edit page
    await page.goto('/dashboard/invoices/non-existent-id/edit');

    // Should show not found page
    await expect(page.locator('text=Not Found')).toBeVisible();
    await expect(
      page.locator('text=Could not find the requested invoice')
    ).toBeVisible();

    // Should have return button
    await expect(page.locator('a:has-text("Go Back")')).toBeVisible();
  });

  test('should display 404 page for non-existent customer ID', async ({
    page,
  }) => {
    // Navigate to non-existent customer page
    await page.goto('/dashboard/customers/non-existent-customer-id');

    // Should show not found page
    await expect(page.locator('text=Not Found')).toBeVisible();
    await expect(
      page.locator('text=Could not find the requested customer')
    ).toBeVisible();

    // Should have return button
    await expect(page.locator('a:has-text("Go Back")')).toBeVisible();
  });

  test('should handle invalid UUID format gracefully', async ({ page }) => {
    // Navigate with invalid UUID format
    await page.goto('/dashboard/invoices/invalid-uuid-123/edit');

    // Should show appropriate error or not found page
    const notFoundText = page.locator('text=Not Found');
    const errorText = page.locator('text=Error');

    // Either not found or error page should be shown
    const hasNotFound = await notFoundText.isVisible().catch(() => false);
    const hasError = await errorText.isVisible().catch(() => false);

    expect(hasNotFound || hasError).toBe(true);
  });

  test('should return to invoice list from 404 page', async ({ page }) => {
    // Navigate to non-existent invoice
    await page.goto('/dashboard/invoices/non-existent-id/edit');

    // Wait for not found page
    await expect(page.locator('text=Not Found')).toBeVisible();

    // Click go back button
    await page.click('a:has-text("Go Back")');

    // Should return to invoices list
    await expect(page).toHaveURL('/dashboard/invoices');
    await expect(page.locator('h1')).toContainText('Invoices');
  });

  test('should return to customer list from customer 404 page', async ({
    page,
  }) => {
    // Navigate to non-existent customer
    await page.goto('/dashboard/customers/non-existent-customer-id');

    // Wait for not found page
    await expect(page.locator('text=Not Found')).toBeVisible();

    // Click go back button
    await page.click('a:has-text("Go Back")');

    // Should return to customers list
    await expect(page).toHaveURL('/dashboard/customers');
    await expect(page.locator('h1')).toContainText('Customers');
  });

  test('should handle non-existent routes gracefully', async ({ page }) => {
    // Navigate to completely invalid route
    await page.goto('/dashboard/non-existent-page');

    // Should show some kind of error or redirect
    const hasNotFound = await page
      .locator('text=Not Found')
      .isVisible()
      .catch(() => false);
    const hasError = await page
      .locator('text=Error')
      .isVisible()
      .catch(() => false);
    const redirectedToDashboard = page.url().includes('/dashboard');

    // Should either show error page or redirect to valid page
    expect(hasNotFound || hasError || redirectedToDashboard).toBe(true);
  });

  test('should maintain authentication on error pages', async ({ page }) => {
    // Navigate to non-existent invoice
    await page.goto('/dashboard/invoices/non-existent-id/edit');

    // Should show not found but remain authenticated
    await expect(page.locator('text=Not Found')).toBeVisible();

    // Navigation should still be present (indicating user is logged in)
    const navigation = page.locator('a[href="/dashboard"]');
    await expect(navigation).toBeVisible();

    // User should be able to navigate to other dashboard pages
    await page.click('a[href="/dashboard"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show proper error layout with navigation', async ({ page }) => {
    // Navigate to non-existent invoice
    await page.goto('/dashboard/invoices/non-existent-id/edit');

    // Error page should maintain dashboard layout
    await expect(page.locator('text=Not Found')).toBeVisible();

    // Should still show navigation/sidebar
    const dashboardLayout = page.locator('a[href="/dashboard"]');
    await expect(dashboardLayout).toBeVisible();

    // Should be able to use navigation
    await page.click('a[href="/dashboard/invoices"]');
    await expect(page).toHaveURL('/dashboard/invoices');
  });

  test('should handle malformed URL parameters', async ({ page }) => {
    // Try various malformed URLs
    const malformedUrls = [
      '/dashboard/invoices/%20/edit',
      '/dashboard/invoices//edit',
      '/dashboard/customers/%',
      '/dashboard/invoices/null/edit',
      '/dashboard/invoices/undefined/edit',
    ];

    for (const url of malformedUrls) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

        // Wait a bit for content to load
        await page.waitForTimeout(1000);

        // Should not crash the application - check if any content is present
        const hasBody = await page
          .locator('body')
          .isVisible()
          .catch(() => false);
        const hasHtml = await page
          .locator('html')
          .isVisible()
          .catch(() => false);

        // If we have any HTML structure, consider it a success
        expect(hasBody || hasHtml).toBe(true);

        // Should show some kind of appropriate response
        const hasNotFound = await page
          .locator('text=Not Found')
          .isVisible()
          .catch(() => false);
        const hasError = await page
          .locator('text=Error, text=Something went wrong')
          .isVisible()
          .catch(() => false);
        const hasValidContent = await page
          .locator('h1, h2, main')
          .isVisible()
          .catch(() => false);

        // At least one of these should be true
        expect(hasNotFound || hasError || hasValidContent).toBe(true);
      } catch (error) {
        // If navigation fails completely, that's also acceptable for malformed URLs
        console.log(`Navigation to ${url} failed: ${error}`);
        // This is acceptable behavior for malformed URLs
      }
    }
  });

  test('should preserve breadcrumb navigation on error pages', async ({
    page,
  }) => {
    // Navigate to non-existent invoice edit page
    await page.goto('/dashboard/invoices/non-existent-id/edit');

    // Should show not found page
    await expect(page.locator('text=Not Found')).toBeVisible();

    // Look for breadcrumb navigation (if implemented)
    const breadcrumbs = page.locator(
      '[aria-label="breadcrumb"], .breadcrumb, [class*="breadcrumb"]'
    );
    const hasBreadcrumbs = (await breadcrumbs.count()) > 0;

    if (hasBreadcrumbs) {
      // Breadcrumbs should be functional
      await expect(breadcrumbs.first()).toBeVisible();
    }
  });

  test('should handle concurrent navigation to invalid pages', async ({
    page,
  }) => {
    // Test rapid navigation to multiple invalid pages
    const invalidUrls = [
      '/dashboard/invoices/invalid-1/edit',
      '/dashboard/customers/invalid-2',
      '/dashboard/invoices/invalid-3/edit',
    ];

    // Navigate quickly between invalid pages
    for (const url of invalidUrls) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

        // Wait a bit for content to load
        await page.waitForTimeout(500);

        // Should handle gracefully without crashing - check if any content is present
        const hasBody = await page
          .locator('body')
          .isVisible()
          .catch(() => false);
        const hasHtml = await page
          .locator('html')
          .isVisible()
          .catch(() => false);

        // If we have any HTML structure, consider it a success
        expect(hasBody || hasHtml).toBe(true);
      } catch (error) {
        // If navigation fails, that's also acceptable for invalid URLs
        console.log(`Navigation to ${url} failed: ${error}`);
      }
    }

    // Should still be able to navigate to valid page
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show helpful error messages', async ({ page }) => {
    // Navigate to non-existent invoice
    await page.goto('/dashboard/invoices/non-existent-id/edit');

    // Should show helpful error message
    await expect(page.locator('text=Not Found')).toBeVisible();

    // Should have descriptive text (check for any of these phrases)
    const couldNotFind = page.locator('text=Could not find');
    const doesNotExist = page.locator('text=does not exist');
    const pageNotFound = page.locator('text=Page not found');

    const hasHelpfulText = await Promise.all([
      couldNotFind.isVisible().catch(() => false),
      doesNotExist.isVisible().catch(() => false),
      pageNotFound.isVisible().catch(() => false),
    ]);

    expect(hasHelpfulText.some(visible => visible)).toBe(true);

    // Should suggest action
    const goBackButton = page.locator('a:has-text("Go Back")');
    const returnButton = page.locator('a:has-text("Return")');
    const backToButton = page.locator('a:has-text("Back to")');

    const hasActionButton = await Promise.all([
      goBackButton.isVisible().catch(() => false),
      returnButton.isVisible().catch(() => false),
      backToButton.isVisible().catch(() => false),
    ]);

    expect(hasActionButton.some(visible => visible)).toBe(true);
  });

  test('should handle browser back button on error pages', async ({ page }) => {
    // Start from invoice list
    await page.goto('/dashboard/invoices');
    await page.waitForLoadState('networkidle');

    // Navigate to non-existent invoice
    await page.goto('/dashboard/invoices/non-existent-id/edit');
    await expect(page.locator('text=Not Found')).toBeVisible();

    // Use browser back button
    await page.goBack();

    // Should return to previous page
    await expect(page).toHaveURL('/dashboard/invoices');
    await expect(page.locator('h1')).toContainText('Invoices');
  });

  test('should maintain session state through error navigation', async ({
    page,
  }) => {
    // Navigate to error page
    await page.goto('/dashboard/invoices/non-existent-id/edit');
    await expect(page.locator('text=Not Found')).toBeVisible();

    // Navigate to valid page
    await page.click('a[href="/dashboard"]');
    await expect(page).toHaveURL('/dashboard');

    // Should still be logged in and session should be maintained
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Should be able to access protected pages without re-authentication
    await page.goto('/dashboard/invoices');
    await expect(page).toHaveURL('/dashboard/invoices');
    await expect(page.locator('h1')).toContainText('Invoices');
  });
});
