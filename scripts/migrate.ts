#!/usr/bin/env tsx

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// Environment-aware database connection for migrations
function getDatabaseUrl(): string {
  const env = process.env.NODE_ENV;

  switch (env) {
    case 'test':
      return (
        process.env.DATABASE_URL_TEST ||
        'postgres://dev_user:dev_password@localhost:5433/nextjs_dashboard_test'
      );
    case 'development':
      return (
        process.env.DATABASE_URL_LOCAL ||
        'postgres://dev_user:dev_password@localhost:5433/nextjs_dashboard'
      );
    case 'production':
      return process.env.POSTGRES_URL!;
    default:
      return (
        process.env.DATABASE_URL_LOCAL ||
        'postgres://dev_user:dev_password@localhost:5433/nextjs_dashboard'
      );
  }
}

function getSSLConfig(): any {
  return process.env.NODE_ENV === 'production' ? 'require' : false;
}

// For migrations, we need a separate connection that's closed after use
const connectionUrl = getDatabaseUrl();
const sslConfig = getSSLConfig();

console.log(
  `🗄️  Migration target: ${process.env.NODE_ENV || 'development'} environment`
);

const migrationClient = postgres(connectionUrl, {
  ssl: sslConfig,
  max: 1,
});

const db = drizzle(migrationClient);

async function main() {
  console.log('🚀 Starting database migration...');

  try {
    await migrate(db, { migrationsFolder: 'drizzle/migrations' });
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

main();
