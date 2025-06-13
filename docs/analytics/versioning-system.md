# Analytics Schema Versioning System

## Overview

The Analytics Schema Versioning System provides a robust mechanism for managing the evolution of analytics event schemas over time. It enables backward compatibility, proper documentation, and schema validation to ensure data consistency across the application.

## Key Features

- **Schema Versioning**: Track and manage different versions of event schemas
- **Schema Migration**: Update schemas while maintaining backward compatibility
- **Validation**: Ensure events conform to defined schema specifications
- **Documentation Generation**: Automatically generate documentation for all schema versions
- **Registry Management**: Central registry of all schema versions and their relationships

## Architecture

The system consists of the following components:

1. **Schema Registry**: Central repository of all schema definitions and their versions
2. **Schema Management Script**: PowerShell utility for schema operations
3. **Schema Validator**: Runtime validation of events against schemas
4. **Schema Documentation**: Auto-generated documentation of all event schemas
5. **Analytics Service Integration**: Seamless integration with the app's analytics service

## Schema Structure

Each schema follows a standard JSON Schema format with additional metadata:

```json
{
  "name": "user_interaction_event",
  "version": 1,
  "description": "Schema for tracking user interactions with the application",
  "changes": "Initial version",
  "properties": {
    "userId": {
      "type": "string",
      "description": "Unique identifier for the user"
    },
    "action": {
      "type": "string",
      "description": "The action performed by the user",
      "enum": ["click", "view", "scroll", "submit"]
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "When the event occurred"
    },
    "context": {
      "type": "object",
      "description": "Additional contextual information",
      "properties": {
        "page": {
          "type": "string",
          "description": "Page where the event occurred"
        },
        "component": {
          "type": "string",
          "description": "UI component involved"
        }
      }
    }
  },
  "required": ["userId", "action", "timestamp"]
}
```

## Schema Versioning Process

When updating a schema, follow these steps:

1. Create a new version by incrementing the version number
2. Document changes in the "changes" field
3. Maintain backward compatibility where possible
4. Validate the new schema
5. Update the schema registry

## Backward Compatibility Guidelines

To maintain backward compatibility:

- Never remove required fields
- Only add optional fields
- Don't change field types
- Don't narrow field constraints (e.g., enum values)
- Use sensible defaults for new fields

## Usage

### Schema Management Script

The `analytics-schema-manager.ps1` script provides the following operations:

#### Initialize Registry

```powershell
./analytics-schema-manager.ps1 -Command init
```

Creates a new schema registry if one doesn't exist.

#### Validate Schema

```powershell
./analytics-schema-manager.ps1 -Command validate -SchemaFile ./schemas/user-event-v1.json
```

Validates that a schema file meets all requirements.

#### Migrate Schema

```powershell
./analytics-schema-manager.ps1 -Command migrate -SchemaFile ./schemas/user-event-v1.json -Version 2
```

Creates a new version of an existing schema.

#### Generate Documentation

```powershell
./analytics-schema-manager.ps1 -Command document -OutputDir ./docs/analytics
```

Generates markdown documentation for all schemas in the registry.

### Analytics Service Integration

The schema versioning system integrates with the analytics service through:

1. **Validation Middleware**: Validates events against the appropriate schema version
2. **Schema Loader**: Loads schema definitions at runtime
3. **Version Negotiation**: Determines which schema version to use for validation

## Example Workflow

1. Create initial event schema (v1)
2. Deploy and collect events using v1 schema
3. When changes are needed, create v2 schema
4. Deploy backend changes to support both v1 and v2
5. Update clients to emit v2 events
6. Once all clients are updated, deprecate v1 (but maintain compatibility)

## Best Practices

- Always increment version numbers sequentially
- Document all changes between versions
- Run validation on all events before processing
- Keep schemas focused and specific to event types
- Use schema documentation to assist developers

## Development Guidelines

- Add new schemas through the schema management script
- Test backward compatibility with previous versions
- Follow the naming convention: `{event_type}-v{version}.json`
- Include example values in schema documentation
- Update the analytics service when adding new schema versions

## Troubleshooting

Common issues and their solutions:

- **Schema Validation Errors**: Ensure events match the schema definition
- **Missing Schema Version**: Check if the schema exists in the registry
- **Incompatible Changes**: Review backward compatibility guidelines
- **Documentation Issues**: Re-run the documentation generator

## Future Enhancements

- Schema deprecation management
- Automated migration testing
- Client-side schema validation
- Schema evolution metrics
- Visual schema comparison tool 