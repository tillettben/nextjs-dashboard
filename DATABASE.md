# Database Setup Guide

This project uses PostgreSQL with environment-specific configurations for development, testing, and production.

## Architecture

### Development (Local)

- **Database**: PostgreSQL via Docker Compose
- **Connection**: `postgres://dev_user:dev_password@localhost:5433/nextjs_dashboard`
- **SSL**: Disabled (local connection)

### Testing (Local Tests)

- **Database**: PostgreSQL via Docker (separate database)
- **Connection**: `postgres://dev_user:dev_password@localhost:5433/nextjs_dashboard_test`
- **SSL**: Disabled (local connection)
- **Isolation**: Completely separate from development data

### Production (Vercel)

- **Database**: Neon PostgreSQL
- **Connection**: Via `POSTGRES_URL` environment variable
- **SSL**: Required (external service)

## Quick Start

### Initial Setup

```bash
# Copy environment template
cp .env.example .env.local

# Start local database
pnpm docker:up

# Setup database schema and seed data
pnpm dev:setup

# Start development server
pnpm dev
```

### Full Development Setup (One Command)

```bash
pnpm dev:full
```

## Available Commands

### Docker Management

```bash
pnpm docker:up        # Start PostgreSQL container
pnpm docker:down      # Stop and remove containers
pnpm docker:logs      # View PostgreSQL logs
```

### Database Operations

```bash
pnpm db:generate      # Generate migrations from schema changes
pnpm db:migrate       # Run migrations (development)
pnpm db:migrate:test  # Run migrations (test environment)
pnpm db:seed          # Seed development database
pnpm db:seed:test     # Seed test database
pnpm db:studio        # Open Drizzle Studio (database GUI)
```

### Development Workflow

```bash
pnpm dev:setup        # Setup database and run migrations + seeding
pnpm dev:full         # Complete setup + start dev server
```

### Testing

```bash
pnpm test             # Run Playwright tests
```

## Environment Files

### `.env.local` (Local Development)

```env
DATABASE_URL_LOCAL=postgres://dev_user:dev_password@localhost:5432/nextjs_dashboard
AUTH_SECRET=your_secret_here
NODE_ENV=development
```

### `.env.test` (Testing)

```env
DATABASE_URL_TEST=postgres://postgres:postgres@localhost:5432/test_db
AUTH_SECRET=test-secret-key-for-ci-testing-only
NODE_ENV=test
```

### Production (Vercel Environment Variables)

```env
POSTGRES_URL=your_neon_database_url_with_ssl
AUTH_SECRET=your_production_secret
```

## Database Schema

The application uses Drizzle ORM with the following tables:

- `users` - Authentication and user data
- `customers` - Customer information
- `invoices` - Invoice records
- `revenue` - Monthly revenue data

Schema definitions are in `drizzle/schema/index.ts`.

## Troubleshooting

### Local Database Issues

```bash
# Reset local database
pnpm docker:down
pnpm docker:up
pnpm db:migrate
pnpm db:seed
```

### Connection Issues

- Ensure Docker is running
- Check if port 5432 is available
- Verify environment variables are loaded

### Test Failures

```bash
# Reset test database
pnpm db:migrate:test
pnpm db:seed:test
pnpm test
```

## Migration Workflow

1. **Modify Schema**: Edit files in `drizzle/schema/`
2. **Generate Migration**: `pnpm db:generate`
3. **Review Migration**: Check generated SQL in `drizzle/migrations/`
4. **Apply Migration**: `pnpm db:migrate`
5. **Update Seed Data**: Modify seed scripts if needed

## Production Deployment

Production uses Neon PostgreSQL. The database connection and migrations are handled automatically by Vercel using the `POSTGRES_URL` environment variable with SSL enabled.

No manual database setup is required for production deployments.
