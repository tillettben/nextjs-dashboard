// import { test, expect } from '@playwright/test';

// // Test data - Using the customer IDs that exist in the seed data
// const TEST_CUSTOMERS = [
//   {
//     id: 'cc27c14a-0acf-4f4a-a6c9-d45682c144b9',
//     name: 'Amy Burns',
//     email: 'amy@burns.com',
//   },
//   {
//     id: '13d07535-c59e-4157-a011-f8d2ef4e0cbb',
//     name: 'Balazs Orban',
//     email: 'balazs@orban.com',
//   },
//   {
//     id: '3958dc9e-712f-4377-85e9-fec4b6a6442a',
//     name: 'Delba de Oliveira',
//     email: 'delba@oliveira.com',
//   },
// ];

// // Helper function to login
// async function login(page: any) {
//   await page.goto('/login');
//   await page.fill('input[name="email"]', 'user@nextmail.com');
//   await page.fill('input[name="password"]', '123456');
//   await page.click('button:has-text("Log in")');
//   await page.waitForURL('/dashboard');
// }

// test.describe('Customer Navigation Flows', () => {
//   test.beforeEach(async ({ page }) => {
//     await login(page);
//   });

//   test.describe('Customer Cards Navigation', () => {
//     test('should display customers page with clickable cards', async ({
//       page,
//     }) => {
//       // Navigate to customers page
//       await page.goto('/dashboard/customers');

//       // Verify page loads correctly
//       await expect(page).toHaveTitle(/Customers/);
//       await expect(page.locator('h1')).toContainText('Customers');
//       await expect(
//         page.locator('text=Manage your customer relationships')
//       ).toBeVisible();

//       // Verify customer cards are present and clickable
//       for (const customer of TEST_CUSTOMERS) {
//         const customerCard = page.locator(`text=${customer.name}`).first();
//         await expect(customerCard).toBeVisible();

//         // Verify the card is clickable (has a link)
//         const customerLink = page.locator(
//           `a[href="/dashboard/customers/${customer.id}"]`
//         );
//         await expect(customerLink).toBeVisible();
//       }

//       // Verify customer count display
//       await expect(page.locator('text=Showing')).toBeVisible();
//       await expect(page.locator('text=customers')).toBeVisible();
//     });

//     test('should navigate to individual customer page when card is clicked', async ({
//       page,
//     }) => {
//       await page.goto('/dashboard/customers');

//       const testCustomer = TEST_CUSTOMERS[0]; // Amy Burns

//       // Click on customer card
//       await page.click(`a[href="/dashboard/customers/${testCustomer.id}"]`);

//       // Verify navigation to individual customer page
//       await expect(page).toHaveURL(`/dashboard/customers/${testCustomer.id}`);
//       await expect(page).toHaveTitle(new RegExp(testCustomer.name));

//       // Verify page content
//       await expect(page.locator('h1')).toContainText('Customer Details');
//       await expect(
//         page.locator(`text=View detailed information for ${testCustomer.name}`)
//       ).toBeVisible();

//       // Verify customer card is displayed but not clickable
//       await expect(page.locator(`text=${testCustomer.name}`)).toBeVisible();
//       await expect(page.locator(`text=${testCustomer.email}`)).toBeVisible();

//       // Verify back button is present
//       await expect(page.locator('text=Back to Customers')).toBeVisible();
//     });

//     test('should navigate back to customers list when back button is clicked', async ({
//       page,
//     }) => {
//       const testCustomer = TEST_CUSTOMERS[0];

//       // Navigate directly to customer details page
//       await page.goto(`/dashboard/customers/${testCustomer.id}`);

//       // Click back button
//       await page.click('text=Back to Customers');

//       // Verify navigation back to customers list
//       await expect(page).toHaveURL('/dashboard/customers');
//       await expect(page.locator('h1')).toContainText('Customers');
//     });

//     test('should display not found page for invalid customer ID', async ({
//       page,
//     }) => {
//       const invalidId = 'invalid-customer-id-12345';

//       await page.goto(`/dashboard/customers/${invalidId}`);

//       // Verify 404 page is displayed
//       await expect(page.locator('h2')).toContainText('404 Not Found');
//       await expect(
//         page.locator('text=Could not find the requested customer')
//       ).toBeVisible();
//       await expect(page.locator('text=Go Back to Customers')).toBeVisible();

//       // Test the back link from 404 page
//       await page.click('text=Go Back to Customers');
//       await expect(page).toHaveURL('/dashboard/customers');
//     });
//   });

//   test.describe('Invoice Table Customer Navigation', () => {
//     test('should display invoices with clickable customer names', async ({
//       page,
//     }) => {
//       await page.goto('/dashboard/invoices');

//       // Wait for invoices to load
//       await expect(page.locator('h1')).toContainText('Invoices');

//       // Verify customer names in invoice table are clickable
//       // Check both mobile and desktop views
//       const customerLinks = page.locator('a[href^="/dashboard/customers/"]');
//       await expect(customerLinks.first()).toBeVisible();

//       // Verify customer names and images are present
//       const customerNames = page.locator(
//         'td img[alt*="profile picture"], div img[alt*="profile picture"]'
//       );
//       await expect(customerNames.first()).toBeVisible();
//     });

//     test('should navigate to customer details from invoice table', async ({
//       page,
//     }) => {
//       await page.goto('/dashboard/invoices');

//       // Wait for invoices to load
//       await page.waitForLoadState('networkidle');

//       // Find and click the first customer link in the invoice table
//       const firstCustomerLink = page
//         .locator('a[href^="/dashboard/customers/"]')
//         .first();
//       await expect(firstCustomerLink).toBeVisible();

//       // Get the href to verify the navigation
//       const customerUrl = await firstCustomerLink.getAttribute('href');
//       await firstCustomerLink.click();

//       // Verify navigation to customer details page
//       await expect(page).toHaveURL(customerUrl!);
//       await expect(page.locator('h1')).toContainText('Customer Details');
//       await expect(page.locator('text=Back to Customers')).toBeVisible();
//     });

//     test('should navigate from invoice to customer and back to customers list', async ({
//       page,
//     }) => {
//       // Start at invoices page
//       await page.goto('/dashboard/invoices');
//       await page.waitForLoadState('networkidle');

//       // Click on a customer from invoice table
//       const customerLink = page
//         .locator('a[href^="/dashboard/customers/"]')
//         .first();
//       await customerLink.click();

//       // Verify we're on customer details page
//       await expect(page.locator('h1')).toContainText('Customer Details');

//       // Click back to customers
//       await page.click('text=Back to Customers');

//       // Verify we're on customers list page
//       await expect(page).toHaveURL('/dashboard/customers');
//       await expect(page.locator('h1')).toContainText('Customers');

//       // Navigate back to invoices using sidebar
//       await page.click('text=Invoices');
//       await expect(page).toHaveURL('/dashboard/invoices');
//     });
//   });

//   test.describe('Customer Details Page Features', () => {
//     test('should display customer statistics correctly', async ({ page }) => {
//       const testCustomer = TEST_CUSTOMERS[0];
//       await page.goto(`/dashboard/customers/${testCustomer.id}`);

//       // Verify customer information is displayed
//       await expect(page.locator(`text=${testCustomer.name}`)).toBeVisible();
//       await expect(page.locator(`text=${testCustomer.email}`)).toBeVisible();

//       // Verify invoice statistics are displayed
//       await expect(page.locator('text=Total Invoices')).toBeVisible();
//       await expect(page.locator('text=Total Paid')).toBeVisible();
//       await expect(page.locator('text=Total Pending')).toBeVisible();

//       // Verify customer image is displayed
//       await expect(
//         page.locator(`img[alt="${testCustomer.name}'s profile picture"]`)
//       ).toBeVisible();
//     });

//     test('should have non-clickable customer card on details page', async ({
//       page,
//     }) => {
//       const testCustomer = TEST_CUSTOMERS[0];
//       await page.goto(`/dashboard/customers/${testCustomer.id}`);

//       // Verify the customer card is displayed
//       await expect(page.locator(`text=${testCustomer.name}`)).toBeVisible();

//       // Verify the card is not wrapped in a clickable link (no nested links)
//       const nestedLinks = page.locator(
//         `a[href="/dashboard/customers/${testCustomer.id}"] a`
//       );
//       await expect(nestedLinks).toHaveCount(0);
//     });
//   });

//   test.describe('Cross-Navigation Integration', () => {
//     test('should support navigation between all customer-related pages', async ({
//       page,
//     }) => {
//       // Start at dashboard
//       await page.goto('/dashboard');

//       // Navigate to customers
//       await page.click('text=Customers');
//       await expect(page).toHaveURL('/dashboard/customers');

//       // Click on first customer
//       const firstCustomerLink = page
//         .locator('a[href^="/dashboard/customers/"]')
//         .first();
//       const customerUrl = await firstCustomerLink.getAttribute('href');
//       await firstCustomerLink.click();

//       // Verify customer details page
//       await expect(page).toHaveURL(customerUrl!);

//       // Navigate to invoices via sidebar
//       await page.click('text=Invoices');
//       await expect(page).toHaveURL('/dashboard/invoices');

//       // Click on customer from invoice table
//       await page.waitForLoadState('networkidle');
//       const invoiceCustomerLink = page
//         .locator('a[href^="/dashboard/customers/"]')
//         .first();
//       await invoiceCustomerLink.click();

//       // Verify we're back on a customer details page
//       await expect(page.locator('h1')).toContainText('Customer Details');
//     });
//   });
// });
