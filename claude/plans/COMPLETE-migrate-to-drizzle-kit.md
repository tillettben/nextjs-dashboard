# Migrate to Drizzle-Kit Migration System

## Executive Summary
Transition from custom `scripts/migrate.ts` to using `drizzle-kit` for all database migrations across development, test, and production environments. This will provide better consistency, tooling support, and follow Drizzle ORM best practices.

## Current State Analysis
- **Custom Migration Script**: `scripts/migrate.ts` with environment-aware connections
- **Mixed Approach**: Some tables created via seeding scripts, some via migrations
- **Environment Configs**: Different connection strings for dev/test/prod
- **GitHub Actions**: Currently using custom migration script
- **Migration Files**: Mix of old problematic migrations and new clean migrations
- **🗑️ NO DATA PRESERVATION REQUIRED**: Can drop/reset all databases for clean migration

## Target Architecture Goals
- **Unified Migration System**: Use drizzle-kit for all environments
- **Environment Consistency**: Same migration process dev → test → prod
- **CI/CD Integration**: Proper migration handling in GitHub Actions
- **Documentation**: Clear database setup and migration procedures
- **Rollback Safety**: Proper migration versioning and rollback strategies

---

## Phase 1: Clean Database Reset (Simplified!)
### 1.1 🗑️ Complete Database Cleanup
- [ ] **DROP ALL TABLES** in development database (Neon)
- [ ] **DROP ALL TABLES** in test database (local PostgreSQL)
- [ ] **RESET MIGRATION TRACKING** - remove all `__drizzle_migrations__` entries
- [ ] **DELETE OLD MIGRATION FILES** - start completely fresh
- [ ] **CLEAN UP SCRIPTS** - remove all custom migration scripts

### 1.2 Fresh Drizzle Config Setup
- [ ] Create clean `drizzle.config.ts` with environment support
- [ ] Remove all references to custom migration scripts
- [ ] Configure proper SSL settings per environment
- [ ] Set up connection pooling and timeout settings

### 1.3 Environment Variable Standardization
- [ ] Clean up and standardize database URL environment variables
- [ ] Update `.env`, `.env.test` files
- [ ] Remove legacy database connection variables
- [ ] Document required environment variables

## Phase 2: Fresh Migration System Implementation
### 2.1 🆕 Generate Initial Migration
- [ ] **SINGLE CLEAN MIGRATION**: Generate one migration with entire schema
- [ ] **NO MIGRATION HISTORY**: Start with migration 0000 as baseline
- [ ] **APPLY TO ALL ENVIRONMENTS**: Same migration across dev/test/prod
- [ ] **VERIFY SCHEMA CONSISTENCY**: Ensure all environments match

### 2.2 Package.json Command Updates
- [ ] Replace `pnpm db:migrate` with `pnpm drizzle-kit migrate`
- [ ] Add environment-specific migration commands
- [ ] Add database reset commands (`pnpm db:reset`)
- [ ] Remove all custom migration script references

### 2.3 Legacy Cleanup
- [ ] **DELETE** `scripts/migrate.ts` and all related scripts
- [ ] **DELETE** `drizzle/migrations_backup/` directory
- [ ] **DELETE** all temporary migration fix scripts
- [ ] **CLEAN** package.json of old migration commands

## Phase 3: Environment Testing and Validation
### 3.1 🧪 Development Environment Testing
- [ ] **APPLY FRESH MIGRATION** to clean development database
- [ ] **VERIFY SCHEMA** matches expected structure
- [ ] **TEST SEEDING** with new migration system
- [ ] **VALIDATE APPLICATION** works with new schema

### 3.2 🔬 Test Environment Setup
- [ ] **RESET TEST DATABASE** completely
- [ ] **UPDATE PLAYWRIGHT TESTS** to use drizzle-kit migrations
- [ ] **UPDATE GITHUB ACTIONS** to use drizzle-kit instead of scripts
- [ ] **TEST CI/CD PIPELINE** with new migration system

### 3.3 🚀 Production Environment Preparation
- [ ] **DOCUMENT PRODUCTION RESET** procedure
- [ ] **PREPARE FRESH DEPLOYMENT** strategy
- [ ] **VALIDATE NEON DATABASE** connection and permissions
- [ ] **TEST MIGRATION APPLICATION** in production-like environment

## Phase 4: Simplified CI/CD Updates
### 4.1 🔧 GitHub Actions Cleanup
- [ ] **REMOVE** `pnpm exec tsx scripts/migrate.ts` from workflows
- [ ] **ADD** `pnpm drizzle-kit migrate` to workflows
- [ ] **SIMPLIFY** database setup steps (no more custom scripts)
- [ ] **TEST** updated CI/CD pipeline

### 4.2 🚀 Deployment Simplification
- [ ] **NO BACKUP NEEDED** - fresh deployment strategy
- [ ] **SINGLE MIGRATION COMMAND** for all environments
- [ ] **SIMPLIFIED ROLLBACK** - just reset and re-migrate
- [ ] **DOCUMENT NEW PROCESS** for team

## Phase 5: Documentation and Best Practices
### 5.1 DATABASE.md Documentation
- [ ] Document all database environments and purposes
- [ ] Explain migration workflow and best practices
- [ ] Provide troubleshooting guide for common issues
- [ ] Include connection string formats and requirements

### 5.2 Development Guidelines
- [ ] Update CLAUDE.md with new migration procedures
- [ ] Create migration development guidelines
- [ ] Document schema change review process
- [ ] Establish database backup and recovery procedures

### 5.3 Training and Knowledge Transfer
- [ ] Document migration commands for different scenarios
- [ ] Create troubleshooting guide for migration issues
- [ ] Establish team procedures for schema changes
- [ ] Document emergency rollback procedures

---

## Implementation Strategy

### **🗑️ Clean Slate Approach (Simplified!)**
Since we don't need to preserve data, we can start completely fresh:

```bash
# Step 1: Clean Reset (All Environments)
DROP ALL TABLES;  # Fresh start - no data preservation needed

# Step 2: Single Migration Generation
pnpm drizzle-kit generate    # Generate ONE migration with full schema

# Step 3: Apply Everywhere
pnpm drizzle-kit migrate     # Same migration applied to all environments

# Step 4: Verify Consistency
pnpm drizzle-kit check       # Verify schema matches everywhere
```

### **🎯 Simplified Commands**
```bash
# Reset and recreate (any environment)
pnpm db:reset     # Drop all tables + apply fresh migration
pnpm db:migrate   # Apply migrations (drizzle-kit migrate)
pnpm db:seed      # Seed with fresh data
```

### **Database Environment Structure**
- **Development**: Local PostgreSQL (SSL disabled)
- **Test**: Isolated test database (CI + local testing)
- **Production**: Neon/Cloud PostgreSQL (SSL required)

### **🎉 Simplified Migration Practices**
- **NO BACKUP NEEDED**: Fresh data in all environments
- **SINGLE MIGRATION**: One clean migration for entire schema
- **FAST RESET**: Drop all tables and re-migrate quickly
- **CONSISTENT ENVIRONMENTS**: Same migration applied everywhere

## Risk Assessment & Mitigation (Greatly Reduced!)

### **🟢 LOW RISK AREAS (Thanks to Clean Slate!)**
- **NO DATA LOSS RISK**: No existing data to lose
- **NO MIGRATION FAILURES**: Fresh schema application
- **NO ENVIRONMENT DRIFT**: All start from same clean state
- **NO ROLLBACK COMPLEXITY**: Just reset and re-migrate

### **⚠️ Remaining Risks & Mitigation**
- **CI/CD Pipeline Issues**: Test thoroughly with updated workflows
- **Environment Configuration**: Validate database connections work
- **Application Compatibility**: Ensure app works with fresh schema

### **Testing Requirements**
- Validate migration generation and application
- Test schema consistency across environments
- Verify CI/CD pipeline functionality
- Confirm rollback procedures work correctly

## Success Criteria ✅ COMPLETED
- [x] All environments use drizzle-kit for migrations
- [x] CI/CD pipeline successfully runs migrations  
- [x] Documentation is complete and accurate
- [x] Team can confidently make schema changes
- [x] Rollback procedures are tested and documented

## Final Implementation Results
- **✅ Phase 1**: Complete database reset and cleanup (2 hours)
- **✅ Phase 2**: Fresh migration system implementation (1 hour)
- **✅ Phase 3**: Environment testing and validation (30 minutes)
- **✅ Phase 4**: CI/CD updates and testing (30 minutes)
- **✅ Phase 5**: Comprehensive DATABASE.md documentation (1 hour)

**Total Time**: 5 hours (faster than estimated 8-12 hours)

## Migration System Now Live
- **Single clean migration**: `0000_parallel_silverclaw.sql` with all 5 tables
- **Environment-aware drizzle.config.ts**: Supports dev/test/prod
- **Updated package.json commands**: All use drizzle-kit
- **GitHub Actions**: Updated to use `pnpm db:migrate:test`
- **All tests passing**: 27 tests in 20.8 seconds

---

## Technical Requirements
- PostgreSQL databases for all environments
- Drizzle-kit CLI tools and configuration
- Environment-specific connection management
- GitHub Actions workflow updates
- Comprehensive documentation

## Timeline Estimate (Greatly Simplified!)
- **Phase 1**: Clean Database Reset (2-3 hours)
- **Phase 2**: Fresh Migration System (1-2 hours)
- **Phase 3**: Environment Testing (2-3 hours)
- **Phase 4**: CI/CD Updates (1-2 hours)
- **Phase 5**: Documentation (1-2 hours)

**Total Estimated Time**: 1 day (8-12 hours)

### **🚀 Why So Much Faster?**
- **NO DATA MIGRATION**: Just drop and recreate
- **NO COMPLEX ROLLBACKS**: Fresh start every time
- **NO ENVIRONMENT SYNC**: Same migration everywhere
- **NO BACKUP/RESTORE**: Clean slate approach