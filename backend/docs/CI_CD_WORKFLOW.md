# CI/CD Workflow for Pull Request Testing

This document outlines the automated pull request testing workflow implemented for the Conceptus Veritas backend repository.

## Overview

Our CI/CD pipeline is designed to ensure code quality, maintain security standards, and automate the deployment process. The workflow includes:

1. **Code Quality Checks**
2. **Automated Testing**
3. **Security Scanning**
4. **Preview Environment Deployment**
5. **Automated Review Processes**

## Pull Request Workflow

When a pull request is opened against `main` or `develop` branches, the following automated processes are triggered:

### 1. Initial Validation (`pull-request.yml`)

Basic validation of the code to catch simple issues:
- Linting checks
- Basic test execution
- Build verification

### 2. Comprehensive CI Pipeline (`pull-request-ci.yml`)

Detailed quality and testing processes:
- **Code Quality**
  - Format checking
  - ESLint verification
  - TypeScript type checking
  - Code smell detection
  - Security audit of dependencies

- **Unit Tests**
  - Execution of all unit tests
  - Coverage reporting and verification
  - Artifact uploading for review

- **Integration Tests**
  - Spins up required services (PostgreSQL, Redis)
  - Runs database migrations in test environment
  - Executes integration tests
  - Runs API-level tests

- **Build Verification**
  - Builds the project
  - Uploads build artifacts for deployment

- **Preview Environment**
  - Deploys a temporary preview environment
  - Adds a comment to the PR with the preview URL
  - Enables manual testing of changes

### 3. Security Scanning (`security-scan.yml`)

Comprehensive security checks:
- Dependency vulnerability scanning
- Static code analysis with CodeQL
- Secret scanning with GitLeaks
- Container image scanning (for containerized deployments)

### 4. Auto-Merge Configuration (`auto-merge.yml`)

Automatic merging of approved PRs:
- Merges PRs with appropriate labels when all checks pass
- Special handling for dependency updates
- Configurable approval requirements

## Branch-Specific Workflows

Different workflows apply based on the target branch:

### For `develop` Branch
- All PR checks must pass
- Requires at least one approval
- After merging, automatically deploys to staging
- Runs database migrations in staging

### For `main` Branch
- All PR checks must pass
- Requires at least two approvals
- Code owner approval required
- After merging, automatically deploys to production
- Runs database migrations in production
- Creates a GitHub release

## Required Status Checks

PRs cannot be merged until these status checks pass:
- `code-quality`
- `unit-tests`
- `integration-tests`
- `build`
- `security-scan`

## Configuration Files

The CI/CD workflow is defined in several GitHub Actions workflow files:

- `.github/workflows/pull-request.yml` - Basic PR validation
- `.github/workflows/pull-request-ci.yml` - Comprehensive CI checks
- `.github/workflows/security-scan.yml` - Security scanning
- `.github/workflows/continuous-deployment.yml` - Deployment processes
- `.github/workflows/database-migrations.yml` - Database migration handling
- `.github/workflows/auto-merge.yml` - Automated PR merging
- `.github/workflows/branch-naming.yml` - Branch naming convention enforcement

## Integration with Development Workflow

This CI/CD setup integrates with our [Feature Branch Workflow](./FEATURE_BRANCH_WORKFLOW.md) to provide:
- Automated checks for every PR
- Enforcement of code quality standards
- Prevention of merging code that doesn't meet standards
- Seamless deployment to testing and production environments

## Setup Instructions

No manual setup is required for individual developers. The CI/CD workflow is automatically applied to all pull requests targeting the main development branches.

## Customization

To modify the CI/CD workflow:
1. Edit the relevant workflow file in `.github/workflows/`
2. Commit and push changes to the repository
3. Open a PR for review of CI/CD changes

## Monitoring and Troubleshooting

- CI/CD runs can be monitored in the "Actions" tab of the GitHub repository
- Detailed logs are available for each workflow run
- Failed checks provide specific error information to help resolve issues 