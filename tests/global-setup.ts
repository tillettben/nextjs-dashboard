#!/usr/bin/env tsx

// Set NODE_ENV to test before importing anything
if (!process.env.NODE_ENV) {
  (process.env as any).NODE_ENV = 'test';
}

// Load test environment variables explicitly
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.test file
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { db } from '../drizzle/db';
import { users, customers, invoices, revenue } from '../drizzle/schema';

// Set faker seed for deterministic data
faker.seed(1);

async function globalSetup() {
  console.log('🧪 Starting global test setup with minimal seeding...');

  try {
    // Clear existing data for clean test environment
    console.log('🧹 Cleaning existing test data...');
    await db.delete(invoices);
    await db.delete(users);
    await db.delete(customers);
    await db.delete(revenue);

    // Seed essential users only (2 test users)
    console.log('Seeding minimal test users...');
    const testPassword = await bcrypt.hash('123456', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    const testUsers = [
      {
        name: 'Test User',
        email: 'test@nextmail.com',
        password: testPassword,
      },
      {
        name: 'Admin User',
        email: 'admin@nextmail.com',
        password: adminPassword,
      },
    ];

    await db.insert(users).values(testUsers);

    // Seed minimal customers (3 core customers)
    console.log('Seeding minimal test customers...');
    const customerData = Array.from({ length: 3 }, () => ({
      name: faker.company.name(),
      email: faker.internet.email(),
      imageUrl: faker.image.avatar(),
    }));
    await db.insert(customers).values(customerData);

    // Get customer IDs for invoices
    const customerIds = await db.select({ id: customers.id }).from(customers);

    // Seed minimal invoices (6 invoices, 2 per customer)
    console.log('Seeding minimal test invoices...');
    const invoiceData = Array.from({ length: 6 }, (_, index) => ({
      customerId: customerIds[index % customerIds.length].id,
      amount: faker.number.int({ min: 100, max: 5000 }),
      status: faker.helpers.arrayElement(['pending', 'paid'] as const),
      date: faker.date
        .between({ from: '2023-01-01', to: '2024-12-31' })
        .toISOString()
        .split('T')[0],
    }));
    await db.insert(invoices).values(invoiceData);

    // Seed minimal static data (6 months revenue)
    console.log('Seeding minimal test revenue...');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const revenueData = months.map(month => ({
      month,
      revenue: faker.number.int({ min: 10000, max: 50000 }),
    }));
    await db.insert(revenue).values(revenueData);

    console.log('🎉 Global test setup completed successfully with minimal data');
    console.log('📊 Seeded data summary:');
    console.log('    - Users: 2');
    console.log('    - Customers: 3');
    console.log('    - Invoices: 6');
    console.log('    - Revenue records: 6');

    // Explicitly exit if running standalone
    if (require.main === module) {
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Error in global test setup:', error);
    process.exit(1);
  }
}

export default globalSetup;

// Run if executed directly
if (require.main === module) {
  globalSetup();
}