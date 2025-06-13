import { logger } from '../../utils/logger';
import { ANALYTICS_VERSION } from './analytics.constants';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Property type enum for schema definition
 */
export enum PropertyType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
  DATE = 'date',
  ANY = 'any'
}

/**
 * Property schema definition
 */
export interface PropertySchema {
  type: PropertyType;
  required?: boolean;
  description?: string;
  enum?: any[];
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: RegExp;
  arrayItemType?: PropertyType;
  properties?: Record<string, PropertySchema>;
}

/**
 * Event schema class for validating analytics events
 */
export class EventSchema {
  private name: string;
  private version: string;
  private properties: Record<string, PropertySchema>;
  private description: string;
  private category: string;
  private createdAt: Date;
  private updatedAt: Date;
  private isDeprecated: boolean;
  private deprecatedReason?: string;
  private replacedBy?: string;
  
  constructor(params: {
    name: string;
    version: string;
    properties: Record<string, PropertySchema>;
    description: string;
    category: string;
    isDeprecated?: boolean;
    deprecatedReason?: string;
    replacedBy?: string;
  }) {
    this.name = params.name;
    this.version = params.version;
    this.properties = params.properties;
    this.description = params.description;
    this.category = params.category;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.isDeprecated = params.isDeprecated || false;
    this.deprecatedReason = params.deprecatedReason;
    this.replacedBy = params.replacedBy;
  }

  /**
   * Get schema name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get schema version
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * Check if schema is deprecated
   */
  getIsDeprecated(): boolean {
    return this.isDeprecated;
  }
  
  /**
   * Validate event properties against the schema
   * 
   * @param properties - The event properties to validate
   * @returns Validation result
   */
  validate(properties: Record<string, any>): ValidationResult {
    const errors: string[] = [];
    
    // Check for required properties
    for (const [propName, propSchema] of Object.entries(this.properties)) {
      if (propSchema.required && (properties[propName] === undefined || properties[propName] === null)) {
        errors.push(`Required property '${propName}' is missing`);
        continue;
      }
      
      // Skip validation for undefined optional properties
      if (properties[propName] === undefined) {
        continue;
      }
      
      // Validate property type and constraints
      this.validateProperty(propName, properties[propName], propSchema, errors);
    }
    
    // Check for extra properties that aren't in the schema
    for (const propName of Object.keys(properties)) {
      if (this.properties[propName] === undefined) {
        logger.warn(`Unknown property '${propName}' in event '${this.name}'`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate a single property against its schema
   */
  private validateProperty(
    propName: string, 
    value: any, 
    schema: PropertySchema, 
    errors: string[]
  ): void {
    // Type validation
    switch (schema.type) {
      case PropertyType.STRING:
        if (typeof value !== 'string') {
          errors.push(`Property '${propName}' should be a string`);
          return;
        }
        
        // String-specific validations
        if (schema.minLength !== undefined && value.length < schema.minLength) {
          errors.push(`Property '${propName}' should have a minimum length of ${schema.minLength}`);
        }
        
        if (schema.maxLength !== undefined && value.length > schema.maxLength) {
          errors.push(`Property '${propName}' should have a maximum length of ${schema.maxLength}`);
        }
        
        if (schema.pattern && !schema.pattern.test(value)) {
          errors.push(`Property '${propName}' does not match the required pattern`);
        }
        
        if (schema.enum && !schema.enum.includes(value)) {
          errors.push(`Property '${propName}' should be one of: ${schema.enum.join(', ')}`);
        }
        break;
        
      case PropertyType.NUMBER:
        if (typeof value !== 'number') {
          errors.push(`Property '${propName}' should be a number`);
          return;
        }
        
        // Number-specific validations
        if (schema.minValue !== undefined && value < schema.minValue) {
          errors.push(`Property '${propName}' should be at least ${schema.minValue}`);
        }
        
        if (schema.maxValue !== undefined && value > schema.maxValue) {
          errors.push(`Property '${propName}' should be at most ${schema.maxValue}`);
        }
        break;
        
      case PropertyType.BOOLEAN:
        if (typeof value !== 'boolean') {
          errors.push(`Property '${propName}' should be a boolean`);
        }
        break;
        
      case PropertyType.OBJECT:
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          errors.push(`Property '${propName}' should be an object`);
          return;
        }
        
        // Object-specific validations
        if (schema.properties) {
          for (const [subPropName, subPropSchema] of Object.entries(schema.properties)) {
            if (subPropSchema.required && (value[subPropName] === undefined || value[subPropName] === null)) {
              errors.push(`Required property '${propName}.${subPropName}' is missing`);
              continue;
            }
            
            // Skip validation for undefined optional properties
            if (value[subPropName] === undefined) {
              continue;
            }
            
            // Validate nested property
            this.validateProperty(`${propName}.${subPropName}`, value[subPropName], subPropSchema, errors);
          }
        }
        break;
        
      case PropertyType.ARRAY:
        if (!Array.isArray(value)) {
          errors.push(`Property '${propName}' should be an array`);
          return;
        }
        
        // Array-specific validations
        if (schema.arrayItemType && schema.arrayItemType !== PropertyType.ANY) {
          for (let i = 0; i < value.length; i++) {
            const itemSchema: PropertySchema = { type: schema.arrayItemType };
            this.validateProperty(`${propName}[${i}]`, value[i], itemSchema, errors);
          }
        }
        break;
        
      case PropertyType.DATE:
        if (!(value instanceof Date) && (typeof value !== 'string' || isNaN(Date.parse(value)))) {
          errors.push(`Property '${propName}' should be a valid date`);
        }
        break;
        
      case PropertyType.ANY:
        // No validation needed
        break;
        
      default:
        errors.push(`Unknown property type for '${propName}'`);
    }
  }
}

/**
 * Schema registry for managing event schemas
 */
export class SchemaRegistry {
  private schemas: Map<string, EventSchema>;
  private version: string;
  
  constructor() {
    this.schemas = new Map();
    this.version = ANALYTICS_VERSION;
    logger.info(`Schema registry initialized with version ${this.version}`);
  }
  
  /**
   * Register a new event schema
   * 
   * @param schema - The event schema to register
   * @returns boolean indicating if registration was successful
   */
  registerSchema(schema: EventSchema): boolean {
    const name = schema.getName();
    
    if (this.schemas.has(name)) {
      logger.warn(`Schema for event '${name}' already exists and will be overwritten`);
    }
    
    this.schemas.set(name, schema);
    logger.info(`Registered schema for event '${name}' (version: ${schema.getVersion()})`);
    
    return true;
  }
  
  /**
   * Get a schema by event name
   * 
   * @param eventName - The name of the event
   * @returns The event schema or undefined if not found
   */
  getSchema(eventName: string): EventSchema | undefined {
    const schema = this.schemas.get(eventName);
    
    if (schema && schema.getIsDeprecated()) {
      logger.warn(`Using deprecated schema for event '${eventName}'`);
    }
    
    return schema;
  }
  
  /**
   * Get all registered schemas
   * 
   * @returns Array of registered event schemas
   */
  getAllSchemas(): EventSchema[] {
    return Array.from(this.schemas.values());
  }
  
  /**
   * Get registry version
   * 
   * @returns The schema registry version
   */
  getVersion(): string {
    return this.version;
  }
} 