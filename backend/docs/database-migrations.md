# Database Migration Process

This document outlines the process for creating, reviewing, and applying database migrations in the Conceptus Veritas backend.

## Migration File Structure

Migrations are stored in the `src/db/migrations` directory and follow this naming convention:

```
YYYYMMDD_HHmmss_description.sql
```

Example: `20250607_123045_create_users_table.sql`

Each migration file should contain both "up" and "down" migrations, separated by a special comment:

```sql
-- UP MIGRATION
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- DOWN MIGRATION
DROP TABLE IF EXISTS users;
```

## Creating a New Migration

1. Use the migration helper script to generate a properly named migration file:

   ```bash
   npm run migrations:create -- "description_of_change"
   ```

2. Edit the generated file and add your SQL changes.
3. Always include both "up" and "down" migrations.
4. Test your migration locally before committing.

## Best Practices

1. **Idempotence**: When possible, make migrations idempotent (can be run multiple times without error).
   
   Example:
   ```sql
   -- UP MIGRATION
   CREATE TABLE IF NOT EXISTS users (...);
   
   -- DOWN MIGRATION
   DROP TABLE IF EXISTS users;
   ```

2. **Atomic Changes**: Each migration should perform a single logical change.

3. **No Data Loss**: Migrations should not cause data loss. When removing columns, consider first renaming them in one migration, then removing them in a later migration after data has been migrated.

4. **Backward Compatibility**: When possible, make database changes that are backward compatible with the previous version of the application.

5. **Foreign Keys**: Always include foreign key constraints to maintain data integrity.

6. **Indexing**: Add appropriate indexes for fields used in WHERE clauses and JOIN conditions.

## Testing Migrations

Before submitting a PR with a new migration:

1. Test the "up" migration:
   ```bash
   npm run migrations:up
   ```

2. Test the "down" migration:
   ```bash
   npm run migrations:down
   ```

3. Verify the database state after each operation.

## Migration Deployment Process

Migrations are automatically applied as part of the CI/CD process:

1. When a PR with migrations is merged to `develop`, migrations are applied to the staging environment.
2. When a PR with migrations is merged to `main`, migrations are applied to the production environment.

## Rollback Process

If a migration needs to be rolled back:

1. For staging: Use the rollback command:
   ```bash
   npm run migrations:down
   ```

2. For production: Create a new migration that reverses the problematic changes, rather than using the down migration directly. 