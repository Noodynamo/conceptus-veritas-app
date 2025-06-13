#!/usr/bin/env node

/**
 * Analytics Schema Update Script
 * 
 * This script is used to update the analytics schema version and document changes.
 * It performs the following tasks:
 * 1. Updates the version in analytics.constants.ts
 * 2. Adds a version entry to the database
 * 3. Records schema changes for tracking
 * 
 * Usage:
 *   node scripts/update-analytics-schema.js --version <new-version> --description "Description of changes"
 * 
 * Example:
 *   node scripts/update-analytics-schema.js --version 1.1.0 --description "Added new user onboarding events"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { program } = require('commander');

// Parse command line arguments
program
  .requiredOption('--version <version>', 'New schema version (semantic versioning)')
  .requiredOption('--description <description>', 'Description of changes')
  .option('--major', 'Indicates a major version change (breaking)')
  .option('--minor', 'Indicates a minor version change (non-breaking additions)')
  .option('--patch', 'Indicates a patch version change (bug fixes)')
  .parse(process.argv);

const options = program.opts();

// Validate version format (semver)
if (!/^\d+\.\d+\.\d+$/.test(options.version)) {
  console.error('Error: Version must follow semantic versioning (x.y.z)');
  process.exit(1);
}

// Constants
const CONSTANTS_FILE_PATH = path.join(__dirname, '../src/services/analytics/analytics.constants.ts');
const SCHEMAS_FILE_PATH = path.join(__dirname, '../src/services/analytics/event-schemas.ts');

// Function to update the version in analytics.constants.ts
function updateConstantsFile(version) {
  try {
    let content = fs.readFileSync(CONSTANTS_FILE_PATH, 'utf8');
    
    // Replace the version
    const versionRegex = /(export const ANALYTICS_VERSION = ['"])([^'"]+)(['"];)/;
    if (!versionRegex.test(content)) {
      console.error('Error: Could not find ANALYTICS_VERSION in constants file');
      process.exit(1);
    }
    
    const updatedContent = content.replace(versionRegex, `$1${version}$3`);
    fs.writeFileSync(CONSTANTS_FILE_PATH, updatedContent);
    
    console.log(`✅ Updated ANALYTICS_VERSION to ${version} in constants file`);
    return true;
  } catch (error) {
    console.error('Error updating constants file:', error);
    return false;
  }
}

// Function to update the changelog in event-schemas.ts
function updateChangelogInSchemas(version, description) {
  try {
    let content = fs.readFileSync(SCHEMAS_FILE_PATH, 'utf8');
    
    // Find the changelog section
    const changelogRegex = /(Change log:\s*\n)(\s*[*-] v[\d.]+ \([^)]+\): [^\n]+\n)*/;
    if (!changelogRegex.test(content)) {
      console.error('Error: Could not find Change log section in schemas file');
      process.exit(1);
    }
    
    // Add the new version to the changelog
    const today = new Date().toISOString().split('T')[0];
    const newChangelogEntry = ` * - v${version} (${today}): ${description}\n`;
    
    const updatedContent = content.replace(
      changelogRegex, 
      (match, intro, entries) => `${intro}${newChangelogEntry}${entries || ''}`
    );
    
    fs.writeFileSync(SCHEMAS_FILE_PATH, updatedContent);
    
    console.log(`✅ Updated changelog in schemas file with version ${version}`);
    return true;
  } catch (error) {
    console.error('Error updating changelog in schemas file:', error);
    return false;
  }
}

// Function to create a database migration for the new version
function createDatabaseMigration(version, description) {
  try {
    // Generate a timestamp for the migration filename
    const timestamp = Math.floor(Date.now() / 1000);
    const migrationName = `${timestamp}_update_analytics_schema_to_v${version.replace(/\./g, '_')}.ts`;
    const migrationPath = path.join(__dirname, '../src/db/migrations', migrationName);
    
    // Create migration file content
    const migrationContent = `import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Update Analytics Schema to version ${version}
 * 
 * ${description}
 */
export class UpdateAnalyticsSchemaToV${version.replace(/\./g, '_')}${timestamp} implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert new version record
    await queryRunner.query(\`
      INSERT INTO analytics_schema_versions (version, description, is_current, created_by)
      VALUES ('${version}', '${description.replace(/'/g, "''")}', TRUE, 'system')
    \`);
    
    // Update previous version to not be current
    await queryRunner.query(\`
      UPDATE analytics_schema_versions 
      SET is_current = FALSE 
      WHERE version != '${version}' AND is_current = TRUE
    \`);
    
    // Add code here to insert new event schemas or update existing ones
    // Example:
    /*
    await queryRunner.query(\`
      INSERT INTO analytics_event_schemas (
        schema_version_id, 
        event_name, 
        event_version, 
        category, 
        description, 
        schema_definition,
        created_at
      )
      SELECT 
        (SELECT id FROM analytics_schema_versions WHERE version = '${version}'),
        'ph_new_event_name',
        '1.0.0',
        'user',
        'Description of the new event',
        '{"properties": {"prop1": {"type": "string", "required": true}}}',
        NOW()
    \`);
    */
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Set the previous version back to current
    await queryRunner.query(\`
      UPDATE analytics_schema_versions
      SET is_current = TRUE
      WHERE version = (
        SELECT version FROM analytics_schema_versions
        WHERE version != '${version}'
        ORDER BY created_at DESC
        LIMIT 1
      )
    \`);
    
    // Delete this version
    await queryRunner.query(\`
      DELETE FROM analytics_schema_versions
      WHERE version = '${version}'
    \`);
  }
}`;
    
    // Write migration file
    fs.writeFileSync(migrationPath, migrationContent);
    
    console.log(`✅ Created database migration: ${migrationName}`);
    return true;
  } catch (error) {
    console.error('Error creating database migration:', error);
    return false;
  }
}

// Function to create a Git commit with the changes
function createGitCommit(version, description) {
  try {
    // Add changed files
    execSync('git add backend/src/services/analytics/analytics.constants.ts');
    execSync('git add backend/src/services/analytics/event-schemas.ts');
    execSync('git add backend/src/db/migrations/*update_analytics_schema*.ts');
    
    // Create commit
    const commitMessage = `chore(analytics): update schema to v${version}\n\n${description}`;
    execSync(`git commit -m "${commitMessage}"`);
    
    console.log(`✅ Created Git commit for analytics schema update to v${version}`);
    return true;
  } catch (error) {
    console.error('Error creating Git commit:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log(`\n🔄 Updating analytics schema to version ${options.version}`);
  console.log(`Description: ${options.description}\n`);
  
  // Determine the type of version change
  let changeType = 'patch';
  if (options.major) changeType = 'major';
  else if (options.minor) changeType = 'minor';
  else if (options.patch) changeType = 'patch';
  
  console.log(`Change type: ${changeType}\n`);
  
  // Update the constants file
  const constantsUpdated = updateConstantsFile(options.version);
  
  // Update the changelog in schemas file
  const changelogUpdated = updateChangelogInSchemas(options.version, options.description);
  
  // Create a database migration
  const migrationCreated = createDatabaseMigration(options.version, options.description);
  
  // Create a Git commit (optional)
  const shouldCommit = true; // Can be made configurable
  let commitCreated = false;
  if (shouldCommit && constantsUpdated && changelogUpdated && migrationCreated) {
    commitCreated = createGitCommit(options.version, options.description);
  }
  
  // Summary
  console.log('\n📋 Summary:');
  console.log(`- Constants file updated: ${constantsUpdated ? '✅' : '❌'}`);
  console.log(`- Changelog updated: ${changelogUpdated ? '✅' : '❌'}`);
  console.log(`- Database migration created: ${migrationCreated ? '✅' : '❌'}`);
  if (shouldCommit) {
    console.log(`- Git commit created: ${commitCreated ? '✅' : '❌'}`);
  }
  
  if (constantsUpdated && changelogUpdated && migrationCreated) {
    console.log('\n✅ Analytics schema successfully updated to version', options.version);
    console.log('\nNext steps:');
    console.log('1. Review the changes');
    console.log('2. Run the database migration: npm run migrations:up');
    console.log('3. Test the updated schema');
  } else {
    console.log('\n❌ Analytics schema update failed');
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
