/**
 * Migration script for user_interaction_event schema
 * From version 1 to version 2
 *
 * Adds device_info property to the schema and sets default values for existing records
 *
 * Created: 2024-06-11T00:00:00.000Z
 */
import { SchemaMigrationScript } from '../schema-migrations';

const migration: SchemaMigrationScript = {
  schemaName: 'user_interaction_event',
  fromVersion: 1,
  toVersion: 2,
  description: `Adds device_info property to user_interaction_event schema`,
  isBreaking: false,

  migrate: data => {
    // Add device_info property with default values
    if (!data.properties.device_info) {
      data.properties.device_info = {
        type: 'object',
        description: "Information about the user's device",
        properties: {
          type: {
            type: 'string',
            description: 'Device type (mobile, tablet, desktop)',
            example: 'mobile',
          },
          os: {
            type: 'string',
            description: 'Operating system',
            example: 'iOS 15.4',
          },
          browser: {
            type: 'string',
            description: 'Browser information',
            example: 'Safari 15.4',
          },
        },
      };
    }

    // Update version
    data.version = 2;

    // Update changes description
    data.changes = 'Added device_info property';

    return data;
  },
};

module.exports = migration;
