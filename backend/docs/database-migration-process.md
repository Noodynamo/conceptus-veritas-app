# Database Migration Versioning Process

This document outlines the database migration process for the Conceptus Veritas backend repository, including migration file naming conventions, development guidelines, and deployment procedures.

## Migration Tool

We use [Knex.js](http://knexjs.org/) for database migrations. Knex provides a robust migration system with up/down functionality, making it easy to manage database schema changes.

## Migration File Structure

### Naming Convention

Migration files follow this naming convention:

```
YYYYMMDD_HHMMSS_description.js
```

- **YYYYMMDD**: Date in year-month-day format
- **HHMMSS**: Time in hour-minute-second format
- **description**: Brief kebab-case description of the migration

Examples:
- `20240601_143022_create_users_table.js`
- `20240602_091534_add_email_verification_to_users.js`
- `20240605_155703_create_journal_entries_table.js`

### File Location

Migration files are stored in the `src/db/migrations` directory.

### Migration Content Structure

Each migration file should export `up` and `down` functions:

```javascript
/**
 * @param {import('knex')} knex - The Knex instance
 * @returns {Promise} A promise that resolves when migration is complete
 */
exports.up = function(knex) {
  // Code to migrate to the new state
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').notNullable().unique();
    table.string('name').notNullable();
    table.string('password_hash').notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param {import('knex')} knex - The Knex instance
 * @returns {Promise} A promise that resolves when rollback is complete
 */
exports.down = function(knex) {
  // Code to revert to the previous state
  return knex.schema.dropTable('users');
};
```

## Migration Development Process

### Creating a New Migration

To create a new migration:

```bash
npm run migrate:make -- create_users_table
```

This will generate a timestamped migration file in the `src/db/migrations` directory.

### Migration Guidelines

1. **Atomic Changes**: Each migration should make a single, focused change to the database.
2. **Reversible**: All migrations must have a proper `down` function to allow rollbacks.
3. **Idempotent**: Migrations should be idempotent when possible. For example, use `hasTable` checks:
   ```javascript
   exports.up = function(knex) {
     return knex.schema.hasTable('users').then(function(exists) {
       if (!exists) {
         return knex.schema.createTable('users', function(table) {
           // table definition
         });
       }
     });
   };
   ```
4. **Transaction Support**: Wrap complex migrations in transactions:
   ```javascript
   exports.up = function(knex) {
     return knex.transaction(function(trx) {
       return trx.schema
         .createTable('users', /* ... */)
         .then(function() {
           return trx.schema.createTable('profiles', /* ... */);
         });
     });
   };
   ```
5. **Comments**: Add comments for complex operations.
6. **Testing**: Test migrations on a development database before committing.

### Testing Migrations

Before committing a migration:

1. Run the migration:
   ```bash
   npm run migrate:latest
   ```

2. Verify the database changes.

3. Test the rollback:
   ```bash
   npm run migrate:rollback
   ```

4. Verify the database has been correctly rolled back.

5. Run the migration again to ensure it works after rollback:
   ```bash
   npm run migrate:latest
   ```

## Migration Deployment Process

### Development Environment

Migrations are run automatically during local development setup:

```bash
npm run setup:dev
```

This script sets up the database and runs all pending migrations.

### CI/CD Integration

Migrations are verified in CI/CD pipelines:

1. **Pull Request Checks**:
   - Set up a test database
   - Run migrations
   - Run rollbacks
   - Verify both processes complete successfully

2. **Automated Deployment**:
   - Staging: Migrations run automatically when merging to `develop`
   - Production: Migrations run automatically when merging to `main`

### Production Deployment

Production migrations follow a strict process:

1. **Pre-deployment Check**:
   - Review migration scripts
   - Backup the production database
   - Estimate migration runtime for long-running migrations

2. **Deployment Window**:
   - Schedule migrations during low-traffic periods when possible
   - Set up maintenance mode if necessary for long migrations

3. **Execution**:
   - Run migrations
   - Verify database state
   - Run smoke tests against the API

4. **Monitoring**:
   - Monitor application performance
   - Watch for any anomalies post-migration

### Rollback Plan

If a migration fails:

1. Execute rollback to the previous stable state:
   ```bash
   npm run migrate:rollback
   ```

2. Restore from backup if necessary.

3. Fix the migration script.

4. Re-deploy when fixed.

## Version Control and Migration History

Knex tracks migration history in a `knex_migrations` table:

| id | name | batch | migration_time |
|----|------|-------|----------------|
| 1  | 20240601_143022_create_users_table.js | 1 | 2024-06-01 14:30:22 |
| 2  | 20240602_091534_add_email_verification_to_users.js | 1 | 2024-06-02 09:15:34 |

This table maintains the state of which migrations have been run.

## Branch Management and Migrations

### Feature Branches

When developing in feature branches:

1. Create migrations in the feature branch.
2. Test migrations locally.
3. When merging to `develop`, migrations will be applied to the staging database.

### Release Branches

When preparing a release:

1. All migrations from `develop` are included in the release branch.
2. Final migration adjustments can be made in the release branch.
3. Migrations are tested again in staging.
4. When merging to `main`, migrations will be applied to the production database.

### Hotfix Branches

For hotfixes requiring database changes:

1. Create a migration in the hotfix branch.
2. Test thoroughly before deploying.
3. Apply to production during the hotfix deployment.
4. Merge back to `develop` to include the migration in the next regular release.

## Handling Conflicts

If two developers create migrations that modify the same schema objects:

1. Identify the conflict during code review or CI/CD checks.
2. Determine the correct order of migrations.
3. Adjust migration files if necessary to work regardless of the order they're applied.
4. Test both migrations together before merging.

## Large Data Migrations

For migrations involving large data transfers:

1. Split into smaller migrations when possible.
2. Use batch processing for large data sets.
3. Consider using separate data migration scripts for very large datasets:
   ```javascript
   exports.up = async function(knex) {
     // Create the new structure
     await knex.schema.createTable('new_users', /* ... */);
     
     // Migrate data in batches
     let processed = 0;
     const batchSize = 1000;
     let users;
     
     do {
       users = await knex('users')
         .select('*')
         .offset(processed)
         .limit(batchSize);
       
       if (users.length > 0) {
         await knex('new_users').insert(users.map(transformUser));
         processed += users.length;
       }
     } while (users.length === batchSize);
     
     // Switch tables
     await knex.schema.dropTable('users');
     await knex.schema.renameTable('new_users', 'users');
   };
   ```

## Database Versioning

The database schema version is tied to the API version:

1. **Major Version Changes**: May include breaking schema changes.
2. **Minor Version Changes**: Add tables or columns in a backward-compatible way.
3. **Patch Version Changes**: Fix data issues without schema changes.

## Documentation

For each significant migration:

1. Update entity relationship diagrams.
2. Update API documentation if the changes affect the API.
3. Add notes to the release changelog.

## Migration Scripts

Common migration commands:

```bash
# Create a new migration
npm run migrate:make -- create_new_table

# Run all pending migrations
npm run migrate:latest

# Rollback the last batch of migrations
npm run migrate:rollback

# Rollback all migrations
npm run migrate:rollback:all

# Run migrations up to a specific version
npm run migrate:up -- 20240601_143022_create_users_table.js

# Check current migration status
npm run migrate:status
```

## Troubleshooting

Common migration issues and solutions:

1. **Migration Fails**: Check the error message, fix the issue, and retry.
2. **Migration Stuck**: Verify the `knex_migrations_lock` table and clear locks if necessary.
3. **Inconsistent State**: Use `migrate:status` to check current state and adjust accordingly. 