#!/usr/bin/env node

/**
 * Migration Creation Utility
 * 
 * This script creates a new migration file with the correct timestamp and name format.
 * 
 * Usage:
 *   node scripts/create-migration.js --name add_user_preferences
 * 
 * Output:
 *   Creates a file like: src/db/migrations/20230615_143022_add_user_preferences.ts
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
let migrationName = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--name' || args[i] === '-n') {
    migrationName = args[i + 1];
    i++;
  }
}

// Validate migration name
if (!migrationName) {
  console.error('Error: Migration name is required. Use --name or -n flag.');
  console.error('Example: node scripts/create-migration.js --name add_user_preferences');
  process.exit(1);
}

// Ensure name is in snake_case
if (!/^[a-z0-9_]+$/.test(migrationName)) {
  console.error('Error: Migration name must be in snake_case (lowercase with underscores).');
  console.error('Example: add_user_table, update_user_preferences, create_auth_schema');
  process.exit(1);
}

// Generate timestamp in YYYYMMDD_HHMMSS format
const now = new Date();
const timestamp = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
  '_',
  String(now.getHours()).padStart(2, '0'),
  String(now.getMinutes()).padStart(2, '0'),
  String(now.getSeconds()).padStart(2, '0')
].join('');

// Convert snake_case to PascalCase for class name
const pascalCaseName = migrationName
  .split('_')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join('');

// Generate file name and class name
const fileName = `${timestamp}_${migrationName}.ts`;
const className = `${timestamp}_${pascalCaseName}`;
const migrationsDir = path.join(__dirname, '..', 'src', 'db', 'migrations');
const filePath = path.join(migrationsDir, fileName);

// Ensure migrations directory exists
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Read template file
const templatePath = path.join(migrationsDir, 'template.ts');
let templateContent;

try {
  templateContent = fs.readFileSync(templatePath, 'utf8');
} catch (error) {
  // If template doesn't exist, use a simple default template
  templateContent = `import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: DESCRIPTION
 * 
 * Created: CURRENT_DATE
 */
export class MIGRATION_CLASS_NAME implements MigrationInterface {
  public name = 'MIGRATION_NAME';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // TODO: Implement migration logic
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // TODO: Implement rollback logic
  }
}`;
}

// Replace placeholders in template
const migrationContent = templateContent
  .replace(/YYYYMMDD_HHMMSS_DescriptiveName/g, className)
  .replace(/MIGRATION_CLASS_NAME/g, className)
  .replace(/MIGRATION_NAME/g, className)
  .replace(/DESCRIPTION/g, migrationName.replace(/_/g, ' '))
  .replace(/CURRENT_DATE/g, new Date().toISOString());

// Write migration file
fs.writeFileSync(filePath, migrationContent);

console.log(`✅ Migration created: ${filePath}`);
console.log('');
console.log('Next steps:');
console.log('1. Implement the migration logic in the "up" method');
console.log('2. Implement the rollback logic in the "down" method');
console.log('3. Run the migration with: npm run migrations:up');
console.log('');
console.log('For more details, see: backend/docs/RELEASE_STRATEGY.md');

// Make the file executable
fs.chmodSync(filePath, '755'); 