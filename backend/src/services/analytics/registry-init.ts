import { logger } from '../../utils/logger';
import { SchemaRegistry } from './schema-registry';
import { allSchemas } from './event-schemas';

/**
 * Initialize the schema registry with all defined schemas
 * 
 * @param registry - The schema registry to initialize
 */
export const initializeRegistry = (registry: SchemaRegistry): void => {
  logger.info('Initializing analytics schema registry');
  
  try {
    // Register all schemas
    for (const schema of allSchemas) {
      registry.registerSchema(schema);
    }
    
    logger.info(`Successfully registered ${allSchemas.length} event schemas`);
  } catch (error) {
    logger.error('Failed to initialize analytics schema registry:', error);
  }
};

/**
 * Create and initialize a new schema registry
 * 
 * @returns Initialized schema registry
 */
export const createInitializedRegistry = (): SchemaRegistry => {
  const registry = new SchemaRegistry();
  initializeRegistry(registry);
  return registry;
}; 