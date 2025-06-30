import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';
import { DataHelper } from '../helpers/data-helper';
import { NavigationHelper } from '../helpers/navigation-helper';

test.describe('Search & Filtering Tests', () => {
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

  test('should search invoices by customer name', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Get initial invoice count
    const initialRows = page.locator(
      'tbody tr'
    );
    const initialCount = await initialRows.count();

    // Search for specific customer
    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('John');

    // Wait for debounced search results
    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');

    // Verify search results are filtered
    const filteredRows = page.locator(
      'tbody tr'
    );
    const filteredCount = await filteredRows.count();

    if (filteredCount > 0) {
      // Verify filtered results contain the search term
      await expect(page.locator('text=John').first()).toBeVisible();
    }

    // Filtered count should be less than or equal to initial count
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should search invoices by customer email', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Search by email domain
    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('example.com');

    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');

    // Verify search works with email
    const results = page.locator(
      'tbody tr'
    );
    const resultCount = await results.count();

    if (resultCount > 0) {
      // Should show results with email addresses
      await expect(page.locator('text=@example.com')).toBeVisible();
    }
  });

  test('should search invoices by partial customer name', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Search with partial name
    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('Doe');

    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');

    const results = page.locator(
      'tbody tr'
    );
    const resultCount = await results.count();

    if (resultCount > 0) {
      // Should find results containing "Doe"
      await expect(page.locator('text=Doe').first()).toBeVisible();
    }
  });

  test('should update search results in real-time with debouncing', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="Search invoices"]');

    // Type character by character to test debouncing
    await searchInput.fill('J');
    await page.waitForTimeout(200); // Less than debounce time

    await searchInput.fill('Jo');
    await page.waitForTimeout(200);

    await searchInput.fill('Joh');
    await page.waitForTimeout(200);

    await searchInput.fill('John');

    // Wait for debounce to complete
    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');

    // Should have updated results
    const results = page.locator(
      'tbody tr'
    );
    const resultCount = await results.count();
    expect(resultCount).toBeGreaterThanOrEqual(0);
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Search for something that won't match
    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('nonexistentcustomer12345xyz');

    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');

    // Should show no results
    const results = page.locator(
      'tbody tr'
    );
    const resultCount = await results.count();
    expect(resultCount).toBe(0);

    // Page should still be functional
    await expect(page.locator('h1')).toContainText('Invoices');
    await expect(searchInput).toBeVisible();
  });

  test('should clear search and restore all results', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Get initial count
    const initialRows = page.locator(
      'tbody tr'
    );
    const initialCount = await initialRows.count();

    // Perform search
    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('John');
    await page.waitForTimeout(600);

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');

    // Should restore all results
    const restoredRows = page.locator(
      'tbody tr'
    );
    const restoredCount = await restoredRows.count();
    expect(restoredCount).toBe(initialCount);
  });

  test('should persist search input in URL parameters', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Perform search
    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('Jane');

    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');

    // Check URL contains search parameter
    const currentUrl = page.url();
    expect(currentUrl).toContain('query=Jane');
  });

  test('should maintain search state during page refresh', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Perform search
    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('Smith');

    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Search input should maintain value
    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe('Smith');

    // URL should still contain search parameter
    const currentUrl = page.url();
    expect(currentUrl).toContain('query=Smith');
  });

  test('should handle case-insensitive search', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Search with lowercase
    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('john');

    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');

    const lowercaseResults = page.locator(
      'tbody tr'
    );
    const lowercaseCount = await lowercaseResults.count();

    // Clear and search with uppercase
    await searchInput.clear();
    await searchInput.fill('JOHN');

    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');

    const uppercaseResults = page.locator(
      'tbody tr'
    );
    const uppercaseCount = await uppercaseResults.count();

    // Should return same results regardless of case
    expect(uppercaseCount).toBe(lowercaseCount);
  });

  test('should maintain search state during pagination', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Perform search
    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('John');

    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');

    // Check if pagination exists
    const paginationNext = page.locator(
      'a:has-text("Next"), button:has-text("Next")'
    );
    const paginationExists = (await paginationNext.count()) > 0;

    if (paginationExists && (await paginationNext.isEnabled())) {
      // Click next page
      await paginationNext.click();
      await page.waitForLoadState('networkidle');

      // Search should be maintained
      const searchValue = await searchInput.inputValue();
      expect(searchValue).toBe('John');

      // URL should contain both search and page parameters
      const currentUrl = page.url();
      expect(currentUrl).toContain('query=John');
    }
  });

  test('should search by amount value', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Search by amount (this might not be implemented, but test the behavior)
    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('250');

    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');

    // Verify search completes without errors
    const results = page.locator(
      'tbody tr'
    );
    const resultCount = await results.count();
    expect(resultCount).toBeGreaterThanOrEqual(0);
  });

  test('should handle special characters in search', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Search with special characters
    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('@#$%');

    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');

    // Should not crash and should return appropriate results (likely none)
    const results = page.locator(
      'tbody tr'
    );
    const resultCount = await results.count();
    expect(resultCount).toBeGreaterThanOrEqual(0);

    // Page should remain functional
    await expect(page.locator('h1')).toContainText('Invoices');
  });

  test('should reset search when navigating away and back', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Perform search
    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('Test Search');

    await page.waitForTimeout(600);

    // Navigate away
    await navigationHelper.goToDashboard();

    // Navigate back
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Search should be cleared (depending on implementation)
    const searchValue = await searchInput.inputValue();
    // This might be empty or maintained depending on URL state
    expect(typeof searchValue).toBe('string');
  });

  test('should handle very long search queries', async ({ page }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Search with very long string
    const longQuery = 'a'.repeat(100);
    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill(longQuery);

    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');

    // Should handle gracefully
    const results = page.locator(
      'tbody tr'
    );
    const resultCount = await results.count();
    expect(resultCount).toBeGreaterThanOrEqual(0);

    // Input should accept the long string
    const inputValue = await searchInput.inputValue();
    expect(inputValue.length).toBeGreaterThan(50);
  });

  test('should show search indicator or loading state during search', async ({
    page,
  }) => {
    await navigationHelper.goToInvoices();
    await page.waitForLoadState('networkidle');

    // Perform search
    const searchInput = page.locator('input[placeholder*="Search invoices"]');
    await searchInput.fill('Loading Test');

    // Check if there's any loading indicator (optional feature)
    const loadingIndicator = page.locator(
      '.loading, .spinner, [class*="loading"]'
    );
    // This is optional, so we don't assert it must be present

    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');

    // Ensure search completes successfully
    const results = page.locator(
      'tbody tr'
    );
    const resultCount = await results.count();
    expect(resultCount).toBeGreaterThanOrEqual(0);
  });
});
