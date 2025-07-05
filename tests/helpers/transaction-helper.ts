import { db } from '../../drizzle/db';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import { ExtractTablesWithRelations } from 'drizzle-orm';
import * as schema from '../../drizzle/schema';

// Type for the transaction instance
export type TestTransaction = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

/**
 * Execute a function within a transaction
 * The transaction is automatically rolled back after the function completes
 */
export async function withTestTransaction<T>(
  fn: (tx: TestTransaction) => Promise<T>
): Promise<T> {
  return await db.transaction(async (tx) => {
    return await fn(tx);
  });
}