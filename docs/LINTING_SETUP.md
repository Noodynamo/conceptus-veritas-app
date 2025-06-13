# Linting Setup: ESLint + SonarLint

This document explains our linting setup combining ESLint and SonarLint.

## Overview

Our project uses two complementary linting tools:

1. **ESLint** - For JavaScript/TypeScript style and formatting
2. **SonarLint** - For deeper code quality and security analysis

## Why Both Tools?

### ESLint Strengths

- Fast, immediate feedback during development
- Excellent for style enforcement and consistency
- Rich ecosystem of plugins and configurations
- Highly customizable for team preferences
- Integrated with our build process

### SonarLint Strengths

- Detects security vulnerabilities
- Finds subtle bugs and edge cases
- Identifies maintainability issues
- Works across multiple languages
- Based on the same engine as SonarQube/SonarCloud

## Setup

### ESLint

- Configuration files: `.eslintrc` at root, frontend, and backend
- Run with: `npm run lint`
- Integrated with CI/CD

### SonarLint

- Install the VS Code/Cursor extension: `SonarSource.sonarlint-vscode`
- Configuration files: `.sonarlint.json` and `.sonarlint/sonarlint.json`
- Check installation: `npm run check:sonarlint`

## Example

See the `examples/lint-comparison.js` file for a demonstration of how ESLint and SonarLint detect different issues.

## Best Practices

1. **Fix ESLint issues first** - These are typically easier and more style-focused
2. **Then address SonarLint issues** - These tend to be more complex bugs and security issues
3. **Don't ignore warnings** - Both tools are configured to flag important issues
4. **Update rules when needed** - If you find false positives, update the configuration rather than ignoring the warning

## Resources

- [ESLint Documentation](https://eslint.org/docs/user-guide/)
- [SonarLint Documentation](https://www.sonarlint.org/vscode/)
- [Example Comparison](../examples/lint-comparison.js)
