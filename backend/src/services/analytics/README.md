# Analytics Schema Versioning System

This directory contains the analytics schema versioning system for the Conceptus Veritas application. The system provides tools for managing and versioning analytics event schemas, tracking changes, and handling migrations between schema versions.

## Key Components

- **Schema Registry**: Central repository of all schema versions
- **Schema Versioning**: Semantic versioning for all analytics schemas
- **Schema Migration**: Tools for migrating data between schema versions
- **Change Tracking**: Comprehensive changelog for all schema changes
- **CLI Tool**: Command-line interface for managing schemas and migrations
- **Documentation Generator**: Automatic documentation generation for schemas
- **Auto-Migration**: Automatic migration of schemas when versions change

## Directory Structure

- `analytics.constants.ts`: Constants including the current analytics version
- `analytics.service.ts`: Main analytics service for tracking events
- `schemas/`: JSON schema definitions for different event types and versions
- `migrations/`: Migration scripts for transforming data between schema versions
- `schema-registry.json`: Registry of all schema versions and migrations
- `schema-registry.ts`: Schema registry management utilities
- `schema-version-control.ts`: Version control utilities for schemas
- `schema-migrations.ts`: Schema migration management utilities
- `schema-cli.ts`: CLI tool for managing schemas and migrations
- `generate-docs.ts`: Documentation generator for schemas
- `auto-migrate.ts`: Auto-migration script for schema versions
- `CHANGELOG.md`: Detailed changelog of analytics schema changes

## Schema Versioning Guidelines

The system follows semantic versioning principles:

- **MAJOR**: Breaking changes that require updates to downstream systems
- **MINOR**: Non-breaking additions to schemas or new events
- **PATCH**: Bug fixes or changes that don't affect schema structure

## Getting Started

### Installation

The analytics versioning system is part of the backend service and is installed automatically when you install the backend dependencies.

```bash
# From the backend directory
npm install
```

### Using the CLI Tool

The schema CLI tool provides utilities for managing analytics schemas:

```bash
# List all registered schemas and versions
npm run analytics:cli list

# Scan the schemas directory and update the registry
npm run analytics:cli scan

# Create a new schema interactively
npm run analytics:cli create

# Create a migration between schema versions
npm run analytics:cli migrate

# Show schema migration history
npm run analytics:cli history
```

### Generating Documentation

To generate documentation for all schemas:

```bash
npm run analytics:docs
```

This will create Markdown documentation in the `docs/analytics/schemas` directory.

### Auto-Migration

To automatically apply migrations when schema versions change:

```bash
npm run analytics:migrate
```

## Creating a New Schema

1. Create a new schema file in the `schemas` directory:

```json
{
  "name": "ph_event_name",
  "version": 1,
  "description": "Schema for tracking...",
  "changes": "Initial version",
  "category": "user",
  "properties": {
    "userId": {
      "type": "string",
      "description": "Unique identifier for the user",
      "example": "user_12345"
    }
    // Add more properties as needed
  },
  "required": ["userId"]
}
```

2. Update the schema registry:

```bash
npm run analytics:cli scan
```

## Creating a Schema Migration

When you need to update a schema:

1. Create a new version of the schema file in the `schemas` directory
2. Use the CLI to create a migration script:

```bash
npm run analytics:cli migrate
```

3. Follow the interactive prompts to create the migration
4. Update the schema registry:

```bash
npm run analytics:cli scan
```

## Using the Analytics Service

To track events in the application:

```typescript
import { analyticsService } from 'src/services/analytics';

// Track an event
analyticsService.track(
  'ph_user_signup',
  {
    method: 'email',
    referrer: 'homepage',
  },
  'user-123', // distinctId
  { org: 'org-456' } // optional groups
);
```

## Best Practices

1. **Naming Conventions**:

   - All event names should be prefixed with `ph_`
   - Use kebab-case for event names (e.g., `ph_user-signup`)
   - Use descriptive names that indicate the action being tracked

2. **Schema Design**:

   - Include a `userId` property in all user-related events
   - Include a `timestamp` property in all events
   - Use consistent property names across schemas
   - Document all properties with descriptions and examples

3. **Versioning**:

   - Increment the version number in `analytics.constants.ts` when making changes
   - Document all changes in `CHANGELOG.md`
   - Create migration scripts for breaking changes
   - Test migrations thoroughly before deploying

4. **Privacy**:
   - Never include PII (Personally Identifiable Information) in events
   - Use pseudonymous identifiers instead of personal information
   - Follow data minimization principles

## Database Schema

The analytics schema is tracked in three database tables:

1. **analytics_schema_versions**: Records each schema version
2. **analytics_event_schemas**: Stores event schema definitions
3. **analytics_schema_changes**: Logs all schema changes

## Troubleshooting

If you encounter issues with the analytics versioning system:

1. Check the schema registry file (`schema-registry.json`) for consistency
2. Ensure all schema files follow the correct naming convention
3. Verify that migration scripts are correctly implemented
4. Check the database tables for any inconsistencies
5. Run the CLI tool with the `scan` command to update the registry
