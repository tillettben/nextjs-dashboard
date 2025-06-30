import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { User, Customer, Invoice, Revenue } from '../../lib/definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

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
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  // Clear existing users first
  await sql`DELETE FROM users`;

  const insertedUsers = await Promise.all(
    testUsers.map(async user => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          password = EXCLUDED.password;
      `;
    })
  );

  return insertedUsers;
}

async function seedTestCustomers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  // Clear existing customers first
  await sql`DELETE FROM customers`;

  const insertedCustomers = await Promise.all(
    testCustomers.map(
      customer =>
        sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          image_url = EXCLUDED.image_url;
      `
    )
  );

  return insertedCustomers;
}

async function seedTestInvoices() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  // Clear existing invoices first
  await sql`DELETE FROM invoices`;

  const insertedInvoices = await Promise.all(
    testInvoices.map(
      invoice =>
        sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO UPDATE SET
          customer_id = EXCLUDED.customer_id,
          amount = EXCLUDED.amount,
          status = EXCLUDED.status,
          date = EXCLUDED.date;
      `
    )
  );

  return insertedInvoices;
}

async function seedTestRevenue() {
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  // Clear existing revenue first
  await sql`DELETE FROM revenue`;

  const insertedRevenue = await Promise.all(
    testRevenue.map(
      rev =>
        sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO UPDATE SET
          revenue = EXCLUDED.revenue;
      `
    )
  );

  return insertedRevenue;
}

export async function GET() {
  try {
    console.log('Starting test database seeding...');

    await sql.begin(() => [
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
