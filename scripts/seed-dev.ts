#!/usr/bin/env tsx

import 'dotenv/config';
import bcrypt from 'bcrypt';
import { db } from '../drizzle/db';
import { users, customers, invoices, revenue } from '../drizzle/schema';
import {
  invoices as invoiceData,
  customers as customerData,
  revenue as revenueData,
  users as userData,
} from '../app/lib/placeholder-data';

async function seedUsers() {
  console.log('Seeding users...');

  // Add test users that Playwright tests expect
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

  // Seed test users first
  await Promise.all(
    testUsers.map(user => db.insert(users).values(user).onConflictDoNothing())
  );

  // Then seed the original placeholder users
  const insertedUsers = await Promise.all(
    userData.map(async user => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return db
        .insert(users)
        .values({
          id: user.id,
          name: user.name,
          email: user.email,
          password: hashedPassword,
        })
        .onConflictDoNothing();
    })
  );

  console.log(
    `✅ Seeded ${userData.length + testUsers.length} users (including test users)`
  );
  return insertedUsers;
}

async function seedCustomers() {
  console.log('Seeding customers...');

  const insertedCustomers = await Promise.all(
    customerData.map(customer =>
      db
        .insert(customers)
        .values({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          imageUrl: customer.image_url,
        })
        .onConflictDoNothing()
    )
  );

  console.log(`✅ Seeded ${customerData.length} customers`);
  return insertedCustomers;
}

async function seedInvoices() {
  console.log('Seeding invoices...');

  const insertedInvoices = await Promise.all(
    invoiceData.map(invoice =>
      db
        .insert(invoices)
        .values({
          customerId: invoice.customer_id,
          amount: invoice.amount,
          status: invoice.status,
          date: invoice.date,
        })
        .onConflictDoNothing()
    )
  );

  console.log(`✅ Seeded ${invoiceData.length} invoices`);
  return insertedInvoices;
}

async function seedRevenue() {
  console.log('Seeding revenue...');

  const insertedRevenue = await Promise.all(
    revenueData.map(rev =>
      db
        .insert(revenue)
        .values({
          month: rev.month,
          revenue: rev.revenue,
        })
        .onConflictDoNothing()
    )
  );

  console.log(`✅ Seeded ${revenueData.length} revenue records`);
  return insertedRevenue;
}

async function main() {
  console.log('🌱 Starting development database seeding...');

  try {
    // Seed in sequence to respect foreign key constraints
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();

    console.log('🎉 Development database seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding development database:', error);
    process.exit(1);
  }
}

main();
