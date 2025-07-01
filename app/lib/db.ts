import postgres from 'postgres';

// Create a single shared connection pool
const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  connect_timeout: 10,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  max: 5, // Reduced connection pool size
  connection: {
    application_name: 'nextjs-dashboard',
  },
});

export default sql;