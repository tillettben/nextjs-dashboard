import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { TestTransaction } from './transaction-helper';
import { customers, invoices } from '../../drizzle/schema';

export class DataHelper {
  constructor(private page: Page) {}


  /**
   * Create a test customer within a transaction
   * This customer will be automatically cleaned up when the transaction rolls back
   */
  async createTestCustomer(tx: TestTransaction, name?: string): Promise<any> {
    const customerData = {
      name: name || faker.company.name(),
      email: faker.internet.email(),
      imageUrl: faker.image.avatar(),
    };

    const [customer] = await tx.insert(customers).values(customerData).returning();
    return customer;
  }

  /**
   * Create a test invoice within a transaction
   * This invoice will be automatically cleaned up when the transaction rolls back
   */
  async createTestInvoice(tx: TestTransaction, customerId: string, amount?: number): Promise<any> {
    const invoiceData = {
      customerId,
      amount: amount || faker.number.int({ min: 100, max: 10000 }),
      status: faker.helpers.arrayElement(['pending', 'paid'] as const),
      date: faker.date
        .between({ from: '2023-01-01', to: '2024-12-31' })
        .toISOString()
        .split('T')[0],
    };

    const [invoice] = await tx.insert(invoices).values(invoiceData).returning();
    return invoice;
  }

  /**
   * Create multiple test customers within a transaction
   */
  async createTestCustomers(tx: TestTransaction, count: number): Promise<any[]> {
    const customerData = Array.from({ length: count }, () => ({
      name: faker.company.name(),
      email: faker.internet.email(),
      imageUrl: faker.image.avatar(),
    }));

    return await tx.insert(customers).values(customerData).returning();
  }

  /**
   * Create multiple test invoices within a transaction
   */
  async createTestInvoices(tx: TestTransaction, customerId: string, count: number): Promise<any[]> {
    const invoiceData = Array.from({ length: count }, () => ({
      customerId,
      amount: faker.number.int({ min: 100, max: 10000 }),
      status: faker.helpers.arrayElement(['pending', 'paid'] as const),
      date: faker.date
        .between({ from: '2023-01-01', to: '2024-12-31' })
        .toISOString()
        .split('T')[0],
    }));

    return await tx.insert(invoices).values(invoiceData).returning();
  }

  // Helper to generate test invoice data
  getTestInvoiceData() {
    return {
      customerId: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa', // John Doe
      amount: '150.00',
      status: 'pending',
    };
  }

  // Helper to get test customer IDs for forms (legacy - hardcoded IDs)
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

  // Helper to get real customer IDs from database (for new minimal setup)
  async getRealCustomerId(index: number = 0): Promise<string> {
    const { db } = await import('../../drizzle/db');
    const customerIds = await db.select({ id: customers.id }).from(customers);
    return customerIds[index]?.id || customerIds[0]?.id;
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
