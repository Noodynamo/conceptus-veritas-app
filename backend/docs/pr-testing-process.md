# Pull Request Testing Process

This document outlines the automated testing and validation process for pull requests in the Conceptus Veritas backend repository.

## CI/CD Workflow Overview

Every pull request goes through an extensive automated testing and validation process to ensure code quality and prevent regressions. The process consists of the following stages:

1. **Code Quality Checks**
2. **Unit Tests**
3. **Integration Tests**
4. **Security Scanning**
5. **Preview Environment Deployment**

## Pull Request Testing Steps

### 1. Code Quality Checks

When you create a pull request, the following code quality checks are automatically run:

- **Linting**: ESLint is used to check for code style and potential issues
- **Type Checking**: TypeScript type checking ensures type safety
- **Formatting**: Prettier verifies that code formatting is consistent
- **Code Smells**: Tools like SonarQube detect potential code smells and anti-patterns
- **Security Audit**: npm audit checks for known vulnerabilities in dependencies

All of these checks must pass before the PR can be merged.

### 2. Unit Tests

Unit tests are run to verify that individual components function correctly:

- All unit tests must pass
- Code coverage is checked to ensure adequate test coverage
- Test reports are generated and attached to the PR

### 3. Integration Tests

Integration tests verify that different parts of the system work together correctly:

- API endpoint tests
- Database interaction tests
- Service integration tests
- Tests run against a real PostgreSQL and Redis instance

### 4. Security Scanning

Several security scans are performed:

- **Dependency Scanning**: Checks for vulnerabilities in dependencies
- **Code Scanning**: CodeQL analyzes code for security issues
- **Secret Scanning**: Ensures no secrets or credentials are committed
- **Container Scanning**: Scans Docker images for vulnerabilities

### 5. Preview Environment Deployment

For significant changes, a preview environment is automatically deployed:

- A temporary environment is created with your changes
- The URL is posted as a comment on the PR
- You can manually test your changes in this environment
- The environment is automatically cleaned up when the PR is closed

## Interpreting Test Results

All test results are available directly in the GitHub PR interface:

- **Check Marks**: Green checks indicate passing tests
- **X Marks**: Red X's indicate failing tests
- **Details Link**: Click "Details" next to any check to see detailed logs and reports

## What to Do if Tests Fail

If any tests fail, you'll need to fix the issues before your PR can be merged:

1. Click the "Details" link next to the failed check
2. Review the logs to understand what failed
3. Make necessary changes to your branch
4. Push the changes to update your PR
5. Tests will automatically run again

## Manual QA Review

Even with extensive automated testing, some PRs may require manual QA review:

- Complex UI changes
- Major feature additions
- Changes to critical business logic
- Performance optimizations

In these cases, a QA reviewer will be assigned to your PR.

## PR Approval and Merging

Once all automated tests pass and required reviews are complete:

1. An authorized reviewer will approve the PR
2. If the PR has the "automerge" label, it will be automatically merged
3. Otherwise, you or a maintainer can manually merge the PR

## Continuous Deployment

After your PR is merged:

- Changes to the `develop` branch are automatically deployed to staging
- Changes to the `main` branch are automatically deployed to production
- Database migrations are automatically applied
- Post-deployment tests verify the deployment was successful 