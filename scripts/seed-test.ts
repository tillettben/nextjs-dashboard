#!/usr/bin/env tsx

import 'dotenv/config';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { db } from '../drizzle/db';
import { users, customers, invoices, revenue } from '../drizzle/schema';
import { count } from 'drizzle-orm';

// Set faker seed for deterministic data
faker.seed(1);

async function main() {
  console.log('🧪 Starting test database seeding with faker data...');

  try {
    // Clear existing data for clean test environment
    console.log('🧹 Cleaning existing test data...');
    await db.delete(invoices);
    await db.delete(customers);
    await db.delete(users);
    await db.delete(revenue);

    // Seed users with specific test users that tests expect
    console.log('Seeding test users...');
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

    // Add additional random users for completeness
    const additionalUserPromises = Array.from({ length: 3 }, async () => {
      const hashedPassword = await bcrypt.hash('123456', 10);
      return {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: hashedPassword,
      };
    });
    const additionalUsers = await Promise.all(additionalUserPromises);

    const allUsers = [...testUsers, ...additionalUsers];
    await db.insert(users).values(allUsers);

    // Seed customers
    console.log('Seeding test customers...');
    const customerData = Array.from({ length: 10 }, () => ({
      name: faker.company.name(),
      email: faker.internet.email(),
      imageUrl: faker.image.avatar(),
    }));
    await db.insert(customers).values(customerData);

    // Get customer IDs for invoices
    const customerIds = await db.select({ id: customers.id }).from(customers);

    // Seed invoices
    console.log('Seeding test invoices...');
    const invoiceData = Array.from({ length: 25 }, () => ({
      customerId: faker.helpers.arrayElement(customerIds).id,
      amount: faker.number.int({ min: 100, max: 10000 }),
      status: faker.helpers.arrayElement(['pending', 'paid'] as const),
      date: faker.date
        .between({ from: '2023-01-01', to: '2024-12-31' })
        .toISOString()
        .split('T')[0],
    }));
    await db.insert(invoices).values(invoiceData);

    // Seed revenue
    console.log('Seeding test revenue...');
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const revenueData = months.map(month => ({
      month,
      revenue: faker.number.int({ min: 10000, max: 50000 }),
    }));
    await db.insert(revenue).values(revenueData);

    console.log('🎉 Test database seeded successfully with faker data');

    // Log summary
    const [userCount] = await db.select({ count: count() }).from(users);
    const [customerCount] = await db.select({ count: count() }).from(customers);
    const [invoiceCount] = await db.select({ count: count() }).from(invoices);
    const [revenueCount] = await db.select({ count: count() }).from(revenue);

    console.log(`📊 Seeded data summary:
    - Users: ${userCount.count}
    - Customers: ${customerCount.count}
    - Invoices: ${invoiceCount.count}
    - Revenue records: ${revenueCount.count}`);
  } catch (error) {
    console.error('❌ Error seeding test database:', error);
    process.exit(1);
  }
}

main();
