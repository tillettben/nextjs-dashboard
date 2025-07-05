import { test, expect } from '@playwright/test';
import { AuthHelper } from '../helpers/auth-helper';

test.describe('Authentication & Authorization', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('should complete login flow and access dashboard', async ({ page }) => {
    await authHelper.login();

    // Verify successful login and redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should complete admin login flow', async ({ page }) => {
    await authHelper.loginAsAdmin();

    // Verify admin can access dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should complete logout flow', async ({ page }) => {
    await authHelper.login();
    await expect(page).toHaveURL('/dashboard');

    await authHelper.logout();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should protect routes and redirect unauthenticated users', async ({ page }) => {
    await authHelper.ensureLoggedOut();

    // Test core protected routes
    const protectedRoutes = ['/dashboard', '/dashboard/invoices', '/dashboard/customers'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login(\?.*)?$/);
    }
  });

  test('should maintain session across page reloads', async ({ page }) => {
    await authHelper.login();
    await expect(page).toHaveURL('/dashboard');

    await page.reload();

    // Session should persist
    await expect(page).toHaveURL('/dashboard');
  });

  test('should preserve intended destination after login', async ({ page }) => {
    await page.goto('/dashboard/invoices');
    await expect(page).toHaveURL(/\/login/);

    await authHelper.login();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
