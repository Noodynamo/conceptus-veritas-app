import axios from 'axios';
import { PostHog } from 'posthog-node';
import { getEnvOrDefault } from '../../utils/env';
import { logger } from '../../utils/logger';
import { ANALYTICS_VERSION } from './analytics.constants';
import { EventSchema, SchemaRegistry } from './schema-registry';

/**
 * Analytics Service
 * 
 * Provides a centralized interface for sending events to PostHog analytics
 * with schema validation, versioning, and tracking capabilities.
 */
export class AnalyticsService {
  private client: PostHog | null = null;
  private schemaRegistry: SchemaRegistry;
  private enabled: boolean;
  private applicationName: string;
  private environment: string;

  constructor() {
    const apiKey = getEnvOrDefault('POSTHOG_API_KEY', '');
    const hostUrl = getEnvOrDefault('POSTHOG_HOST', 'https://app.posthog.com');
    this.environment = getEnvOrDefault('NODE_ENV', 'development');
    this.applicationName = getEnvOrDefault('APP_NAME', 'conceptus-veritas');
    this.enabled = apiKey.length > 0;
    
    if (this.enabled) {
      this.client = new PostHog(apiKey, {
        host: hostUrl,
        flushAt: 10, // Flush after 10 events
        flushInterval: 10000, // Flush every 10 seconds
      });
      
      logger.info(`Analytics service initialized with PostHog (version: ${ANALYTICS_VERSION})`);
    } else {
      logger.warn('Analytics service disabled: POSTHOG_API_KEY not provided');
    }
    
    // Initialize schema registry
    this.schemaRegistry = new SchemaRegistry();
  }

  /**
   * Track an event
   * 
   * @param eventName - The name of the event (should be prefixed with ph_)
   * @param properties - Event properties (will be validated against schema)
   * @param distinctId - Unique identifier for the user
   * @param groups - Optional grouping parameters
   * @returns boolean indicating if the event was tracked successfully
   */
  async track(
    eventName: string,
    properties: Record<string, any>,
    distinctId: string,
    groups?: Record<string, string>
  ): Promise<boolean> {
    if (!this.enabled || !this.client) {
      return false;
    }

    // Validate event name format
    if (!eventName.startsWith('ph_')) {
      logger.warn(`Event name does not follow ph_ prefix convention: ${eventName}`);
    }
    
    try {
      // Add standard properties
      const enrichedProperties = {
        ...properties,
        app_name: this.applicationName,
        environment: this.environment,
        schema_version: ANALYTICS_VERSION,
        timestamp: new Date().toISOString()
      };

      // Validate against schema if available
      const schema = this.schemaRegistry.getSchema(eventName);
      if (schema) {
        const validationResult = schema.validate(enrichedProperties);
        if (!validationResult.isValid) {
          logger.error(`Schema validation failed for event ${eventName}:`, validationResult.errors);
          
          // Log the schema violation for later analysis
          this.logSchemaViolation(eventName, enrichedProperties, validationResult.errors);
          
          return false;
        }
      } else {
        logger.warn(`No schema found for event: ${eventName}`);
      }

      // Send event to PostHog
      this.client.capture({
        distinctId,
        event: eventName,
        properties: enrichedProperties,
        groups
      });
      
      return true;
    } catch (error) {
      logger.error(`Failed to track event ${eventName}:`, error);
      return false;
    }
  }

  /**
   * Log schema violations to a separate system for analysis and tracking
   */
  private async logSchemaViolation(
    eventName: string,
    properties: Record<string, any>,
    errors: string[]
  ): Promise<void> {
    try {
      // This could write to a database, file, or logging service
      // For now, just log to console but in production would persist
      logger.error('Analytics schema violation', {
        eventName,
        errors,
        properties,
        timestamp: new Date().toISOString(),
        schemaVersion: ANALYTICS_VERSION
      });
    } catch (error) {
      logger.error('Failed to log schema violation:', error);
    }
  }

  /**
   * Shutdown the analytics service and flush any pending events
   */
  async shutdown(): Promise<void> {
    if (this.client) {
      await this.client.flush();
      logger.info('Analytics service: flushed pending events');
    }
  }
}

// Export a singleton instance
export const analyticsService = new AnalyticsService(); 