import { Page, expect } from '@playwright/test';

export class NavigationHelper {
  constructor(private page: Page) {}

  async goToDashboard() {
    await this.page.click('a[href="/dashboard"]');
    await this.page.waitForURL('/dashboard');
    await expect(this.page.locator('h1')).toContainText('Dashboard');
  }

  async goToInvoices() {
    await this.page.click('a[href="/dashboard/invoices"]');
    await this.page.waitForURL('/dashboard/invoices');
    await expect(this.page.locator('h1')).toContainText('Invoices');
  }

  async goToCustomers() {
    await this.page.click('a[href="/dashboard/customers"]');
    await this.page.waitForURL('/dashboard/customers');
    await expect(this.page.locator('h1')).toContainText('Customers');
  }

  async goToCreateInvoice() {
    await this.page.click('a[href="/dashboard/invoices/create"]');
    await this.page.waitForURL('/dashboard/invoices/create');
  }

  async goToEditInvoice(invoiceId: string) {
    await this.page.click(`a[href="/dashboard/invoices/${invoiceId}/edit"]`);
    await this.page.waitForURL(`/dashboard/invoices/${invoiceId}/edit`);
  }

  async goToCustomerDetail(customerId: string) {
    await this.page.click(`a[href="/dashboard/customers/${customerId}"]`);
    await this.page.waitForURL(`/dashboard/customers/${customerId}`);
  }

  async verifyActiveNavLink(linkText: string) {
    const activeLink = this.page.locator('.bg-sky-100.text-blue-600');
    await expect(activeLink).toContainText(linkText);
  }

  async verifyPageTitle(expectedTitle: string) {
    await expect(this.page).toHaveTitle(new RegExp(expectedTitle, 'i'));
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async clickBreadcrumb(breadcrumbText: string) {
    await this.page.click(`nav a:has-text("${breadcrumbText}")`);
  }

  async verifyBreadcrumbPath(expectedBreadcrumbs: string[]) {
    for (const breadcrumb of expectedBreadcrumbs) {
      await expect(this.page.locator('nav')).toContainText(breadcrumb);
    }
  }
}
