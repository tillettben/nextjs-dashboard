import { Page } from '@playwright/test';

export class DataHelper {
  constructor(private page: Page) {}

  async seedTestData() {
    // Call the seeding endpoint to populate test data
    const response = await this.page.request.get('/api/seed');
    return response;
  }

  async clearTestData() {
    // This would be used to clean up test data if needed
    // For now, seeding is idempotent so we don't need explicit cleanup
  }

  async setupTestEnvironment() {
    // Ensure clean test environment with fresh data
    await this.seedTestData();
  }

  // Helper to generate test invoice data
  getTestInvoiceData() {
    return {
      customerId: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa', // John Doe
      amount: '150.00',
      status: 'pending',
    };
  }

  // Helper to get test customer IDs for forms
  getTestCustomerId(index: number = 0) {
    const customerIds = [
      'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa', // John Doe
      '3958dc9e-742f-4377-85e9-fec4b6a6442a', // Jane Smith
      '3958dc9e-737f-4377-85e9-fec4b6a6442a', // Robert Johnson
      '76d65c26-f784-44a2-ac19-586678f7c2f2', // Alice Brown
      'CC27C14A-0ACF-4F4A-A6C9-D45682C144B9', // Michael Wilson
      '13D07535-C59E-4157-A011-F8D2EF4E0CBB', // Sarah Davis
    ];
    return customerIds[index] || customerIds[0];
  }

  // Format currency like the app does
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  // Format date like the app does
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
