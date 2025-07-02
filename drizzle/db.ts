import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Environment-aware database connection
function getDatabaseUrl(): string {
  const env = process.env.NODE_ENV;
  
  // Priority order: explicit env vars, then fallback based on NODE_ENV
  if (process.env.DATABASE_URL_TEST) {
    return process.env.DATABASE_URL_TEST;
  }
  
  if (process.env.DATABASE_URL_LOCAL) {
    return process.env.DATABASE_URL_LOCAL;
  }
  
  if (process.env.POSTGRES_URL) {
    return process.env.POSTGRES_URL;
  }

  switch (env) {
    case 'test':
      return 'postgres://dev_user:dev_password@localhost:5433/nextjs_dashboard_test';
    case 'development':
      return 'postgres://dev_user:dev_password@localhost:5433/nextjs_dashboard';
    case 'production':
      throw new Error('POSTGRES_URL environment variable is required in production');
    default:
      // Fallback for local development
      return 'postgres://dev_user:dev_password@localhost:5433/nextjs_dashboard';
  }
}

function getSSLConfig(): any {
  const env = process.env.NODE_ENV;

  // Only require SSL in production
  return env === 'production' ? 'require' : false;
}

const connectionUrl = getDatabaseUrl();
const sslConfig = getSSLConfig();

console.log(
  `🗄️  Database connection: ${process.env.NODE_ENV || 'development'} environment`
);

const client = postgres(connectionUrl, {
  ssl: sslConfig,
  connect_timeout: 10,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

export const db = drizzle(client, { schema });
