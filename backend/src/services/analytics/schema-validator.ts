/**
 * Schema validator service for analytics events
 * Temporary mock implementation until dependencies are resolved
 */

import { logger } from '../../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface for schema registry
 */
interface SchemaRegistry {
  schemaVersions: Record<string, number[]>;
  latestVersions: Record<string, number>;
  migrations: Record<string, any>;
  lastUpdated: string;
}

/**
 * Interface for validation result
 */
interface ValidationResult {
  valid: boolean;
  errors?: any[];
  schemaVersion?: number;
}

/**
 * Mock schema validator service - placeholder until Ajv can be installed
 */
export class SchemaValidator {
  private registry: SchemaRegistry;
  private schemas: Record<string, Record<number, any>> = {};
  
  constructor(
    private schemaDir: string = './src/services/analytics/schemas',
    private registryPath: string = './src/services/analytics/schema-registry.json'
  ) {
    // Initialize with empty registry
    this.registry = {
      schemaVersions: {},
      latestVersions: {},
      migrations: {},
      lastUpdated: new Date().toISOString()
    };
    
    this.loadRegistry();
    this.loadSchemas();
  }
  
  /**
   * Load the schema registry file
   */
  private loadRegistry(): void {
    try {
      const registryContent = this.readFile(this.registryPath);
      if (registryContent) {
        this.registry = JSON.parse(registryContent);
        logger.info(`Loaded analytics schema registry with ${Object.keys(this.registry.latestVersions).length} event types`);
      }
    } catch (error) {
      logger.error('Failed to load schema registry', { error });
    }
  }
  
  /**
   * Helper method to safely read file with fs module
   */
  private readFile(filePath: string): string | null {
    try {
      // Using a try-catch block to handle errors or module imports
      // This is a hacky way to handle missing fs module in dev environment
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      logger.warn(`Could not read file: ${filePath}`, { error });
      return null;
    }
  }
  
  /**
   * Load all schemas from the schemas directory
   */
  private loadSchemas(): void {
    try {
      // For each schema type in the registry
      Object.keys(this.registry.schemaVersions).forEach(schemaName => {
        this.schemas[schemaName] = {};
        
        // For each version of the schema
        this.registry.schemaVersions[schemaName].forEach(version => {
          try {
            const schemaPath = path.join(this.schemaDir, `${schemaName}-v${version}.json`);
            const schemaContent = this.readFile(schemaPath);
            
            if (schemaContent) {
              this.schemas[schemaName][version] = JSON.parse(schemaContent);
              logger.debug(`Loaded schema ${schemaName} v${version}`);
            }
          } catch (schemaError) {
            logger.error(`Failed to load schema ${schemaName} v${version}`, { schemaError });
          }
        });
      });
      
      logger.info('Analytics schemas loaded successfully');
    } catch (error) {
      logger.error('Failed to load schemas', { error });
    }
  }
  
  /**
   * Mock validator function - just checks if required fields are present
   * This is a placeholder until Ajv is installed
   */
  private mockValidate(schema: any, data: any): { valid: boolean; errors?: any[] } {
    if (!schema || !data) {
      return { valid: false, errors: [{ message: 'Missing schema or data' }] };
    }
    
    // Check required fields
    if (schema.required && Array.isArray(schema.required)) {
      for (const requiredField of schema.required) {
        if (data[requiredField] === undefined) {
          return { 
            valid: false, 
            errors: [{ message: `Missing required field: ${requiredField}` }] 
          };
        }
      }
    }
    
    // Check types for the provided fields
    if (schema.properties) {
      for (const fieldName of Object.keys(data)) {
        const fieldDef = schema.properties[fieldName];
        if (!fieldDef) continue;
        
        const value = data[fieldName];
        const type = fieldDef.type;
        
        if (type === 'string' && typeof value !== 'string') {
          return { 
            valid: false, 
            errors: [{ message: `Field ${fieldName} should be a string` }] 
          };
        }
        
        if (type === 'number' && typeof value !== 'number') {
          return { 
            valid: false, 
            errors: [{ message: `Field ${fieldName} should be a number` }] 
          };
        }
        
        if (type === 'boolean' && typeof value !== 'boolean') {
          return { 
            valid: false, 
            errors: [{ message: `Field ${fieldName} should be a boolean` }] 
          };
        }
        
        if (type === 'object' && typeof value !== 'object') {
          return { 
            valid: false, 
            errors: [{ message: `Field ${fieldName} should be an object` }] 
          };
        }
        
        if (type === 'array' && !Array.isArray(value)) {
          return { 
            valid: false, 
            errors: [{ message: `Field ${fieldName} should be an array` }] 
          };
        }
      }
    }
    
    return { valid: true };
  }
  
  /**
   * Validate an event against its schema
   * @param eventType The type of event to validate
   * @param eventData The event data to validate
   * @param version Optional specific version to validate against
   * @returns Validation result with status and any errors
   */
  public validate(eventType: string, eventData: any, version?: number): ValidationResult {
    // If no specific version provided, use latest
    const versionToUse = version || this.getLatestVersion(eventType);
    
    if (!versionToUse) {
      logger.warn(`No schema found for event type: ${eventType}`);
      return { valid: false, errors: [{ message: `No schema found for event type: ${eventType}` }] };
    }
    
    // Get schema for this version
    const schema = this.getSchema(eventType, versionToUse);
    
    if (!schema) {
      logger.warn(`No schema found for ${eventType} v${versionToUse}`);
      return { valid: false, errors: [{ message: `No schema found for ${eventType} v${versionToUse}` }] };
    }
    
    // Use mock validation
    const result = this.mockValidate(schema, eventData);
    
    if (!result.valid) {
      return {
        valid: false,
        errors: result.errors,
        schemaVersion: versionToUse
      };
    }
    
    return {
      valid: true,
      schemaVersion: versionToUse
    };
  }
  
  /**
   * Get the latest version number for a schema type
   * @param eventType The event type
   * @returns The latest version number or null if not found
   */
  public getLatestVersion(eventType: string): number | null {
    return this.registry.latestVersions[eventType] || null;
  }
  
  /**
   * Get all available versions for a schema type
   * @param eventType The event type
   * @returns Array of available versions or empty array if none
   */
  public getAvailableVersions(eventType: string): number[] {
    return this.registry.schemaVersions[eventType] || [];
  }
  
  /**
   * Get a specific schema by type and version
   * @param eventType The event type
   * @param version The version number
   * @returns The schema object or null if not found
   */
  public getSchema(eventType: string, version: number): any | null {
    return this.schemas[eventType]?.[version] || null;
  }
  
  /**
   * Get all schema types in the registry
   * @returns Array of schema type names
   */
  public getSchemaTypes(): string[] {
    return Object.keys(this.registry.latestVersions);
  }
  
  /**
   * Reload schemas from disk
   * Useful when schemas have been updated
   */
  public reloadSchemas(): void {
    this.loadRegistry();
    this.loadSchemas();
  }
}

// Export singleton instance
export const schemaValidator = new SchemaValidator(); 