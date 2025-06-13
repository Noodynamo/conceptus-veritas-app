import fs from 'fs';
import path from 'path';
import { logger } from '../../utils/logger';
import { ANALYTICS_VERSION } from './analytics.constants';

/**
 * Interface for schema registry data
 */
export interface SchemaRegistryData {
  schemaVersions: Record<string, number[]>;
  latestVersions: Record<string, number>;
  migrations: Record<string, SchemaRegistryMigration[]>;
  lastUpdated: string;
}

/**
 * Interface for schema migration data
 */
export interface SchemaRegistryMigration {
  fromVersion: number;
  toVersion: number;
  migrationDate: string;
  changes: string;
  isBreaking: boolean;
}

/**
 * Class for managing schema versioning and migrations
 */
export class SchemaVersionControl {
  private registryPath: string;
  private schemaRegistryData: SchemaRegistryData;
  private schemasDir: string;

  constructor(
    registryPath: string = path.join(__dirname, 'schema-registry.json'),
    schemasDir: string = path.join(__dirname, 'schemas')
  ) {
    this.registryPath = registryPath;
    this.schemasDir = schemasDir;
    this.schemaRegistryData = this.loadRegistry();
  }

  /**
   * Load the schema registry data from disk
   */
  private loadRegistry(): SchemaRegistryData {
    try {
      if (fs.existsSync(this.registryPath)) {
        const data = fs.readFileSync(this.registryPath, 'utf-8');
        return JSON.parse(data);
      } else {
        logger.warn(
          `Schema registry file not found at ${this.registryPath}, creating new registry`
        );
        const initialRegistry: SchemaRegistryData = {
          schemaVersions: {},
          latestVersions: {},
          migrations: {},
          lastUpdated: new Date().toISOString(),
        };
        return initialRegistry;
      }
    } catch (error) {
      logger.error(`Failed to load schema registry: ${error}`);
      throw new Error(`Failed to load schema registry: ${error}`);
    }
  }

  /**
   * Save the schema registry data to disk
   */
  private saveRegistry(): void {
    try {
      // Update the lastUpdated timestamp
      this.schemaRegistryData.lastUpdated = new Date().toISOString();

      // Write the registry data to disk
      fs.writeFileSync(
        this.registryPath,
        JSON.stringify(this.schemaRegistryData, null, 2),
        'utf-8'
      );

      logger.info('Schema registry saved successfully');
    } catch (error) {
      logger.error(`Failed to save schema registry: ${error}`);
      throw new Error(`Failed to save schema registry: ${error}`);
    }
  }

  /**
   * Register a new schema version
   *
   * @param schemaName - The name of the schema
   * @param version - The version number
   * @param migrationInfo - Optional migration information
   * @returns Whether the registration was successful
   */
  registerSchemaVersion(
    schemaName: string,
    version: number,
    migrationInfo?: {
      previousVersion?: number;
      changes: string;
      isBreaking: boolean;
    }
  ): boolean {
    try {
      // Initialize schema version arrays if they don't exist
      if (!this.schemaRegistryData.schemaVersions[schemaName]) {
        this.schemaRegistryData.schemaVersions[schemaName] = [];
      }

      // Check if version already exists
      if (this.schemaRegistryData.schemaVersions[schemaName].includes(version)) {
        logger.warn(`Schema ${schemaName} version ${version} already exists`);
        return false;
      }

      // Add the new version to the registry
      this.schemaRegistryData.schemaVersions[schemaName].push(version);

      // Sort versions in ascending order
      this.schemaRegistryData.schemaVersions[schemaName].sort((a, b) => a - b);

      // Update latest version
      this.schemaRegistryData.latestVersions[schemaName] = version;

      // Add migration information if provided
      if (migrationInfo && migrationInfo.previousVersion !== undefined) {
        if (!this.schemaRegistryData.migrations[schemaName]) {
          this.schemaRegistryData.migrations[schemaName] = [];
        }

        this.schemaRegistryData.migrations[schemaName].push({
          fromVersion: migrationInfo.previousVersion,
          toVersion: version,
          migrationDate: new Date().toISOString(),
          changes: migrationInfo.changes,
          isBreaking: migrationInfo.isBreaking,
        });
      }

      // Save the updated registry
      this.saveRegistry();

      logger.info(`Registered schema ${schemaName} version ${version}`);
      return true;
    } catch (error) {
      logger.error(`Failed to register schema version: ${error}`);
      return false;
    }
  }

  /**
   * Get the latest version of a schema
   *
   * @param schemaName - The name of the schema
   * @returns The latest version number, or undefined if the schema doesn't exist
   */
  getLatestVersion(schemaName: string): number | undefined {
    return this.schemaRegistryData.latestVersions[schemaName];
  }

  /**
   * Get all versions of a schema
   *
   * @param schemaName - The name of the schema
   * @returns Array of version numbers, or empty array if the schema doesn't exist
   */
  getAllVersions(schemaName: string): number[] {
    return this.schemaRegistryData.schemaVersions[schemaName] || [];
  }

  /**
   * Get migration history for a schema
   *
   * @param schemaName - The name of the schema
   * @returns Array of migration records, or empty array if no migrations exist
   */
  getMigrationHistory(schemaName: string): SchemaRegistryMigration[] {
    return this.schemaRegistryData.migrations[schemaName] || [];
  }

  /**
   * Check if a schema exists in the registry
   *
   * @param schemaName - The name of the schema
   * @returns Whether the schema exists
   */
  schemaExists(schemaName: string): boolean {
    return Boolean(this.schemaRegistryData.schemaVersions[schemaName]);
  }

  /**
   * Get all schemas in the registry
   *
   * @returns Array of schema names
   */
  getAllSchemas(): string[] {
    return Object.keys(this.schemaRegistryData.schemaVersions);
  }

  /**
   * Scan the schemas directory and update the registry
   *
   * @returns Number of schemas registered
   */
  scanAndRegisterSchemas(): number {
    try {
      // Ensure the schemas directory exists
      if (!fs.existsSync(this.schemasDir)) {
        logger.warn(`Schemas directory not found at ${this.schemasDir}`);
        return 0;
      }

      // Read all schema files in the directory
      const schemaFiles = fs.readdirSync(this.schemasDir).filter(file => file.endsWith('.json'));

      let registerCount = 0;

      // Process each schema file
      for (const file of schemaFiles) {
        try {
          // Extract schema name and version from filename (format: name-vX.json)
          const match = file.match(/^(.+)-v(\d+)\.json$/);
          if (!match) {
            logger.warn(`Schema file ${file} does not follow the naming convention: name-vX.json`);
            continue;
          }

          const [, schemaName, versionStr] = match;
          const version = parseInt(versionStr, 10);

          // Read schema file
          const schemaPath = path.join(this.schemasDir, file);
          const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
          const schema = JSON.parse(schemaContent);

          // Validate schema content
          if (schema.name !== schemaName || schema.version !== version) {
            logger.warn(`Schema file ${file} has mismatched name or version in content`);
            continue;
          }

          // Register schema if not already registered
          if (!this.schemaRegistryData.schemaVersions[schemaName]?.includes(version)) {
            this.registerSchemaVersion(schemaName, version, {
              previousVersion: this.getLatestVersion(schemaName),
              changes: schema.changes || 'No change description provided',
              isBreaking: false, // Default to non-breaking
            });
            registerCount++;
          }
        } catch (error) {
          logger.error(`Error processing schema file ${file}: ${error}`);
        }
      }

      return registerCount;
    } catch (error) {
      logger.error(`Failed to scan and register schemas: ${error}`);
      return 0;
    }
  }

  /**
   * Get the current analytics version
   *
   * @returns The current analytics version
   */
  getAnalyticsVersion(): string {
    return ANALYTICS_VERSION;
  }

  /**
   * Export the schema registry to a JSON string
   *
   * @returns The schema registry as a JSON string
   */
  exportRegistry(): string {
    return JSON.stringify(this.schemaRegistryData, null, 2);
  }

  /**
   * Import a schema registry from a JSON string
   *
   * @param registryJson - The schema registry as a JSON string
   * @returns Whether the import was successful
   */
  importRegistry(registryJson: string): boolean {
    try {
      const data = JSON.parse(registryJson) as SchemaRegistryData;

      // Validate the registry data
      if (!data.schemaVersions || !data.latestVersions || !data.lastUpdated) {
        throw new Error('Invalid registry data structure');
      }

      this.schemaRegistryData = data;
      this.saveRegistry();

      logger.info('Schema registry imported successfully');
      return true;
    } catch (error) {
      logger.error(`Failed to import schema registry: ${error}`);
      return false;
    }
  }
}

// Export singleton instance
export const schemaVersionControl = new SchemaVersionControl();
