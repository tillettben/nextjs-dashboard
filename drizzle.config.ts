import { defineConfig } from 'drizzle-kit';

// Environment-aware database URL selection
function getDatabaseUrl(): string {
  const env = process.env.NODE_ENV;
  switch (env) {
    case 'test':
      return (
        process.env.DATABASE_URL_TEST ||
        'postgres://bentillett:@localhost:5432/nextjs_dashboard_test'
      );
    case 'development':
      return (
        process.env.POSTGRES_URL ||
        process.env.DATABASE_URL_LOCAL ||
        'postgres://bentillett:@localhost:5432/nextjs_dashboard'
      );
    case 'production':
      return process.env.POSTGRES_URL!;
    default:
      // Default to development
      return (
        process.env.POSTGRES_URL ||
        process.env.DATABASE_URL_LOCAL ||
        'postgres://bentillett:@localhost:5432/nextjs_dashboard'
      );
  }
}

export default defineConfig({
  schema: './drizzle/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: getDatabaseUrl(),
  },
  verbose: true,
  strict: true,
  migrations: {
    table: '__drizzle_migrations__',
    schema: 'public',
  },
});
