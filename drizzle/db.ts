import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require',
  connect_timeout: 10,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

export const db = drizzle(client, { schema });