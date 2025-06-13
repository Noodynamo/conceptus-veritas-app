#!/usr/bin/env node

/**
 * Migration Runner Utility
 * 
 * This script runs or reverts database migrations.
 * 
 * Usage:
 *   node scripts/run-migrations.js [up|down] [options]
 * 
 * Options:
 *   --to=VERSION    : Migrate up/down to a specific version
 *   --step=NUMBER   : Number of migrations to run/revert (default: all)
 *   --dry-run       : Show what would be done, without executing
 * 
 * Examples:
 *   node scripts/run-migrations.js up                 # Run all pending migrations
 *   node scripts/run-migrations.js down --step=1      # Revert the last migration
 *   node scripts/run-migrations.js up --to=20230615   # Migrate up to a specific version
 */

const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();
const options = {};

// Parse additional options
args.slice(1).forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.substring(2).split('=');
    options[key] = value === undefined ? true : value;
  }
});

// Validate command
if (!command || (command !== 'up' && command !== 'down')) {
  console.error('Error: Command must be either "up" or "down".');
  console.error('Usage: node scripts/run-migrations.js [up|down] [options]');
  process.exit(1);
}

// Build TypeORM migration command
async function runMigration() {
  const typeormCommand = [];
  
  // Base command
  typeormCommand.push('npx typeorm-ts-node-commonjs migration:run');
  
  // Direction
  if (command === 'down') {
    typeormCommand.push('--direction=down');
  }
  
  // Number of migrations
  if (options.step) {
    typeormCommand.push(`--step=${options.step}`);
  }
  
  // Target migration
  if (options.to) {
    typeormCommand.push(`--to=${options.to}`);
  }
  
  // Dry run
  if (options['dry-run']) {
    typeormCommand.push('--dryrun');
  }
  
  // Data source file
  typeormCommand.push('--dataSource=src/db/data-source.ts');
  
  const fullCommand = typeormCommand.join(' ');
  console.log(`Executing: ${fullCommand}\n`);
  
  try {
    if (options['dry-run']) {
      console.log('This is a dry run. No migrations will be executed.');
      console.log('Migration would run the following command:');
      console.log(fullCommand);
      return;
    }
    
    // Execute the command
    const { stdout, stderr } = await execAsync(fullCommand, {
      cwd: path.join(__dirname, '..')
    });
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log(`\n✅ Migration ${command === 'up' ? 'applied' : 'reverted'} successfully.`);
  } catch (error) {
    console.error(`\n❌ Migration failed: ${error.message}`);
    
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    
    process.exit(1);
  }
}

// Show pending migrations
async function showPendingMigrations() {
  try {
    console.log('Checking for pending migrations...\n');
    
    const { stdout } = await execAsync(
      'npx typeorm-ts-node-commonjs migration:show --dataSource=src/db/data-source.ts',
      { cwd: path.join(__dirname, '..') }
    );
    
    console.log(stdout);
  } catch (error) {
    console.error(`Failed to check migrations: ${error.message}`);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
  }
}

// Main function
async function main() {
  // Show pending migrations first
  await showPendingMigrations();
  
  // Confirm before executing if not a dry run
  if (!options['dry-run']) {
    console.log(`You are about to ${command === 'up' ? 'apply' : 'revert'} migrations.`);
    
    if (command === 'down') {
      console.log('\n⚠️  WARNING: This will revert migrations and may result in data loss.');
    }
    
    console.log('\nContinuing in 3 seconds... Press Ctrl+C to cancel.');
    
    // Wait for 3 seconds to allow cancellation
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Run the migration
  await runMigration();
}

// Execute the main function
main().catch(error => {
  console.error(`Unhandled error: ${error.message}`);
  process.exit(1);
}); 