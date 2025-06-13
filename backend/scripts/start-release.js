#!/usr/bin/env node

/**
 * Release Start Script
 * 
 * This script automates the process of starting a new release branch.
 * 
 * Usage:
 *   node scripts/start-release.js [version]
 * 
 * Arguments:
 *   version: The version number for the release (e.g., 1.2.0)
 *            If not provided, the script will use the next minor version
 * 
 * Example:
 *   node scripts/start-release.js 1.2.0
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
const currentVersion = packageJson.version;

// Parse current version
const [currentMajor, currentMinor, currentPatch] = currentVersion.split('.').map(Number);

// Get the version argument or calculate the next minor version
let targetVersion = process.argv[2];
if (!targetVersion) {
  targetVersion = `${currentMajor}.${currentMinor + 1}.0`;
}

// Validate the version format
if (!/^\d+\.\d+\.\d+$/.test(targetVersion)) {
  console.error('Error: Version must be in the format MAJOR.MINOR.PATCH');
  console.error('Example: 1.2.0');
  process.exit(1);
}

// Branch name for the release
const releaseBranch = `release/${targetVersion}`;

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
      console.error('Error: You have uncommitted changes. Please commit or stash them before starting a release.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error checking git status:', error.message);
    process.exit(1);
  }
}

// Check if the release branch already exists
function checkBranchExists(branch) {
  try {
    const branches = execCommand('git branch -a');
    return branches.includes(branch);
  } catch (error) {
    console.error('Error checking branches:', error.message);
    process.exit(1);
  }
}

// Start the release process
function startRelease() {
  console.log(`Starting release process for version ${targetVersion}...`);
  
  // Check for uncommitted changes
  checkUncommittedChanges();
  
  // Check if the release branch already exists
  if (checkBranchExists(releaseBranch)) {
    console.error(`Error: Branch ${releaseBranch} already exists.`);
    process.exit(1);
  }
  
  // Make sure we have the latest develop branch
  console.log('\nUpdating develop branch...');
  execCommand('git checkout develop');
  execCommand('git pull');
  
  // Create the release branch
  console.log(`\nCreating release branch: ${releaseBranch}`);
  execCommand(`git checkout -b ${releaseBranch}`);
  
  // Update version in package.json
  console.log(`\nUpdating version in package.json from ${currentVersion} to ${targetVersion}`);
  packageJson.version = targetVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  
  // Update version in other files if needed
  // For example, update an app config file if it exists
  const appConfigPath = path.join(__dirname, '..', 'src', 'config', 'app.config.ts');
  if (fs.existsSync(appConfigPath)) {
    console.log('\nUpdating version in app.config.ts');
    let appConfig = fs.readFileSync(appConfigPath, 'utf8');
    appConfig = appConfig.replace(
      /version:\s*['"].*['"]/,
      `version: '${targetVersion}'`
    );
    fs.writeFileSync(appConfigPath, appConfig);
  }
  
  // Generate the changelog
  console.log('\nGenerating changelog...');
  try {
    execCommand('npx conventional-changelog -p angular -i CHANGELOG.md -s');
  } catch (error) {
    console.log('Failed to generate changelog automatically. Please update it manually.');
  }
  
  // Commit the version changes
  console.log('\nCommitting version changes...');
  execCommand('git add .');
  execCommand(`git commit -m "chore(release): prepare for version ${targetVersion}"`);
  
  // Push the release branch
  console.log('\nPushing release branch to origin...');
  execCommand(`git push --set-upstream origin ${releaseBranch}`);
  
  console.log('\n✅ Release branch created successfully!');
  console.log('\nNext steps:');
  console.log('1. Make any final adjustments to the release');
  console.log('2. Create a pull request from the release branch to main');
  console.log('3. Once approved, run: npm run release:finish');
}

// Confirm with the user
rl.question(`This will create a release branch for version ${targetVersion}. Continue? (y/n) `, (answer) => {
  rl.close();
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    startRelease();
  } else {
    console.log('Release creation cancelled.');
  }
}); 