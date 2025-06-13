#!/usr/bin/env node
/**
 * Analytics Schema Auto-Migration Script
 *
 * This script automatically applies migrations when schema versions change.
 * It detects the current schema version in the database and applies
 * necessary migrations to reach the target version.
 */
import { Pool } from 'pg';
import { logger } from '../../utils/logger';
import { schemaMigrationManager } from './schema-migrations';
import { schemaVersionControl } from './schema-version-control';
import { ANALYTICS_VERSION } from './analytics.constants';
import { getEnvOrDefault } from '../../utils/env';

// Database connection configuration
const dbConfig = {
  host: getEnvOrDefault('DB_HOST', 'localhost'),
  port: parseInt(getEnvOrDefault('DB_PORT', '5432'), 10),
  database: getEnvOrDefault('DB_NAME', 'conceptus_veritas'),
  user: getEnvOrDefault('DB_USER', 'postgres'),
  password: getEnvOrDefault('DB_PASSWORD', ''),
  ssl: getEnvOrDefault('DB_SSL', 'false') === 'true',
};

/**
 * Main function to run auto-migration
 */
async function autoMigrate(): Promise<void> {
  const pool = new Pool(dbConfig);

  try {
    logger.info('Starting analytics schema auto-migration');

    // Check if analytics_schema_versions table exists
    const tableExists = await checkTableExists(pool);

    if (!tableExists) {
      logger.warn('Analytics schema tracking tables not found. Run the initial migration first.');
      return;
    }

    // Get current schema version from database
    const currentVersion = await getCurrentSchemaVersion(pool);
    logger.info(`Current schema version in database: ${currentVersion}`);

    // Compare with target version (from constants)
    if (currentVersion === ANALYTICS_VERSION) {
      logger.info('Schema is already at the latest version. No migration needed.');
      return;
    }

    // Apply migrations
    await applyMigrations(pool, currentVersion, ANALYTICS_VERSION);

    logger.info(`Successfully migrated from ${currentVersion} to ${ANALYTICS_VERSION}`);
  } catch (error) {
    logger.error(`Auto-migration failed: ${error}`);
  } finally {
    await pool.end();
  }
}

/**
 * Check if analytics_schema_versions table exists
 */
async function checkTableExists(pool: Pool): Promise<boolean> {
  const query = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'analytics_schema_versions'
    );
  `;

  const result = await pool.query(query);
  return result.rows[0].exists;
}

/**
 * Get current schema version from database
 */
async function getCurrentSchemaVersion(pool: Pool): Promise<string> {
  const query = `
    SELECT version FROM analytics_schema_versions
    WHERE is_current = TRUE
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  try {
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      throw new Error('No current schema version found in database');
    }

    return result.rows[0].version;
  } catch (error) {
    logger.error(`Failed to get current schema version: ${error}`);
    throw error;
  }
}

/**
 * Apply migrations from current version to target version
 */
async function applyMigrations(
  pool: Pool,
  currentVersion: string,
  targetVersion: string
): Promise<void> {
  logger.info(`Applying migrations from ${currentVersion} to ${targetVersion}`);

  // Get all schemas
  const schemas = schemaVersionControl.getAllSchemas();

  // For each schema, apply migrations if needed
  for (const schemaName of schemas) {
    // Get schema versions
    const versions = schemaVersionControl.getAllVersions(schemaName);
    const latestVersion = schemaVersionControl.getLatestVersion(schemaName);

    if (latestVersion === undefined) {
      continue;
    }

    // Find the current version of this schema
    const schemaCurrentVersion = await getCurrentSchemaVersionForSchema(pool, schemaName);

    if (schemaCurrentVersion === latestVersion) {
      logger.info(`Schema ${schemaName} is already at the latest version (${latestVersion})`);
      continue;
    }

    // Apply migrations
    logger.info(
      `Migrating schema ${schemaName} from v${schemaCurrentVersion} to v${latestVersion}`
    );

    // Get the schema data
    const schemaFile = `${schemaName}-v${schemaCurrentVersion}.json`;
    const schemaPath = `${__dirname}/schemas/${schemaFile}`;

    try {
      // Read the schema file
      const fs = require('fs');
      const schemaData = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

      // Apply migration
      const result = schemaMigrationManager.migrateData(
        schemaName,
        schemaData,
        schemaCurrentVersion,
        latestVersion
      );

      if (!result.success) {
        logger.error(`Migration failed for schema ${schemaName}: ${result.message}`);
        continue;
      }

      // Update schema in database
      await updateSchemaVersion(pool, schemaName, latestVersion, result.migratedData);

      logger.info(`Successfully migrated schema ${schemaName} to v${latestVersion}`);
    } catch (error) {
      logger.error(`Failed to migrate schema ${schemaName}: ${error}`);
    }
  }

  // Update the global schema version
  await updateGlobalSchemaVersion(pool, targetVersion);
}

/**
 * Get current version for a specific schema
 */
async function getCurrentSchemaVersionForSchema(pool: Pool, schemaName: string): Promise<number> {
  const query = `
    SELECT event_version FROM analytics_event_schemas
    WHERE event_name = $1
    ORDER BY event_version DESC
    LIMIT 1;
  `;

  try {
    const result = await pool.query(query, [schemaName]);

    if (result.rows.length === 0) {
      // If no version found, assume it's the first version
      return 1;
    }

    return parseInt(result.rows[0].event_version, 10);
  } catch (error) {
    logger.error(`Failed to get current version for schema ${schemaName}: ${error}`);
    return 1; // Default to version 1
  }
}

/**
 * Update schema version in database
 */
async function updateSchemaVersion(
  pool: Pool,
  schemaName: string,
  version: number,
  schemaData: any
): Promise<void> {
  // Begin transaction
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get the current schema version ID
    const schemaVersionQuery = `
      SELECT id FROM analytics_schema_versions
      WHERE is_current = TRUE
      LIMIT 1;
    `;

    const schemaVersionResult = await client.query(schemaVersionQuery);
    const schemaVersionId = schemaVersionResult.rows[0].id;

    // Check if this schema version already exists
    const checkQuery = `
      SELECT id FROM analytics_event_schemas
      WHERE event_name = $1 AND event_version = $2;
    `;

    const checkResult = await client.query(checkQuery, [schemaName, version]);

    if (checkResult.rows.length > 0) {
      // Update existing schema
      const updateQuery = `
        UPDATE analytics_event_schemas
        SET schema_definition = $1,
            schema_version_id = $2,
            updated_at = NOW()
        WHERE event_name = $3 AND event_version = $4;
      `;

      await client.query(updateQuery, [
        JSON.stringify(schemaData),
        schemaVersionId,
        schemaName,
        version,
      ]);
    } else {
      // Insert new schema version
      const insertQuery = `
        INSERT INTO analytics_event_schemas (
          schema_version_id,
          event_name,
          event_version,
          category,
          description,
          schema_definition
        ) VALUES ($1, $2, $3, $4, $5, $6);
      `;

      await client.query(insertQuery, [
        schemaVersionId,
        schemaName,
        version,
        schemaData.category || 'unknown',
        schemaData.description || '',
        JSON.stringify(schemaData),
      ]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error(`Failed to update schema version: ${error}`);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Update global schema version
 */
async function updateGlobalSchemaVersion(pool: Pool, version: string): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Set all versions to not current
    const resetQuery = `
      UPDATE analytics_schema_versions
      SET is_current = FALSE
      WHERE is_current = TRUE;
    `;

    await client.query(resetQuery);

    // Check if this version already exists
    const checkQuery = `
      SELECT id FROM analytics_schema_versions
      WHERE version = $1;
    `;

    const checkResult = await client.query(checkQuery, [version]);

    if (checkResult.rows.length > 0) {
      // Update existing version
      const updateQuery = `
        UPDATE analytics_schema_versions
        SET is_current = TRUE
        WHERE version = $1;
      `;

      await client.query(updateQuery, [version]);
    } else {
      // Insert new version
      const insertQuery = `
        INSERT INTO analytics_schema_versions (
          version,
          description,
          is_current,
          created_by
        ) VALUES ($1, $2, TRUE, 'auto-migration');
      `;

      await client.query(insertQuery, [version, `Auto-migrated to version ${version}`]);
    }

    await client.query('COMMIT');
    logger.info(`Updated global schema version to ${version}`);
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error(`Failed to update global schema version: ${error}`);
    throw error;
  } finally {
    client.release();
  }
}

// Run the auto-migration
autoMigrate()
  .then(() => {
    console.log('Auto-migration complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Auto-migration failed:', error);
    process.exit(1);
  });
