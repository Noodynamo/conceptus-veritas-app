# Linting Examples

This directory contains examples that demonstrate the differences between ESLint and SonarLint.

## Files

- `lint-comparison.js` - Contains code examples that trigger different types of linting issues

## ESLint vs SonarLint

The examples show how:

1. **ESLint** primarily focuses on:

   - Code style and formatting
   - Variable naming conventions
   - Basic code quality issues

2. **SonarLint** primarily focuses on:
   - Security vulnerabilities
   - Bugs and potential runtime errors
   - Code smells and maintainability issues
   - Complex cognitive structures

## Running the Example

### ESLint:

```bash
npx eslint examples/lint-comparison.js
```

### SonarLint:

1. Open the file in VS Code/Cursor with SonarLint extension installed
2. View the SonarLint issues in the Problems panel
3. Notice the "SonarLint" source tag on the issues
