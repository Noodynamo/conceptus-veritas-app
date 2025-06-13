# Repository Settings

This document outlines the GitHub repository settings for the Conceptus Veritas backend repository. These settings should be configured by repository administrators to enforce our development workflow and quality standards.

## Branch Protection Rules

### Main Branch (`main`)

- **Require pull request reviews before merging**: Enabled
  - Required approving reviews: 1
  - Dismiss stale pull request approvals when new commits are pushed: Enabled
  - Require review from Code Owners: Enabled

- **Require status checks to pass before merging**: Enabled
  - Require branches to be up to date before merging: Enabled
  - Required status checks:
    - Pull Request CI / Code Quality Checks
    - Pull Request CI / Unit Tests
    - Pull Request CI / Integration Tests
    - Pull Request CI / Build
    - Security Scan / Dependency Security Check
    - Security Scan / Code Security Scan

- **Require conversation resolution before merging**: Enabled

- **Require signed commits**: Disabled (optional)

- **Require linear history**: Enabled

- **Include administrators**: Disabled

- **Allow force pushes**: Disabled

- **Allow deletions**: Disabled

### Development Branch (`develop`)

- **Require pull request reviews before merging**: Enabled
  - Required approving reviews: 1
  - Dismiss stale pull request approvals when new commits are pushed: Enabled
  - Require review from Code Owners: Enabled

- **Require status checks to pass before merging**: Enabled
  - Require branches to be up to date before merging: Enabled
  - Required status checks:
    - Pull Request CI / Code Quality Checks
    - Pull Request CI / Unit Tests
    - Pull Request CI / Integration Tests
    - Pull Request CI / Build
    - Security Scan / Dependency Security Check
    - Security Scan / Code Security Scan

- **Require conversation resolution before merging**: Enabled

- **Require signed commits**: Disabled (optional)

- **Require linear history**: Disabled

- **Include administrators**: Disabled

- **Allow force pushes**: Disabled

- **Allow deletions**: Disabled

### Release Branches (`release/*`)

- **Require pull request reviews before merging**: Enabled
  - Required approving reviews: 1
  - Dismiss stale pull request approvals when new commits are pushed: Enabled
  - Require review from Code Owners: Enabled

- **Require status checks to pass before merging**: Enabled
  - Require branches to be up to date before merging: Enabled
  - Required status checks:
    - Pull Request CI / Code Quality Checks
    - Pull Request CI / Unit Tests
    - Pull Request CI / Integration Tests
    - Pull Request CI / Build

- **Require conversation resolution before merging**: Enabled

- **Require linear history**: Disabled

- **Include administrators**: Disabled

- **Allow force pushes**: Disabled

- **Allow deletions**: Disabled

## General Repository Settings

### Features

- **Issues**: Enabled
- **Projects**: Enabled
- **Wikis**: Disabled (use docs/ directory instead)
- **Discussions**: Enabled
- **Sponsorships**: Disabled
- **Allow forking**: Enabled

### Pull Requests

- **Allow merge commits**: Disabled
- **Allow squash merging**: Enabled (default option)
  - Default commit message: Pull request title and description
- **Allow rebase merging**: Enabled
- **Always suggest updating pull request branches**: Enabled
- **Allow auto-merge**: Enabled
- **Automatically delete head branches**: Enabled

### Security

- **Dependency graph**: Enabled
- **Dependabot alerts**: Enabled
- **Dependabot security updates**: Enabled
- **Secret scanning**: Enabled
- **Secret scanning push protection**: Enabled

### Code security and analysis

- **CodeQL analysis**: Enabled for JavaScript and TypeScript
- **Secret scanning**: Enabled
- **Push protection**: Enabled

## Repository Actions Settings

### General

- **Allow all actions and reusable workflows**: Enabled
- **Require approval for all outside collaborators**: Enabled
- **Allow actions created by GitHub**: Enabled
- **Allow actions by Marketplace verified creators**: Enabled

### Workflow permissions

- **Read and write permissions**: Enabled
- **Allow GitHub Actions to create and approve pull requests**: Disabled

## Labels

The following labels should be configured in the repository:

- `bug` - Something isn't working
- `documentation` - Improvements or additions to documentation
- `duplicate` - This issue or pull request already exists
- `enhancement` - New feature or request
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `invalid` - This doesn't seem right
- `question` - Further information is requested
- `wontfix` - This will not be worked on
- `critical` - Highest priority issues that need immediate attention
- `blocked` - Cannot proceed due to external dependency
- `in progress` - Currently being worked on
- `needs review` - Ready for code review
- `performance` - Related to performance issues
- `refactoring` - Code changes that neither fix a bug nor add a feature
- `regression` - Something that was working is now broken
- `security` - Security-related issues
- `testing` - Related to testing
- `dependencies` - Updates to dependencies
- `automerge` - Pull requests that can be automatically merged

## Custom Repository Files

The following special files should be maintained in the repository:

- **CODEOWNERS**: Defines individuals or teams responsible for code in the repository
- **CONTRIBUTING.md**: Guidelines for contributing to the project
- **CODE_OF_CONDUCT.md**: Expected behavior for project participants
- **SECURITY.md**: Instructions for reporting security vulnerabilities
- **PULL_REQUEST_TEMPLATE.md**: Template for pull request descriptions
- **issue_template/**: Templates for different types of issues

## GitHub Actions Secrets

The following secrets should be configured for GitHub Actions:

- `AWS_ACCESS_KEY_ID`: AWS access key for deployments
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key for deployments
- `STAGING_DATABASE_URL`: Database connection string for staging environment
- `PRODUCTION_DATABASE_URL`: Database connection string for production environment
- `STAGING_API_URL`: API URL for staging environment
- `PRODUCTION_API_URL`: API URL for production environment
- `SNYK_TOKEN`: Token for Snyk security scanning
- `SONAR_TOKEN`: Token for SonarQube analysis 