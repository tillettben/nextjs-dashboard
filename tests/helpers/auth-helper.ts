import { Page } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async login(
    email: string = 'test@nextmail.com',
    password: string = '123456'
  ) {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button:has-text("Log in")');
    // Be more flexible with dashboard redirect (might have callback URLs)
    await this.page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await this.page.waitForLoadState('networkidle');
  }

  async loginAsAdmin() {
    await this.login('admin@nextmail.com', 'admin123');
  }

  async logout() {
    // Look for logout button in sidenav
    await this.page.click('button:has-text("Sign Out")');
    // Wait for '/login' (with possible query parameters)
    await this.page.waitForURL(/\/login/, { timeout: 10000 });
    await this.page.waitForLoadState('networkidle');
  }

  async ensureLoggedIn() {
    // Check if already logged in by trying to access dashboard
    try {
      await this.page.goto('/dashboard');
      const url = this.page.url();
      if (url.includes('/login')) {
        await this.login();
      }
    } catch {
      await this.login();
    }
  }

  async ensureLoggedOut() {
    try {
      await this.page.goto('/dashboard');
      await this.page.waitForLoadState('networkidle');
      const url = this.page.url();
      if (!url.includes('/login')) {
        await this.logout();
      }
    } catch {
      // Already logged out or error occurred
      await this.page.goto('/login');
      await this.page.waitForLoadState('networkidle');
    }
  }
}
