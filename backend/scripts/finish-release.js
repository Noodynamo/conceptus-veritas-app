#!/usr/bin/env node

/**
 * Release Finish Script
 * 
 * This script automates the process of finalizing a release branch.
 * It should be run after the release PR has been merged to main.
 * 
 * Usage:
 *   node scripts/finish-release.js [version]
 * 
 * Arguments:
 *   version: The version number for the release (e.g., 1.2.0)
 *            If not provided, the script will detect the current version
 * 
 * Example:
 *   node scripts/finish-release.js 1.2.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get the package.json file path
const packageJsonPath = path.join(__dirname, '..', 'package.json');

// Read the current version from package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
let targetVersion = process.argv[2] || packageJson.version;

// Validate the version format
if (!/^\d+\.\d+\.\d+$/.test(targetVersion)) {
  console.error('Error: Version must be in the format MAJOR.MINOR.PATCH');
  console.error('Example: 1.2.0');
  process.exit(1);
}

// Execute a command and return its output
function execCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.stderr || error.message);
    process.exit(1);
  }
}

// Check if we have uncommitted changes
function checkUncommittedChanges() {
  try {
    const status = execCommand('git status --porcelain');
    if (status.trim() !== '') {
      console.error('Error: You have uncommitted changes. Please commit or stash them before finishing a release.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error checking git status:', error.message);
    process.exit(1);
  }
}

// Finish the release process
function finishRelease() {
  console.log(`Finishing release process for version ${targetVersion}...`);
  
  // Check for uncommitted changes
  checkUncommittedChanges();
  
  // Make sure we have the latest main branch
  console.log('\nUpdating main branch...');
  execCommand('git checkout main');
  execCommand('git pull');
  
  // Verify the version in package.json matches our target
  const mainPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (mainPackageJson.version !== targetVersion) {
    console.error(`Error: Version mismatch. Expected ${targetVersion} but found ${mainPackageJson.version} in package.json.`);
    console.error('This likely means the release PR has not been merged to main yet.');
    process.exit(1);
  }
  
  // Create a tag for the release
  console.log(`\nCreating tag v${targetVersion}...`);
  execCommand(`git tag -a v${targetVersion} -m "Release ${targetVersion}"`);
  
  // Push the tag
  console.log('\nPushing tag to origin...');
  execCommand('git push --tags');
  
  // Update develop branch with the changes from main
  console.log('\nUpdating develop branch with changes from main...');
  execCommand('git checkout develop');
  execCommand('git pull');
  execCommand('git merge main');
  
  // Push the updated develop branch
  console.log('\nPushing updated develop branch to origin...');
  execCommand('git push');
  
  // Clean up the release branch if it still exists
  const releaseBranch = `release/${targetVersion}`;
  try {
    const branches = execCommand('git branch');
    if (branches.includes(releaseBranch)) {
      console.log(`\nDeleting local release branch ${releaseBranch}...`);
      execCommand(`git branch -d ${releaseBranch}`);
    }
  } catch (error) {
    console.log(`Note: Could not delete local branch ${releaseBranch}. It may have been already deleted.`);
  }
  
  console.log('\n✅ Release finalized successfully!');
  console.log(`\nVersion ${targetVersion} has been released and tagged as v${targetVersion}.`);
  console.log('\nNext steps:');
  console.log('1. Update the release notes on GitHub');
  console.log('2. Deploy the release to production');
  console.log('3. Announce the release to stakeholders');
}

// Confirm with the user
rl.question(`This will finalize the release for version ${targetVersion}. Continue? (y/n) `, (answer) => {
  rl.close();
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    finishRelease();
  } else {
    console.log('Release finalization cancelled.');
  }
}); 