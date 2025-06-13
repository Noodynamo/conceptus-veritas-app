#!/usr/bin/env node
/**
 * Analytics Schema Documentation Generator
 *
 * This script generates Markdown documentation from analytics schema files.
 * It creates comprehensive documentation of all event schemas, their properties,
 * and version history.
 */
import fs from 'fs';
import path from 'path';
import { schemaVersionControl } from './schema-version-control';
import { logger } from '../../utils/logger';
import { ANALYTICS_VERSION } from './analytics.constants';

// Output directory for documentation
const docsDir = path.join(__dirname, '../../../../docs/analytics/schemas');

/**
 * Generate documentation for all schemas
 */
async function generateDocs(): Promise<void> {
  try {
    // Create docs directory if it doesn't exist
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
      logger.info(`Created docs directory at ${docsDir}`);
    }

    // Get all schemas
    const schemas = schemaVersionControl.getAllSchemas();

    if (schemas.length === 0) {
      logger.warn('No schemas found to document');
      return;
    }

    // Generate index file
    generateIndexFile(schemas);

    // Generate documentation for each schema
    for (const schemaName of schemas) {
      generateSchemaDoc(schemaName);
    }

    logger.info(`Documentation generated successfully in ${docsDir}`);
  } catch (error) {
    logger.error(`Failed to generate documentation: ${error}`);
  }
}

/**
 * Generate index file listing all schemas
 */
function generateIndexFile(schemas: string[]): void {
  const indexPath = path.join(docsDir, 'README.md');

  let content = `# Analytics Event Schemas\n\n`;
  content += `*Generated on: ${new Date().toISOString()}*\n\n`;
  content += `Current Analytics Version: **${ANALYTICS_VERSION}**\n\n`;

  content += `## Available Schemas\n\n`;

  for (const schemaName of schemas) {
    const latestVersion = schemaVersionControl.getLatestVersion(schemaName);
    content += `- [${schemaName}](${schemaName}.md) (latest: v${latestVersion})\n`;
  }

  fs.writeFileSync(indexPath, content, 'utf-8');
  logger.info(`Generated index file at ${indexPath}`);
}

/**
 * Generate documentation for a specific schema
 */
function generateSchemaDoc(schemaName: string): void {
  try {
    const schemaPath = path.join(docsDir, `${schemaName}.md`);
    const versions = schemaVersionControl.getAllVersions(schemaName);
    const latestVersion = schemaVersionControl.getLatestVersion(schemaName);
    const migrations = schemaVersionControl.getMigrationHistory(schemaName);

    // Read the latest schema file
    const latestSchemaFile = path.join(
      __dirname,
      'schemas',
      `${schemaName}-v${latestVersion}.json`
    );
    if (!fs.existsSync(latestSchemaFile)) {
      logger.warn(`Schema file not found: ${latestSchemaFile}`);
      return;
    }

    const schemaData = JSON.parse(fs.readFileSync(latestSchemaFile, 'utf-8'));

    let content = `# ${schemaName}\n\n`;
    content += `*Current Version: ${latestVersion}*\n\n`;
    content += `${schemaData.description}\n\n`;

    // Event Details
    content += `## Event Details\n\n`;
    content += `| Field | Value |\n`;
    content += `| ----- | ----- |\n`;
    content += `| Name | \`${schemaName}\` |\n`;
    content += `| Latest Version | ${latestVersion} |\n`;
    content += `| Description | ${schemaData.description} |\n`;

    // Required Properties
    content += `\n## Required Properties\n\n`;
    if (schemaData.required && schemaData.required.length > 0) {
      content += `The following properties are required for this event:\n\n`;
      content += `- ${schemaData.required.join('\n- ')}\n`;
    } else {
      content += `No required properties specified.\n`;
    }

    // Properties
    content += `\n## Properties\n\n`;
    content += `| Property | Type | Description | Example |\n`;
    content += `| -------- | ---- | ----------- | ------- |\n`;

    for (const [propName, propSchema] of Object.entries(schemaData.properties)) {
      const propData = propSchema as any;
      const required = schemaData.required?.includes(propName) ? '(required)' : '';
      content += `| \`${propName}\` ${required} | ${propData.type} | ${propData.description} | \`${propData.example || ''}\` |\n`;

      // If this is an object type with nested properties
      if (propData.type === 'object' && propData.properties) {
        for (const [nestedPropName, nestedPropSchema] of Object.entries(propData.properties)) {
          const nestedPropData = nestedPropSchema as any;
          content += `| &nbsp;&nbsp;\`${propName}.${nestedPropName}\` | ${nestedPropData.type} | ${nestedPropData.description} | \`${nestedPropData.example || ''}\` |\n`;
        }
      }
    }

    // Version History
    content += `\n## Version History\n\n`;
    content += `| Version | Changes | Breaking | Date |\n`;
    content += `| ------- | ------- | -------- | ---- |\n`;

    // Add initial version
    const initialVersion = versions[0];
    const initialSchemaFile = path.join(
      __dirname,
      'schemas',
      `${schemaName}-v${initialVersion}.json`
    );
    if (fs.existsSync(initialSchemaFile)) {
      const initialSchemaData = JSON.parse(fs.readFileSync(initialSchemaFile, 'utf-8'));
      content += `| ${initialVersion} | ${initialSchemaData.changes || 'Initial version'} | No | - |\n`;
    }

    // Add migration history
    for (const migration of migrations) {
      const date = new Date(migration.migrationDate).toISOString().split('T')[0];
      content += `| ${migration.toVersion} | ${migration.changes} | ${migration.isBreaking ? 'Yes' : 'No'} | ${date} |\n`;
    }

    // Usage Examples
    content += `\n## Usage Examples\n\n`;
    content += `### Frontend\n\n`;
    content += '```typescript\n';
    content += `import { useAnalytics } from '../../hooks/useAnalytics';\n\n`;
    content += `// Inside your component\n`;
    content += `const { trackEvent } = useAnalytics();\n\n`;
    content += `// Track this event\n`;
    content += `trackEvent('${schemaName}', {\n`;

    // Add example properties
    for (const [propName, propSchema] of Object.entries(schemaData.properties)) {
      const propData = propSchema as any;
      if (propData.example !== undefined) {
        if (typeof propData.example === 'string') {
          content += `  ${propName}: '${propData.example}',\n`;
        } else {
          content += `  ${propName}: ${JSON.stringify(propData.example)},\n`;
        }
      }
    }

    content += `});\n`;
    content += '```\n\n';

    content += `### Backend\n\n`;
    content += '```typescript\n';
    content += `import { analyticsService } from '../../services/analytics';\n\n`;
    content += `// Track this event\n`;
    content += `analyticsService.track(\n`;
    content += `  '${schemaName}',\n`;
    content += `  {\n`;

    // Add example properties
    for (const [propName, propSchema] of Object.entries(schemaData.properties)) {
      const propData = propSchema as any;
      if (propData.example !== undefined) {
        if (typeof propData.example === 'string') {
          content += `    ${propName}: '${propData.example}',\n`;
        } else {
          content += `    ${propName}: ${JSON.stringify(propData.example)},\n`;
        }
      }
    }

    content += `  },\n`;
    content += `  'user-123' // distinctId\n`;
    content += `);\n`;
    content += '```\n';

    fs.writeFileSync(schemaPath, content, 'utf-8');
    logger.info(`Generated schema documentation at ${schemaPath}`);
  } catch (error) {
    logger.error(`Failed to generate documentation for schema ${schemaName}: ${error}`);
  }
}

// Run the generator
generateDocs()
  .then(() => {
    console.log('Documentation generation complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Documentation generation failed:', error);
    process.exit(1);
  });
