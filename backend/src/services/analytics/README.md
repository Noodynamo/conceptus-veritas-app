# Analytics Schema Versioning System

This directory contains the analytics schema versioning system for the Conceptus Veritas application. The system provides tools for managing and versioning analytics event schemas, tracking changes, and handling migrations between schema versions.

## Key Components

- **Schema Registry**: Central repository of all schema versions
- **Schema Versioning**: Semantic versioning for all analytics schemas
- **Schema Migration**: Tools for migrating data between schema versions
- **Change Tracking**: Comprehensive changelog for all schema changes
- **CLI Tool**: Command-line interface for managing schemas and migrations

## Directory Structure

- `analytics.constants.ts`: Constants including the current analytics version
- `schemas/`: JSON schema definitions for different event types and versions
- `migrations/`: Migration scripts for transforming data between schema versions
- `schema-registry.json`: Registry of all schema versions and migrations
- `schema-registry.ts`: Schema registry management utilities
- `schema-version-control.ts`: Version control utilities for schemas
- `schema-migrations.ts`: Schema migration management utilities
- `schema-cli.ts`: CLI tool for managing schemas and migrations
- `CHANGELOG.md`: Detailed changelog of analytics schema changes

## Schema Versioning Guidelines

The system follows semantic versioning principles:

- **MAJOR**: Breaking changes that require updates to downstream systems
- **MINOR**: Non-breaking additions to schemas or new events
- **PATCH**: Bug fixes or changes that don't affect schema structure

## Using the CLI Tool

The schema CLI tool provides utilities for managing analytics schemas:

```bash
# List all registered schemas and versions
npx ts-node schema-cli.ts list

# Scan the schemas directory and update the registry
npx ts-node schema-cli.ts scan

# Create a new schema interactively
npx ts-node schema-cli.ts create

# Create a migration between schema versions
npx ts-node schema-cli.ts migrate

# Show schema migration history
npx ts-node schema-cli.ts history

# Export schema registry to file
npx ts-node schema-cli.ts export -o registry.json

# Import schema registry from file
npx ts-node schema-cli.ts import -i registry.json
```

## Adding a New Schema

1. Create a new schema JSON file in the `schemas/` directory with the naming convention `[schema-name]-v1.json`
2. Define the schema properties, including name, version, description, and property definitions
3. Register the schema using the CLI tool: `npx ts-node schema-cli.ts scan`

## Creating a Schema Migration

When a schema needs to change:

1. Create a new version of the schema JSON file in the `schemas/` directory with the naming convention `[schema-name]-v[version].json`
2. Use the CLI tool to create a migration script: `npx ts-node schema-cli.ts migrate`
3. Select the schema to migrate, the source version, target version, and provide a description
4. Define the migration logic to transform data from the old schema to the new schema
5. Test the migration by loading and transforming sample data

## Schema Migration Best Practices

- Always provide backward compatibility for non-breaking changes
- Document all changes in the CHANGELOG.md file
- Include clear descriptions of changes in migration scripts
- Test migrations thoroughly with representative data
- Flag breaking changes appropriately to ensure downstream systems are updated

## Schema Registry Structure

The schema registry maintains the following information:

- All schema versions for each schema name
- Latest version for each schema
- Migration history including:
  - Source and target versions
  - Migration date
  - Change descriptions
  - Breaking change flags

## Integration with Analytics Service

The analytics service uses the schema registry to:

1. Validate incoming events against the appropriate schema version
2. Transform data between schema versions when needed
3. Track schema versions used for events
4. Ensure consistent analytics data structure across the application
