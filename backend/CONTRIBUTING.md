# Contributing to Conceptus Veritas Backend

Thank you for your interest in contributing to the Conceptus Veritas backend! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Security Vulnerabilities](#security-vulnerabilities)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm (v9 or higher)
- Git
- PostgreSQL (v15 or higher)
- Redis (v6 or higher)

### Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/conceptus-veritas-backend.git
   cd conceptus-veritas-backend
   ```

3. Add the original repository as an upstream remote:
   ```bash
   git remote add upstream https://github.com/Noodynamo/conceptus-veritas-backend.git
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

6. Run database migrations:
   ```bash
   npm run migrations:up
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

We follow the Gitflow workflow for development:

1. **Main Branch (main)**: Production code
2. **Development Branch (develop)**: Integration branch for features
3. **Feature Branches (feature/*)**: New features or enhancements
4. **Bugfix Branches (bugfix/*)**: Bug fixes for the develop branch
5. **Release Branches (release/*)**: Preparing for a new production release
6. **Hotfix Branches (hotfix/*)**: Urgent fixes for production

### Creating a Feature Branch

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

### Working on Your Feature

1. Make your changes in small, logical commits
2. Follow the [coding standards](./docs/coding-standards.md)
3. Write tests for your changes
4. Update documentation as needed
5. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

## Pull Request Process

1. Update your branch with the latest changes from develop:
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout feature/your-feature-name
   git rebase develop
   ```

2. Resolve any conflicts and push to your fork:
   ```bash
   git push origin feature/your-feature-name -f
   ```

3. Create a pull request from your fork to the main repository's develop branch

4. Fill out the pull request template completely

5. Wait for the CI checks to complete

6. Address any feedback from reviewers

7. Once approved, your PR will be merged by a maintainer

## Coding Standards

Please follow our [coding standards](./docs/coding-standards.md) when writing code for this project. Key points include:

- Use TypeScript for all new code
- Follow the established code organization patterns
- Write clear, self-documenting code with appropriate comments
- Use meaningful variable and function names
- Write comprehensive tests

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. See our [commit message guide](./docs/commit-message-guide.md) for details.

Example:
```
feat(auth): implement JWT authentication

Add JWT token generation and validation for user authentication.
Token expires after 24 hours and includes user ID and role.

Closes #123
```

## Testing Guidelines

- Write unit tests for all business logic
- Write integration tests for API endpoints
- Ensure all tests pass before submitting a PR
- Aim for high test coverage
- Tests should be clear and maintainable

To run tests:
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Check test coverage
npm run test:coverage
```

## Documentation

- Document all public APIs using JSDoc comments
- Update the README.md when adding new features or changing functionality
- Keep the documentation in the docs/ directory up to date
- Document any non-obvious behavior or edge cases

## Issue Reporting

If you find a bug or have a feature request:

1. Check if it already exists in the [Issues](https://github.com/Noodynamo/conceptus-veritas-backend/issues)
2. If not, create a new issue using the appropriate template
3. Provide as much detail as possible
4. Add relevant labels

## Security Vulnerabilities

If you discover a security vulnerability, please do NOT open an issue. Email [security@conceptus-veritas.com](mailto:security@conceptus-veritas.com) instead.

---

Thank you for contributing to Conceptus Veritas Backend! Your efforts help make this project better for everyone. 