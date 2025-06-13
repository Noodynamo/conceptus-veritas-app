#!/usr/bin/env node
/**
 * Analytics Schema CLI
 *
 * Command-line tool for managing analytics schema versions and migrations.
 * This tool helps maintain schema versioning and provides utilities for
 * creating, migrating, and validating schema definitions.
 */
import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { schemaVersionControl } from './schema-version-control';
import { schemaMigrationManager } from './schema-migrations';
import { ANALYTICS_VERSION } from './analytics.constants';

// Create command-line program
const program = new Command();

program
  .name('analytics-schema')
  .description('CLI tool for managing analytics schema versions and migrations')
  .version(ANALYTICS_VERSION);

// List command
program
  .command('list')
  .description('List all registered schemas and their versions')
  .action(() => {
    const schemas = schemaVersionControl.getAllSchemas();

    if (schemas.length === 0) {
      console.log(chalk.yellow('No schemas registered.'));
      return;
    }

    console.log(chalk.bold('Registered Schemas:'));
    for (const schema of schemas) {
      const versions = schemaVersionControl.getAllVersions(schema);
      const latest = schemaVersionControl.getLatestVersion(schema);
      console.log(
        `${chalk.cyan(schema)}: ${versions.join(', ')} ${chalk.green(`(latest: v${latest})`)}`
      );
    }
  });

// Scan command
program
  .command('scan')
  .description('Scan schema directory and update registry')
  .action(() => {
    const count = schemaVersionControl.scanAndRegisterSchemas();
    console.log(chalk.green(`Registered ${count} new schema(s)`));
  });

// Create schema command
program
  .command('create')
  .description('Create a new schema')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Schema name:',
        validate: input => (input.trim() !== '' ? true : 'Name is required'),
      },
      {
        type: 'input',
        name: 'description',
        message: 'Schema description:',
        validate: input => (input.trim() !== '' ? true : 'Description is required'),
      },
      {
        type: 'editor',
        name: 'properties',
        message: 'Define schema properties (JSON format):',
        default: `{
  "exampleProperty": {
    "type": "string",
    "description": "Example property",
    "example": "example value"
  }
}`,
      },
    ]);

    try {
      const schemaDir = path.join(__dirname, 'schemas');

      // Create schema directory if it doesn't exist
      if (!fs.existsSync(schemaDir)) {
        fs.mkdirSync(schemaDir, { recursive: true });
      }

      // Create schema file
      const schemaPath = path.join(schemaDir, `${answers.name}-v1.json`);

      const schema = {
        name: answers.name,
        version: 1,
        description: answers.description,
        changes: 'Initial version',
        properties: JSON.parse(answers.properties),
        required: [],
      };

      fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2), 'utf-8');

      // Register schema in registry
      schemaVersionControl.registerSchemaVersion(answers.name, 1);

      console.log(chalk.green(`Schema created at ${schemaPath}`));
    } catch (error) {
      console.error(chalk.red(`Failed to create schema: ${error}`));
    }
  });

// Migrate command
program
  .command('migrate')
  .description('Create a migration between schema versions')
  .action(async () => {
    const schemas = schemaVersionControl.getAllSchemas();

    if (schemas.length === 0) {
      console.log(chalk.yellow('No schemas registered. Create a schema first.'));
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'schemaName',
        message: 'Select schema to migrate:',
        choices: schemas,
      },
      {
        type: 'list',
        name: 'fromVersion',
        message: 'From version:',
        choices: answers => {
          return schemaVersionControl.getAllVersions(answers.schemaName).map(v => v.toString());
        },
      },
      {
        type: 'input',
        name: 'toVersion',
        message: 'To version:',
        default: answers => {
          const currentVersion = parseInt(answers.fromVersion, 10);
          return (currentVersion + 1).toString();
        },
        validate: (input, answers) => {
          const toVersion = parseInt(input, 10);
          const fromVersion = parseInt(answers.fromVersion, 10);

          if (isNaN(toVersion)) {
            return 'Please enter a valid number';
          }

          if (toVersion <= fromVersion) {
            return 'To version must be greater than from version';
          }

          return true;
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Migration description:',
        validate: input => (input.trim() !== '' ? true : 'Description is required'),
      },
      {
        type: 'confirm',
        name: 'isBreaking',
        message: 'Is this a breaking change?',
        default: false,
      },
      {
        type: 'editor',
        name: 'migrationLogic',
        message: 'Define migration logic:',
        default: `// Example migration logic:
// Add or transform properties as needed
if (!data.properties.newProperty) {
  data.properties.newProperty = {
    type: "string",
    description: "New property added in v2",
    example: "example value"
  };
}

// Update version
data.version = ${parseInt(answers?.toVersion || '0', 10)};

// Update changes description
data.changes = "${answers?.description || ''}";

// Return the migrated data
return data;`,
      },
    ]);

    try {
      // Create migration script
      const success = schemaMigrationManager.createMigrationScript({
        schemaName: answers.schemaName,
        fromVersion: parseInt(answers.fromVersion, 10),
        toVersion: parseInt(answers.toVersion, 10),
        description: answers.description,
        isBreaking: answers.isBreaking,
        migrationLogic: answers.migrationLogic,
      });

      if (success) {
        console.log(chalk.green(`Migration script created successfully`));
      } else {
        console.log(chalk.red(`Failed to create migration script`));
      }
    } catch (error) {
      console.error(chalk.red(`Failed to create migration: ${error}`));
    }
  });

// History command
program
  .command('history')
  .description('Show schema migration history')
  .option('-s, --schema <name>', 'Show history for specific schema')
  .action(options => {
    if (options.schema) {
      const migrations = schemaVersionControl.getMigrationHistory(options.schema);

      if (migrations.length === 0) {
        console.log(chalk.yellow(`No migration history for schema '${options.schema}'`));
        return;
      }

      console.log(chalk.bold(`Migration History for ${chalk.cyan(options.schema)}:`));

      for (const migration of migrations) {
        const date = new Date(migration.migrationDate).toLocaleDateString();
        const breakingTag = migration.isBreaking ? chalk.red('[BREAKING] ') : '';

        console.log(
          `${chalk.gray(date)} v${migration.fromVersion} → v${migration.toVersion}: ${breakingTag}${migration.changes}`
        );
      }
    } else {
      const allHistory = schemaMigrationManager.getAllMigrationHistory();
      const schemas = Object.keys(allHistory);

      if (schemas.length === 0) {
        console.log(chalk.yellow('No migration history found.'));
        return;
      }

      console.log(chalk.bold('Migration History:'));

      for (const schema of schemas) {
        const migrations = allHistory[schema];

        if (migrations.length === 0) {
          continue;
        }

        console.log(`\n${chalk.cyan(schema)}:`);

        for (const migration of migrations) {
          const date = new Date(migration.migrationDate).toLocaleDateString();
          const breakingTag = migration.isBreaking ? chalk.red('[BREAKING] ') : '';

          console.log(
            `  ${chalk.gray(date)} v${migration.fromVersion} → v${migration.toVersion}: ${breakingTag}${migration.changes}`
          );
        }
      }
    }
  });

// Export command
program
  .command('export')
  .description('Export schema registry to file')
  .option('-o, --output <file>', 'Output file path', 'schema-registry-export.json')
  .action(options => {
    try {
      const registry = schemaVersionControl.exportRegistry();
      fs.writeFileSync(options.output, registry, 'utf-8');
      console.log(chalk.green(`Schema registry exported to ${options.output}`));
    } catch (error) {
      console.error(chalk.red(`Failed to export registry: ${error}`));
    }
  });

// Import command
program
  .command('import')
  .description('Import schema registry from file')
  .requiredOption('-i, --input <file>', 'Input file path')
  .action(options => {
    try {
      const registry = fs.readFileSync(options.input, 'utf-8');
      const success = schemaVersionControl.importRegistry(registry);

      if (success) {
        console.log(chalk.green(`Schema registry imported successfully`));
      } else {
        console.log(chalk.red(`Failed to import schema registry`));
      }
    } catch (error) {
      console.error(chalk.red(`Failed to import registry: ${error}`));
    }
  });

// Parse command-line arguments
program.parse(process.argv);

// If no arguments provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
