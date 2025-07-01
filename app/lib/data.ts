import { db } from '../../drizzle/db';
import { customers, invoices, revenue } from '../../drizzle/schema';
import { eq, desc, asc, count, sum, ilike, or, sql } from 'drizzle-orm';
import { formatCurrency } from './utils';

export async function fetchRevenue() {
  try {
    const data = await db.select().from(revenue);
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await db
      .select({
        amount: invoices.amount,
        name: customers.name,
        image_url: customers.imageUrl,
        email: customers.email,
        id: invoices.id,
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .orderBy(desc(invoices.date))
      .limit(5);

    const latestInvoices = data.map(invoice => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    const invoiceCountPromise = db.select({ count: count() }).from(invoices);
    const customerCountPromise = db.select({ count: count() }).from(customers);
    const invoiceStatusPromise = db
      .select({
        paid: sum(sql`CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.amount} ELSE 0 END`),
        pending: sum(sql`CASE WHEN ${invoices.status} = 'pending' THEN ${invoices.amount} ELSE 0 END`),
      })
      .from(invoices);

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0]?.count ?? 0);
    const numberOfCustomers = Number(data[1][0]?.count ?? 0);
    const totalPaidInvoices = formatCurrency(Number(data[2][0]?.paid ?? 0));
    const totalPendingInvoices = formatCurrency(Number(data[2][0]?.pending ?? 0));

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoicesData = await db
      .select({
        id: invoices.id,
        customer_id: invoices.customerId,
        amount: invoices.amount,
        date: invoices.date,
        status: invoices.status,
        name: customers.name,
        email: customers.email,
        image_url: customers.imageUrl,
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(
        or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`),
          ilike(sql`${invoices.amount}::text`, `%${query}%`),
          ilike(sql`${invoices.date}::text`, `%${query}%`),
          ilike(invoices.status, `%${query}%`)
        )
      )
      .orderBy(desc(invoices.date))
      .limit(ITEMS_PER_PAGE)
      .offset(offset);

    return invoicesData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await db
      .select({ count: count() })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(
        or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`),
          ilike(sql`${invoices.amount}::text`, `%${query}%`),
          ilike(sql`${invoices.date}::text`, `%${query}%`),
          ilike(invoices.status, `%${query}%`)
        )
      );

    const totalPages = Math.ceil(Number(data[0]?.count ?? 0) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    // Check if id is a valid UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return null;
    }

    const data = await db
      .select({
        id: invoices.id,
        customer_id: invoices.customerId,
        amount: invoices.amount,
        status: invoices.status,
      })
      .from(invoices)
      .where(eq(invoices.id, id));

    const invoice = data.map(invoice => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
      status: invoice.status as 'pending' | 'paid',
    }));

    return invoice[0] || null;
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}

export async function fetchCustomers() {
  try {
    const customersData = await db
      .select({
        id: customers.id,
        name: customers.name,
        image_url: customers.imageUrl,
      })
      .from(customers)
      .orderBy(asc(customers.name));

    return customersData;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await db
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        image_url: customers.imageUrl,
        total_invoices: count(invoices.id),
        total_pending: sum(sql`CASE WHEN ${invoices.status} = 'pending' THEN ${invoices.amount} ELSE 0 END`),
        total_paid: sum(sql`CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.amount} ELSE 0 END`),
      })
      .from(customers)
      .leftJoin(invoices, eq(customers.id, invoices.customerId))
      .where(
        or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`)
        )
      )
      .groupBy(customers.id, customers.name, customers.email, customers.imageUrl)
      .orderBy(asc(customers.name));

    const customersData = data.map(customer => ({
      ...customer,
      total_pending: formatCurrency(Number(customer.total_pending ?? 0)),
      total_paid: formatCurrency(Number(customer.total_paid ?? 0)),
    }));

    return customersData;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function fetchCustomerById(id: string) {
  try {
    // Check if id is a valid UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return null;
    }

    const data = await db
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        image_url: customers.imageUrl,
        total_invoices: count(invoices.id),
        total_pending: sum(sql`CASE WHEN ${invoices.status} = 'pending' THEN ${invoices.amount} ELSE 0 END`),
        total_paid: sum(sql`CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.amount} ELSE 0 END`),
      })
      .from(customers)
      .leftJoin(invoices, eq(customers.id, invoices.customerId))
      .where(eq(customers.id, id))
      .groupBy(customers.id, customers.name, customers.email, customers.imageUrl);

    const customer = data.map(customer => ({
      ...customer,
      total_pending: formatCurrency(Number(customer.total_pending ?? 0)),
      total_paid: formatCurrency(Number(customer.total_paid ?? 0)),
    }));

    return customer[0] || null;
  } catch (err) {
    console.error('Database Error:', err);
    return null;
  }
}