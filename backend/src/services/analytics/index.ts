// Export analytics service
export { analyticsService, AnalyticsService } from './analytics.service';

// Export schema registry and related types
export { 
  SchemaRegistry, 
  EventSchema, 
  PropertyType,
  PropertySchema,
  ValidationResult 
} from './schema-registry';

// Export event schemas and categories
export { allSchemas, userSchemas, contentSchemas, navigationSchemas, systemSchemas } from './event-schemas';
export { EventCategory, ANALYTICS_VERSION } from './analytics.constants';

// Export registry initialization utilities
export { initializeRegistry, createInitializedRegistry } from './registry-init'; 