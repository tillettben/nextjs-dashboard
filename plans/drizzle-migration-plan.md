# Drizzle ORM Migration Plan

## Current State Analysis
The application currently uses the `postgres` npm package for direct SQL queries across multiple files:
- `app/lib/data.ts` - Data fetching functions  
- `app/lib/actions.ts` - Server actions for CRUD operations
- `auth.ts` - User authentication queries
- `app/seed/route.ts` - Database seeding
- `app/query/route.ts` - Sample query endpoint

### Current Database Schema
- **users**: id (UUID), name (VARCHAR), email (TEXT), password (TEXT)
- **customers**: id (UUID), name (VARCHAR), email (VARCHAR), image_url (VARCHAR)
- **invoices**: id (UUID), customer_id (UUID), amount (INT), status (VARCHAR), date (DATE)  
- **revenue**: month (VARCHAR), revenue (INT)

## Migration Objectives
1. Replace direct SQL queries with Drizzle ORM
2. Improve type safety with schema-driven types
3. Maintain existing functionality and API contracts
4. Set up proper Drizzle configuration and tooling

## Clarifying Questions - ANSWERED ✅
1. **Database Connection**: Standard Drizzle setup with `drizzle-orm` + `postgres-js`
2. **Schema Management**: Use Drizzle migrations, place schemas in `drizzle/schema/`
3. **Type Definitions**: Use Drizzle auto-generated types, keep `definitions.ts` for posterity
4. **Development Tools**: Set up Drizzle Studio and all migration commands
5. **Migration Strategy**: Incremental migration, keep artificial delays
6. **Backward Compatibility**: No concerns

## Implementation Plan

### Phase 1: Setup and Configuration
1. **Install Drizzle Dependencies**
   ```bash
   pnpm add drizzle-orm postgres
   pnpm add -D drizzle-kit
   ```

2. **Create Drizzle Configuration**
   - `drizzle.config.ts` - Main configuration file
   - `drizzle/schema/index.ts` - Schema definitions
   - `drizzle/db.ts` - Database connection and client setup

3. **Define Database Schemas**
   - Users schema with UUID, authentication fields
   - Customers schema with profile information
   - Invoices schema with foreign key relations
   - Revenue schema for dashboard data

4. **Setup Development Tools**
   - Add Drizzle Studio script
   - Add migration generation and push scripts
   - Configure TypeScript paths for schema imports

### Phase 2: Incremental Migration

#### Step 2.1: Migrate Data Fetching (`app/lib/data.ts`)
- Replace postgres queries with Drizzle queries
- Maintain existing function signatures and return types
- Keep artificial delays for demo purposes
- Test all dashboard functionality

#### Step 2.2: Migrate Server Actions (`app/lib/actions.ts`)
- Convert CREATE, UPDATE, DELETE operations to Drizzle
- Maintain Zod validation and error handling
- Ensure form submissions still work correctly

#### Step 2.3: Migrate Authentication (`auth.ts`)
- Replace user lookup query with Drizzle
- Maintain NextAuth integration

#### Step 2.4: Migrate Supporting Files
- Update seeding route (`app/seed/route.ts`)
- Update query route (`app/query/route.ts`)
- Update any remaining postgres usage

### Phase 3: Cleanup and Optimization
1. **Remove Old Dependencies**
   - Remove `postgres` package
   - Clean up unused imports

2. **Type System Updates**
   - Export types from Drizzle schema
   - Update imports across the application
   - Maintain `definitions.ts` as legacy reference

3. **Documentation and Testing**
   - Verify all functionality works
   - Test database operations
   - Ensure dev/build processes work

### Phase 4: Advanced Features (Optional)
1. **Relations and Joins**
   - Set up proper Drizzle relations
   - Optimize complex queries with relations

2. **Query Optimization**
   - Review and optimize query performance
   - Add proper indexes if needed

## Technical Implementation Details

### Standard Drizzle Setup (What we'll implement)
```typescript
// drizzle.config.ts
export default {
  schema: "./drizzle/schema/*",
  out: "./drizzle/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL!,
  }
}

// drizzle/db.ts - Connection setup
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require',
  connect_timeout: 10,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

export const db = drizzle(client);
```

### Files to Create/Modify
**New Files:**
- `drizzle.config.ts` - Drizzle configuration
- `drizzle/schema/index.ts` - All schema definitions
- `drizzle/db.ts` - Database client setup  
- `drizzle/migrations/` - Generated migration files

**Modified Files:**
- `package.json` - Add Drizzle scripts and dependencies
- `app/lib/data.ts` - Replace with Drizzle queries
- `app/lib/actions.ts` - Replace with Drizzle operations
- `auth.ts` - Replace user query with Drizzle
- `app/seed/route.ts` - Use Drizzle for seeding
- `app/query/route.ts` - Replace with Drizzle query

**Preserved Files:**
- `app/lib/definitions.ts` - Keep as legacy reference
- All UI components - No changes needed

### Package.json Scripts to Add
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push:pg", 
    "db:studio": "drizzle-kit studio",
    "db:seed": "curl -X GET http://localhost:3000/seed"
  }
}
```

### Schema Structure Preview
```typescript
// drizzle/schema/index.ts
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
});

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  imageUrl: varchar('image_url', { length: 255 }).notNull(),
});

export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  amount: integer('amount').notNull(),
  status: varchar('status', { length: 255 }).notNull(),
  date: date('date').notNull(),
});

export const revenue = pgTable('revenue', {
  month: varchar('month', { length: 4 }).notNull().unique(),
  revenue: integer('revenue').notNull(),
});
```

## Benefits Expected
- Better type safety with schema-first approach
- Auto-generated TypeScript types  
- Better query building and relations
- Improved developer experience
- Migration and schema management tools
- Drizzle Studio for database visualization
- Better IntelliSense and compile-time error catching

## Execution Timeline

### Phase 1: Setup (Steps 1-4)
- Install dependencies and create configuration files
- Set up schema definitions and database client
- Configure development scripts
- **Estimated Time:** ~30 minutes

### Phase 2: Incremental Migration (Steps 5-8)  
- **Step 2.1:** Migrate `data.ts` functions (~20 minutes)
- **Step 2.2:** Migrate `actions.ts` operations (~15 minutes)  
- **Step 2.3:** Migrate `auth.ts` queries (~10 minutes)
- **Step 2.4:** Migrate supporting files (~15 minutes)
- **Estimated Time:** ~60 minutes

### Phase 3: Cleanup (Steps 9-11)
- Remove old dependencies and clean imports
- Update type exports and documentation
- **Estimated Time:** ~15 minutes

### Total Estimated Time: ~105 minutes

## Testing Strategy
- After each phase, verify the application builds and runs
- Test key functionality: login, dashboard, invoice CRUD
- Ensure seeding and studio work correctly
- Verify TypeScript compilation with new types

## Rollback Plan
- Git commits after each phase for easy rollback
- Keep `postgres` dependency until full migration complete
- Maintain original function signatures during migration 
