import fs from 'fs';
import path from 'path';
import { logger } from '../../utils/logger';
import { schemaVersionControl, SchemaRegistryMigration } from './schema-version-control';

/**
 * Interface for schema migration script
 */
export interface SchemaMigrationScript {
  schemaName: string;
  fromVersion: number;
  toVersion: number;
  description: string;
  isBreaking: boolean;
  migrate: (data: any) => any;
}

/**
 * Interface for migration result
 */
export interface MigrationResult {
  success: boolean;
  fromVersion: number;
  toVersion: number;
  schemaName: string;
  message: string;
  migratedData?: any;
}

/**
 * Class for managing schema migrations
 */
export class SchemaMigrationManager {
  private migrationsDir: string;
  private migrations: Map<string, SchemaMigrationScript[]> = new Map();

  constructor(migrationsDir: string = path.join(__dirname, 'migrations')) {
    this.migrationsDir = migrationsDir;
    this.loadMigrations();
  }

  /**
   * Load all migration scripts from the migrations directory
   */
  private loadMigrations(): void {
    try {
      // Create migrations directory if it doesn't exist
      if (!fs.existsSync(this.migrationsDir)) {
        fs.mkdirSync(this.migrationsDir, { recursive: true });
        logger.info(`Created migrations directory at ${this.migrationsDir}`);
        return;
      }

      // Read migration files
      const files = fs
        .readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.js') || file.endsWith('.ts'));

      for (const file of files) {
        try {
          // Import migration script
          const migrationPath = path.join(this.migrationsDir, file);
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const migration = require(migrationPath) as SchemaMigrationScript;

          // Validate migration script
          if (
            !migration.schemaName ||
            migration.fromVersion === undefined ||
            migration.toVersion === undefined ||
            !migration.migrate
          ) {
            logger.warn(`Invalid migration script in ${file}, skipping`);
            continue;
          }

          // Add migration to the map
          const schemaName = migration.schemaName;
          if (!this.migrations.has(schemaName)) {
            this.migrations.set(schemaName, []);
          }
          this.migrations.get(schemaName)?.push(migration);

          logger.info(
            `Loaded migration script for ${schemaName} from v${migration.fromVersion} to v${migration.toVersion}`
          );
        } catch (error) {
          logger.error(`Failed to load migration script ${file}: ${error}`);
        }
      }

      // Sort migrations by fromVersion
      for (const [schemaName, migrations] of this.migrations.entries()) {
        this.migrations.set(
          schemaName,
          migrations.sort((a, b) => a.fromVersion - b.fromVersion)
        );
      }
    } catch (error) {
      logger.error(`Failed to load migrations: ${error}`);
    }
  }

  /**
   * Get migration path for a schema
   *
   * @param schemaName - The name of the schema
   * @param fromVersion - The starting version
   * @param toVersion - The target version
   * @returns Array of migration scripts to apply in sequence
   */
  getMigrationPath(
    schemaName: string,
    fromVersion: number,
    toVersion: number
  ): SchemaMigrationScript[] {
    // Get all migrations for the schema
    const schemaMigrations = this.migrations.get(schemaName) || [];

    if (schemaMigrations.length === 0) {
      return [];
    }

    // Find all migrations that need to be applied
    const migrationPath: SchemaMigrationScript[] = [];
    let currentVersion = fromVersion;

    while (currentVersion < toVersion) {
      const nextMigration = schemaMigrations.find(
        m => m.fromVersion === currentVersion && m.toVersion <= toVersion
      );

      if (!nextMigration) {
        // No direct migration available
        break;
      }

      migrationPath.push(nextMigration);
      currentVersion = nextMigration.toVersion;
    }

    return migrationPath;
  }

  /**
   * Migrate data from one schema version to another
   *
   * @param schemaName - The name of the schema
   * @param data - The data to migrate
   * @param fromVersion - The current version of the data
   * @param toVersion - The target version to migrate to
   * @returns Migration result
   */
  migrateData(
    schemaName: string,
    data: any,
    fromVersion: number,
    toVersion: number
  ): MigrationResult {
    // If same version, no migration needed
    if (fromVersion === toVersion) {
      return {
        success: true,
        fromVersion,
        toVersion,
        schemaName,
        message: 'No migration needed, versions are the same',
        migratedData: data,
      };
    }

    // Get migration path
    const migrationPath = this.getMigrationPath(schemaName, fromVersion, toVersion);

    // Check if migration path is available
    if (migrationPath.length === 0) {
      return {
        success: false,
        fromVersion,
        toVersion,
        schemaName,
        message: `No migration path available from v${fromVersion} to v${toVersion}`,
      };
    }

    // Apply migrations in sequence
    let migratedData = { ...data };
    try {
      for (const migration of migrationPath) {
        migratedData = migration.migrate(migratedData);
        logger.info(
          `Applied migration for ${schemaName} from v${migration.fromVersion} to v${migration.toVersion}`
        );
      }

      return {
        success: true,
        fromVersion,
        toVersion,
        schemaName,
        message: `Successfully migrated data from v${fromVersion} to v${toVersion}`,
        migratedData,
      };
    } catch (error) {
      return {
        success: false,
        fromVersion,
        toVersion,
        schemaName,
        message: `Migration failed: ${error}`,
      };
    }
  }

  /**
   * Create a new migration script
   *
   * @param migration - The migration script details
   * @returns Whether the creation was successful
   */
  createMigrationScript(migration: {
    schemaName: string;
    fromVersion: number;
    toVersion: number;
    description: string;
    isBreaking: boolean;
    migrationLogic: string;
  }): boolean {
    try {
      // Validate migration details
      if (
        !migration.schemaName ||
        migration.fromVersion === undefined ||
        migration.toVersion === undefined ||
        !migration.migrationLogic
      ) {
        logger.error('Invalid migration details');
        return false;
      }

      // Create filename based on schema and versions
      const filename = `${migration.schemaName}_v${migration.fromVersion}_to_v${migration.toVersion}.ts`;
      const filePath = path.join(this.migrationsDir, filename);

      // Create migrations directory if it doesn't exist
      if (!fs.existsSync(this.migrationsDir)) {
        fs.mkdirSync(this.migrationsDir, { recursive: true });
      }

      // Generate migration script content
      const content = `/**
 * Migration script for ${migration.schemaName} schema
 * From version ${migration.fromVersion} to version ${migration.toVersion}
 *
 * ${migration.description}
 *
 * Created: ${new Date().toISOString()}
 */
import { SchemaMigrationScript } from '../schema-migrations';

const migration: SchemaMigrationScript = {
  schemaName: '${migration.schemaName}',
  fromVersion: ${migration.fromVersion},
  toVersion: ${migration.toVersion},
  description: \`${migration.description}\`,
  isBreaking: ${migration.isBreaking},

  migrate: (data) => {
    // Migration logic
${migration.migrationLogic
  .split('\n')
  .map(line => `    ${line}`)
  .join('\n')}

    return data;
  }
};

module.exports = migration;
`;

      // Write migration script to file
      fs.writeFileSync(filePath, content, 'utf-8');

      // Register migration in the schema registry
      schemaVersionControl.registerSchemaVersion(migration.schemaName, migration.toVersion, {
        previousVersion: migration.fromVersion,
        changes: migration.description,
        isBreaking: migration.isBreaking,
      });

      logger.info(`Created migration script at ${filePath}`);

      // Reload migrations
      this.loadMigrations();

      return true;
    } catch (error) {
      logger.error(`Failed to create migration script: ${error}`);
      return false;
    }
  }

  /**
   * Get all migration scripts for a schema
   *
   * @param schemaName - The name of the schema
   * @returns Array of migration scripts
   */
  getMigrationScripts(schemaName: string): SchemaMigrationScript[] {
    return this.migrations.get(schemaName) || [];
  }

  /**
   * Get all migrations from the registry
   *
   * @returns Record of schema names to migration histories
   */
  getAllMigrationHistory(): Record<string, SchemaRegistryMigration[]> {
    const allSchemas = schemaVersionControl.getAllSchemas();
    const result: Record<string, SchemaRegistryMigration[]> = {};

    for (const schema of allSchemas) {
      result[schema] = schemaVersionControl.getMigrationHistory(schema);
    }

    return result;
  }
}

// Export singleton instance
export const schemaMigrationManager = new SchemaMigrationManager();
