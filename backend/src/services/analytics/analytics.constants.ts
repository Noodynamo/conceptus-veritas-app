/**
 * Analytics Version
 *
 * This version number is used to track changes to the analytics schema and configuration.
 * It should be incremented whenever there are changes to the schema or tracking requirements.
 *
 * Versioning follows semantic versioning (MAJOR.MINOR.PATCH):
 * - MAJOR: Breaking changes that require changes to downstream systems (dashboards, etc.)
 * - MINOR: Non-breaking additions to event schemas or new events
 * - PATCH: Bug fixes or changes that don't affect schema or data structure
 */
export const ANALYTICS_VERSION = '1.1.0';

/**
 * Default Event Properties
 *
 * These properties are automatically added to all events
 */
export const DEFAULT_EVENT_PROPERTIES = ['app_name', 'environment', 'schema_version', 'timestamp'];

/**
 * Analytics Event Categories
 *
 * Used to group events by functionality area
 */
export enum EventCategory {
  USER = 'user',
  CONTENT = 'content',
  NAVIGATION = 'navigation',
  INTERACTION = 'interaction',
  SYSTEM = 'system',
  PERFORMANCE = 'performance',
}
