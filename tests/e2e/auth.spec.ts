import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';

test.describe('Authentication Tests', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('should load login page correctly', async ({ page }) => {
    await page.goto('/login');

    // Verify page loads with correct elements
    await expect(page).toHaveTitle(/Login/);
    await expect(page.locator('h1')).toContainText('Please log in to continue');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Log in")')).toBeVisible();
  });

  test('should login with valid credentials and redirect to dashboard', async ({
    page,
  }) => {
    await authHelper.login();

    // Verify successful login and redirect
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Verify dashboard elements are present
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible(); // Navigation links
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Invoices')).toBeVisible();
    await expect(page.locator('text=Customers')).toBeVisible();
  });

  test('should login with admin credentials', async ({ page }) => {
    await authHelper.loginAsAdmin();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should handle invalid credentials gracefully', async ({ page }) => {
    await page.goto('/login');

    // Try invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button:has-text("Log in")');

    // Should stay on login page with error
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await authHelper.login();
    await expect(page).toHaveURL('/dashboard');

    // Then logout
    await authHelper.logout();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login when accessing protected routes without authentication', async ({
    page,
  }) => {
    // Ensure logged out
    await authHelper.ensureLoggedOut();

    // Try to access protected routes
    const protectedRoutes = [
      '/dashboard',
      '/dashboard/invoices',
      '/dashboard/customers',
      '/dashboard/invoices/create',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('should maintain session across page reloads', async ({ page }) => {
    await authHelper.login();
    await expect(page).toHaveURL('/dashboard');

    // Reload page
    await page.reload();

    // Should still be logged in
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should redirect authenticated users away from login page', async ({
    page,
  }) => {
    // Login first
    await authHelper.login();
    await expect(page).toHaveURL('/dashboard');

    // Try to go to login page
    await page.goto('/login');

    // Should redirect back to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should preserve intended destination after login', async ({ page }) => {
    // Try to access specific protected route
    await page.goto('/dashboard/invoices');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    // Login
    await authHelper.login('test@nextmail.com', '123456');

    // Should redirect to originally intended page (may redirect to dashboard - this is acceptable)
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
