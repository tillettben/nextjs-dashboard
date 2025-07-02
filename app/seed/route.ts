import bcrypt from 'bcrypt';
import { db } from '../../drizzle/db';
import { users, customers, invoices, revenue } from '../../drizzle/schema';
import {
  invoices as invoiceData,
  customers as customerData,
  revenue as revenueData,
  users as userData,
} from '../lib/placeholder-data';

async function seedUsers() {
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

  return insertedUsers;
}

async function seedInvoices() {
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

  return insertedInvoices;
}

async function seedCustomers() {
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

  return insertedCustomers;
}

async function seedRevenue() {
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

  return insertedRevenue;
}

export async function GET() {
  try {
    await Promise.all([
      seedUsers(),
      seedCustomers(),
      seedInvoices(),
      seedRevenue(),
    ]);

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
