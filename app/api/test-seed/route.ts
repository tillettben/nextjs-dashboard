import bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import { join } from 'path';
import { db } from '../../../drizzle/db';
import { users, customers, invoices, revenue } from '../../../drizzle/schema';
import { sql } from 'drizzle-orm';
import type { User, Customer, Invoice, Revenue } from '../../lib/definitions';

// Load test fixtures
const testUsers: User[] = JSON.parse(
  readFileSync(join(process.cwd(), 'tests/fixtures/test-users.json'), 'utf8')
);
const testCustomers: Customer[] = JSON.parse(
  readFileSync(
    join(process.cwd(), 'tests/fixtures/test-customers.json'),
    'utf8'
  )
);
const testInvoices: Invoice[] = JSON.parse(
  readFileSync(join(process.cwd(), 'tests/fixtures/test-invoices.json'), 'utf8')
);
const testRevenue: Revenue[] = JSON.parse(
  readFileSync(join(process.cwd(), 'tests/fixtures/test-revenue.json'), 'utf8')
);

async function seedTestUsers() {
  // Clear existing users first
  await db.delete(users);

  const insertedUsers = await Promise.all(
    testUsers.map(async user => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return db.insert(users).values({
        id: user.id,
        name: user.name,
        email: user.email,
        password: hashedPassword,
      }).onConflictDoUpdate({
        target: users.id,
        set: {
          name: sql`EXCLUDED.name`,
          email: sql`EXCLUDED.email`,
          password: sql`EXCLUDED.password`,
        },
      });
    })
  );

  return insertedUsers;
}

async function seedTestCustomers() {
  // Clear existing customers first
  await db.delete(customers);

  const insertedCustomers = await Promise.all(
    testCustomers.map(customer =>
      db.insert(customers).values({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        imageUrl: customer.image_url,
      }).onConflictDoUpdate({
        target: customers.id,
        set: {
          name: sql`EXCLUDED.name`,
          email: sql`EXCLUDED.email`,
          imageUrl: sql`EXCLUDED.image_url`,
        },
      })
    )
  );

  return insertedCustomers;
}

async function seedTestInvoices() {
  // Clear existing invoices first
  await db.delete(invoices);

  const insertedInvoices = await Promise.all(
    testInvoices.map(invoice =>
      db.insert(invoices).values({
        customerId: invoice.customer_id,
        amount: invoice.amount,
        status: invoice.status,
        date: invoice.date,
      }).onConflictDoUpdate({
        target: invoices.id,
        set: {
          customerId: sql`EXCLUDED.customer_id`,
          amount: sql`EXCLUDED.amount`,
          status: sql`EXCLUDED.status`,
          date: sql`EXCLUDED.date`,
        },
      })
    )
  );

  return insertedInvoices;
}

async function seedTestRevenue() {
  // Clear existing revenue first
  await db.delete(revenue);

  const insertedRevenue = await Promise.all(
    testRevenue.map(rev =>
      db.insert(revenue).values({
        month: rev.month,
        revenue: rev.revenue,
      }).onConflictDoUpdate({
        target: revenue.month,
        set: {
          revenue: sql`EXCLUDED.revenue`,
        },
      })
    )
  );

  return insertedRevenue;
}

export async function GET() {
  try {
    console.log('Starting test database seeding...');

    await Promise.all([
      seedTestUsers(),
      seedTestCustomers(),
      seedTestInvoices(),
      seedTestRevenue(),
    ]);

    console.log('Test database seeded successfully');
    return Response.json({ message: 'Test database seeded successfully' });
  } catch (error) {
    console.error('Error seeding test database:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}