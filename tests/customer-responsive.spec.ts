// import { test, expect } from '@playwright/test';

// // Helper function to login
// async function login(page: any) {
//   await page.goto('/login');
//   await page.fill('input[name="email"]', 'user@nextmail.com');
//   await page.fill('input[name="password"]', '123456');
//   await page.click('button:has-text("Log in")');
//   await page.waitForURL('/dashboard');
// }

// test.describe('Customer Navigation - Responsive & Edge Cases', () => {
//   test.beforeEach(async ({ page }) => {
//     await login(page);
//   });

//   test.describe('Mobile Responsive Tests', () => {
//     test('should display customer cards correctly on mobile', async ({
//       page,
//     }) => {
//       // Set mobile viewport
//       await page.setViewportSize({ width: 375, height: 667 });

//       await page.goto('/dashboard/customers');

//       // Verify mobile layout
//       await expect(page.locator('h1')).toContainText('Customers');

//       // Check that cards stack vertically and are clickable
//       const customerCards = page.locator('a[href^="/dashboard/customers/"]');
//       await expect(customerCards.first()).toBeVisible();

//       // Test clicking on mobile
//       await customerCards.first().click();
//       await expect(page.locator('h1')).toContainText('Customer Details');
//     });

//     test('should display invoice table correctly on mobile', async ({
//       page,
//     }) => {
//       // Set mobile viewport
//       await page.setViewportSize({ width: 375, height: 667 });

//       await page.goto('/dashboard/invoices');
//       await page.waitForLoadState('networkidle');

//       // On mobile, invoices should show in card format (not table)
//       // Verify mobile invoice cards are displayed
//       const mobileCards = page.locator('.md\\:hidden');
//       await expect(mobileCards.first()).toBeVisible();

//       // Test customer navigation from mobile invoice view
//       const customerLink = page
//         .locator('a[href^="/dashboard/customers/"]')
//         .first();
//       await expect(customerLink).toBeVisible();
//       await customerLink.click();

//       // Verify navigation works on mobile
//       await expect(page.locator('h1')).toContainText('Customer Details');
//     });

//     test('should handle back navigation on mobile', async ({ page }) => {
//       await page.setViewportSize({ width: 375, height: 667 });

//       // Navigate to customer details
//       await page.goto('/dashboard/customers');
//       const firstCustomer = page
//         .locator('a[href^="/dashboard/customers/"]')
//         .first();
//       await firstCustomer.click();

//       // Verify mobile back button works
//       await expect(page.locator('text=Back to Customers')).toBeVisible();
//       await page.click('text=Back to Customers');
//       await expect(page).toHaveURL('/dashboard/customers');
//     });
//   });

//   test.describe('Desktop Responsive Tests', () => {
//     test('should display customer cards in grid on desktop', async ({
//       page,
//     }) => {
//       // Set desktop viewport
//       await page.setViewportSize({ width: 1920, height: 1080 });

//       await page.goto('/dashboard/customers');

//       // Verify grid layout classes are applied
//       const grid = page.locator(
//         '.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3'
//       );
//       await expect(grid).toBeVisible();

//       // Verify multiple cards are visible side by side
//       const customerCards = page.locator('a[href^="/dashboard/customers/"]');
//       const cardCount = await customerCards.count();
//       expect(cardCount).toBeGreaterThanOrEqual(3);
//     });

//     test('should display invoice table correctly on desktop', async ({
//       page,
//     }) => {
//       await page.setViewportSize({ width: 1920, height: 1080 });

//       await page.goto('/dashboard/invoices');
//       await page.waitForLoadState('networkidle');

//       // Verify table is visible on desktop
//       const table = page.locator('table.hidden.md\\:table');
//       await expect(table).toBeVisible();

//       // Verify table headers
//       await expect(page.locator('th')).toContainText([
//         'Customer',
//         'Email',
//         'Amount',
//         'Date',
//         'Status',
//       ]);

//       // Test customer navigation from table
//       const customerCell = page
//         .locator('td a[href^="/dashboard/customers/"]')
//         .first();
//       await expect(customerCell).toBeVisible();
//       await customerCell.click();

//       await expect(page.locator('h1')).toContainText('Customer Details');
//     });
//   });

//   test.describe('Edge Cases & Error Handling', () => {
//     test('should handle network delays gracefully', async ({ page }) => {
//       // Navigate to customers page
//       await page.goto('/dashboard/customers');

//       // Verify loading states and data fetching
//       await page.waitForLoadState('networkidle');

//       // Ensure customer cards are loaded before interaction
//       await expect(
//         page.locator('a[href^="/dashboard/customers/"]').first()
//       ).toBeVisible();

//       // Test navigation with potential slow network
//       const customerLink = page
//         .locator('a[href^="/dashboard/customers/"]')
//         .first();
//       await customerLink.click();

//       await page.waitForLoadState('networkidle');
//       await expect(page.locator('h1')).toContainText('Customer Details');
//     });

//     test('should handle empty states correctly', async ({ page }) => {
//       // This test assumes we might have search functionality in the future
//       await page.goto('/dashboard/customers');

//       // Verify that when customers exist, they are displayed
//       const customerCards = page.locator('a[href^="/dashboard/customers/"]');
//       const cardCount = await customerCards.count();

//       if (cardCount > 0) {
//         await expect(page.locator('text=Showing')).toBeVisible();
//       } else {
//         // If no customers, should show appropriate message
//         await expect(page.locator('text=No customers found')).toBeVisible();
//       }
//     });

//     test('should maintain proper focus states for accessibility', async ({
//       page,
//     }) => {
//       await page.goto('/dashboard/customers');

//       // Test keyboard navigation
//       const firstCustomerLink = page
//         .locator('a[href^="/dashboard/customers/"]')
//         .first();
//       await firstCustomerLink.focus();

//       // Verify focus is visible
//       await expect(firstCustomerLink).toBeFocused();

//       // Test keyboard activation
//       await page.keyboard.press('Enter');
//       await expect(page.locator('h1')).toContainText('Customer Details');

//       // Test back button focus
//       const backButton = page.locator('text=Back to Customers');
//       await backButton.focus();
//       await expect(backButton).toBeFocused();
//     });

//     test('should handle browser back/forward navigation', async ({ page }) => {
//       // Navigate through pages using UI
//       await page.goto('/dashboard/customers');

//       const firstCustomer = page
//         .locator('a[href^="/dashboard/customers/"]')
//         .first();
//       const customerUrl = await firstCustomer.getAttribute('href');
//       await firstCustomer.click();

//       // Use browser back
//       await page.goBack();
//       await expect(page).toHaveURL('/dashboard/customers');

//       // Use browser forward
//       await page.goForward();
//       await expect(page).toHaveURL(customerUrl!);

//       // Verify page content is still correct
//       await expect(page.locator('h1')).toContainText('Customer Details');
//     });
//   });

//   test.describe('Performance & Load Tests', () => {
//     test('should load customer pages within reasonable time', async ({
//       page,
//     }) => {
//       const startTime = Date.now();

//       await page.goto('/dashboard/customers');
//       await page.waitForLoadState('networkidle');

//       const loadTime = Date.now() - startTime;

//       // Verify page loads within 5 seconds (reasonable for development)
//       expect(loadTime).toBeLessThan(5000);

//       // Verify all customer cards are rendered
//       const customerCards = page.locator('a[href^="/dashboard/customers/"]');
//       const cardCount = await customerCards.count();
//       expect(cardCount).toBeGreaterThan(0);
//     });

//     test('should handle multiple rapid navigations', async ({ page }) => {
//       await page.goto('/dashboard/customers');

//       // Get multiple customer links
//       const customerLinks = page.locator('a[href^="/dashboard/customers/"]');
//       const linkCount = Math.min(await customerLinks.count(), 3); // Test first 3

//       // Rapidly navigate between customers
//       for (let i = 0; i < linkCount; i++) {
//         await customerLinks.nth(i).click();
//         await expect(page.locator('h1')).toContainText('Customer Details');

//         // Go back to customers list
//         await page.click('text=Back to Customers');
//         await expect(page).toHaveURL('/dashboard/customers');
//       }
//     });
//   });
// });
