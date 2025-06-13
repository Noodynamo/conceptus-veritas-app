# Analytics Tracking Schema and Versioning

This document outlines the analytics tracking system used in the Conceptus Veritas application, including schema structure, versioning guidelines, and implementation details.

## Table of Contents
1. [Overview](#overview)
2. [Schema Versioning](#schema-versioning)
3. [Event Naming Conventions](#event-naming-conventions)
4. [Schema Structure](#schema-structure)
5. [Versioning Workflow](#versioning-workflow)
6. [Database Tables](#database-tables)
7. [Tracking Implementation](#tracking-implementation)
8. [Best Practices](#best-practices)
9. [Changelog](#changelog)

## Overview

The analytics tracking system is built around PostHog for event collection and analysis. The system includes:

- **Event schema validation**: Type checking and validation of event properties
- **Versioned schemas**: Semantic versioning for tracking schema changes
- **Database record**: Persistent storage of schema versions and changes
- **Change management**: Scripts to manage schema updates and migrations

## Schema Versioning

All analytics schema changes follow [semantic versioning](https://semver.org/) (MAJOR.MINOR.PATCH):

- **MAJOR (x.0.0)**: Breaking changes that require updates to downstream systems (dashboards, reports)
- **MINOR (0.x.0)**: Non-breaking additions of new events or properties
- **PATCH (0.0.x)**: Bug fixes or changes that don't affect the schema structure

The current schema version is stored in `backend/src/services/analytics/analytics.constants.ts`.

## Event Naming Conventions

All event names must follow these conventions:

1. Prefix with `ph_` (for PostHog)
2. Use kebab-case format (e.g., `ph_user-login`)
3. Group related events under common prefixes (e.g., `ph_user-*`, `ph_content-*`)
4. Be descriptive but concise

Event categories include:
- `user`: User-related events like signup, login, settings changes
- `content`: Content interaction events like viewing, liking, sharing
- `navigation`: Screen views, searches, and navigation actions
- `system`: System events, errors, and performance metrics

## Schema Structure

Each event schema defines:

- **name**: The event name (required)
- **version**: Schema version (required)
- **description**: Human-readable description (required)
- **category**: Event category (required)
- **properties**: Object defining event properties and their types (required)
  - Each property has a type, description, and validation rules
  - Common property types: string, number, boolean, object, array
  - Properties can be marked as required or optional

Example event schema:

```typescript
new EventSchema({
  name: 'ph_user-signup',
  version: '1.0.0',
  description: 'Fired when a user completes the signup process',
  category: EventCategory.USER,
  properties: {
    method: {
      type: PropertyType.STRING,
      required: true,
      enum: ['email', 'google', 'apple', 'facebook'],
      description: 'The signup method used'
    },
    user_id: {
      type: PropertyType.STRING,
      required: true,
      description: 'Unique identifier for the user'
    }
  }
});
```

## Versioning Workflow

When making changes to analytics tracking:

1. Determine the type of change (major, minor, patch)
2. Run the update script with the new version:
   ```
   node scripts/update-analytics-schema.js --version 1.1.0 --description "Added new user onboarding events"
   ```
3. The script will:
   - Update the version in `analytics.constants.ts`
   - Add a changelog entry in `event-schemas.ts`
   - Create a database migration file
   - Commit the changes to Git

4. Run the database migration:
   ```
   npm run migrations:up
   ```

5. Test the changes thoroughly

## Database Tables

The analytics schema is tracked in three database tables:

1. **analytics_schema_versions**: Records each schema version
   - `id`: Primary key
   - `version`: Semantic version number
   - `description`: Change description
   - `is_current`: Boolean flag for current version
   - `created_at`: Timestamp
   - `created_by`: User who created the version

2. **analytics_event_schemas**: Stores event schema definitions
   - `id`: Primary key
   - `schema_version_id`: Foreign key to schema version
   - `event_name`: Name of the event
   - `event_version`: Version of this specific event
   - `category`: Event category
   - `description`: Description of the event
   - `schema_definition`: JSON schema definition
   - `is_deprecated`: Flag for deprecated events
   - `deprecated_reason`: Reason for deprecation
   - `replaced_by`: Reference to replacement event

3. **analytics_schema_changes**: Logs all schema changes
   - `id`: Primary key
   - `event_schema_id`: Foreign key to event schema
   - `change_type`: Type of change (add, modify, deprecate)
   - `description`: Description of the change
   - `previous_value`: Previous schema state (JSON)
   - `new_value`: New schema state (JSON)
   - `created_at`: Timestamp
   - `created_by`: User who made the change

## Tracking Implementation

To track events in the application:

```typescript
import { analyticsService } from 'src/services/analytics';

// Track an event
analyticsService.track(
  'ph_user-login',
  { 
    method: 'email',
    success: true
  },
  'user-123', // distinctId
  { org: 'org-456' } // optional groups
);
```

The service will:
1. Validate the event against its schema
2. Enrich with standard properties (app name, environment, etc.)
3. Send to PostHog

## Best Practices

1. **Privacy First**: Never include PII (Personally Identifiable Information) in events without hashing
2. **Validation**: Always validate events against their schemas
3. **Selective Tracking**: Track only what's needed for analysis, not everything
4. **Documentation**: Update this document when making schema changes
5. **Testing**: Test tracking implementation in development environment
6. **Sampling**: Keep volume below 10k events/user/day

## Changelog

- **v1.0.0** (2024-07-01): Initial version with core event schemas
  - Added user events: login, signup, logout
  - Added content events: view, interaction
  - Added navigation events: screen view, search
  - Added system events: error, performance 