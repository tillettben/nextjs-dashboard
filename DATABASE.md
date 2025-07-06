# Database Architecture & Migration Guide

## Overview
This project uses **PostgreSQL** with **Drizzle ORM** and **drizzle-kit** for type-safe database operations and migrations across all environments.

## Database Environments

### 🔧 Development Environment
- **Database**: Neon PostgreSQL (Cloud)
- **Connection**: `POSTGRES_URL` environment variable
- **SSL**: Required (`sslmode=require`)
- **Purpose**: Main development work and feature testing

### 🧪 Test Environment
- **Database**: Local PostgreSQL (`nextjs_dashboard_test`)
- **Connection**: `DATABASE_URL_TEST=postgres://bentillett:@localhost:5432/nextjs_dashboard_test`
- **SSL**: Disabled (local connection)
- **Purpose**: Playwright end-to-end testing and CI/CD pipelines

### 🚀 Production Environment
- **Database**: Neon PostgreSQL (Cloud)
- **Connection**: `POSTGRES_URL` environment variable
- **SSL**: Required (`sslmode=require`)
- **Purpose**: Live application data

## Database Schema

The application uses 5 main tables:

### 👥 Users Table
```sql
CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255) NOT NULL,
  "email" text NOT NULL UNIQUE,
  "password" text NOT NULL
);
```

### 🏢 Customers Table
```sql
CREATE TABLE "customers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
  "image_url" varchar(255) NOT NULL
);
```

### 📄 Invoices Table
```sql
CREATE TABLE "invoices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "customer_id" uuid NOT NULL REFERENCES customers(id),
  "amount" integer NOT NULL,
  "status" varchar(255) NOT NULL,
  "date" date NOT NULL
);
```

### 📊 Revenue Table
```sql
CREATE TABLE "revenue" (
  "month" varchar(4) NOT NULL UNIQUE,
  "revenue" integer NOT NULL
);
```

### ✅ Todos Table
```sql
CREATE TABLE "todos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" varchar(255) NOT NULL,
  "completed" boolean DEFAULT false NOT NULL
);
```

## Migration System

### 🔄 Migration Workflow

We use **drizzle-kit** for all database migrations with a clean, environment-aware approach:

```bash
# Generate new migration from schema changes
pnpm db:generate

# Apply migrations to specific environments
pnpm db:migrate:dev    # Development
pnpm db:migrate:test   # Test
pnpm db:migrate:prod   # Production

# Or use environment-aware command
NODE_ENV=test pnpm db:migrate
```

### 📁 Migration Files Structure
```
drizzle/
├── migrations/
│   ├── 0000_parallel_silverclaw.sql  # Initial schema migration
│   └── meta/
│       ├── _journal.json
│       └── 0000_snapshot.json
├── schema/
│   └── index.ts                      # TypeScript schema definitions
└── db.ts                            # Database client configuration
```

### 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `pnpm db:generate` | Generate migration from schema changes |
| `pnpm db:migrate` | Apply migrations (environment-aware) |
| `pnpm db:migrate:dev` | Apply migrations to development |
| `pnpm db:migrate:test` | Apply migrations to test database |
| `pnpm db:migrate:prod` | Apply migrations to production |
| `pnpm db:push` | Push schema directly (development only) |
| `pnpm db:studio` | Open Drizzle Studio GUI |
| `pnpm db:reset` | Drop all tables and re-migrate |
| `pnpm db:seed` | Seed database with development data |

## Environment Configuration

### 🔧 Development Setup
1. Set up Neon database and get connection string
2. Add to `.env`:
   ```bash
   POSTGRES_URL=postgres://user:pass@host/db?sslmode=require
   ```
3. Run migrations:
   ```bash
   pnpm db:migrate:dev
   ```

### 🧪 Test Setup
1. Install local PostgreSQL
2. Create test database:
   ```bash
   createdb nextjs_dashboard_test
   ```
3. Configure `.env.test`:
   ```bash
   DATABASE_URL_TEST=postgres://bentillett:@localhost:5432/nextjs_dashboard_test
   NODE_ENV=test
   ```
4. Run test migrations:
   ```bash
   pnpm db:migrate:test
   ```

### 🚀 Production Setup
1. Configure production Neon database
2. Set production environment variables
3. Run production migrations:
   ```bash
   NODE_ENV=production pnpm db:migrate
   ```

## Making Schema Changes

### 1. Update Schema
Edit `drizzle/schema/index.ts` with your changes:

```typescript
export const newTable = pgTable('new_table', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});
```

### 2. Generate Migration
```bash
pnpm db:generate
```

### 3. Review Generated Migration
Check the generated SQL in `drizzle/migrations/`

### 4. Apply Migration
```bash
# Development
pnpm db:migrate:dev

# Test (for validation)
pnpm db:migrate:test

# Production (after testing)
pnpm db:migrate:prod
```

### 5. Update Types (if needed)
Add type exports in `drizzle/schema/index.ts`:
```typescript
export type NewTable = typeof newTable.$inferSelect;
export type NewNewTable = typeof newTable.$inferInsert;
```

## Best Practices

### ✅ Do's
- Always test migrations in development first
- Review generated SQL before applying
- Use descriptive migration names
- Keep migrations small and focused
- Use transactions for complex changes
- Document breaking changes

### ❌ Don'ts
- Never edit existing migration files
- Don't skip migration testing
- Avoid direct database changes in production
- Don't use `db:push` in production
- Never commit without testing migrations

## Troubleshooting

### Common Issues

#### Migration Fails
```bash
# Check current schema status
pnpm drizzle-kit check

# Reset and re-migrate (development only)
pnpm db:reset
```

#### Environment Connection Issues
```bash
# Verify environment variables are set
echo $POSTGRES_URL
echo $DATABASE_URL_TEST

# Test database connection
pnpm db:studio
```

#### Schema Drift
```bash
# Generate migration to sync schema
pnpm db:generate

# Or push directly in development
pnpm db:push
```

### Emergency Procedures

#### 🚨 Rollback Production Migration
1. Create rollback migration:
   ```sql
   -- Reverse the changes manually
   DROP TABLE IF EXISTS problem_table;
   ```
2. Apply rollback:
   ```bash
   pnpm db:generate  # Creates rollback migration
   pnpm db:migrate:prod
   ```

#### 🔄 Reset Development Database
```bash
# Complete reset (loses all data)
pnpm db:reset
pnpm db:seed
```

#### 🧪 Reset Test Database
```bash
# Automated in CI/CD - or manually:
NODE_ENV=test pnpm db:reset
```

## CI/CD Integration

### GitHub Actions
Our CI/CD pipeline automatically:
1. Sets up PostgreSQL test database
2. Runs `pnpm db:migrate:test`
3. Executes Playwright tests
4. Validates schema consistency

### Pipeline Configuration
```yaml
- name: Setup Database Schema
  run: pnpm db:migrate:test
```

## Performance Notes

- **UUID Primary Keys**: Using `gen_random_uuid()` for better distribution
- **Indexes**: Add as needed based on query patterns
- **Foreign Keys**: Properly defined for data integrity
- **Connection Pooling**: Configured in `drizzle/db.ts`

## Security Considerations

- **SSL Required**: All cloud database connections use SSL
- **Environment Isolation**: Separate databases for dev/test/prod
- **No Secrets in Migrations**: Keep connection strings in environment variables
- **Proper Permissions**: Use least-privilege database users

---

## Quick Reference

### 🚀 Fresh Project Setup
```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your database URL

# 3. Run migrations
pnpm db:migrate

# 4. Seed data
pnpm db:seed

# 5. Start development
pnpm dev
```

### 🔄 Daily Development Workflow
```bash
# 1. Make schema changes in drizzle/schema/index.ts
# 2. Generate migration
pnpm db:generate

# 3. Apply to development
pnpm db:migrate:dev

# 4. Test changes
pnpm test

# 5. Commit and push
git add . && git commit -m "feat: add new table"
```

### 📞 Support
For database-related issues:
1. Check this documentation
2. Review Drizzle documentation: https://orm.drizzle.team/
3. Check CI/CD logs for migration errors
4. Create issue with migration details