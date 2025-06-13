# Commit Message Guide

This document outlines the standards for writing commit messages in the Conceptus Veritas backend repository.

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

The type must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Scope

The scope is optional and should be a noun describing the section of the codebase affected by the change (e.g., auth, api, models).

### Subject

The subject is a short description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No period (.) at the end
- Limited to 72 characters

### Body

The body is optional and should provide the motivation for the change and contrast it with previous behavior.

### Footer

The footer is optional and should contain any information about Breaking Changes and reference GitHub issues that this commit closes.

Breaking changes should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for explaining the breaking change.

## Examples

### Feature with Scope

```
feat(auth): implement JWT authentication

Add JWT token generation and validation for user authentication.
Token expires after 24 hours and includes user ID and role.

Closes #123
```

### Bug Fix

```
fix: prevent infinite loop in event processing

The event loop wasn't properly checking for termination conditions,
causing infinite loops in certain scenarios.
```

### Documentation Change

```
docs: update API documentation for user endpoints

Update swagger documentation to reflect new user endpoints and parameters.
```

### Refactoring

```
refactor(database): migrate user queries to repository pattern

Move all user-related database queries to a dedicated repository class
to improve separation of concerns and testability.
```

### Breaking Change

```
feat(api): change response format for user endpoints

Change the response format to include metadata and wrap data in a 'data' field.

BREAKING CHANGE: All user endpoints now return data in a nested 'data' field.
Clients will need to update their response handling.
```

## Best Practices

1. **Keep commits focused**: Each commit should represent a single logical change.
2. **Write meaningful messages**: Clearly explain what changes were made and why.
3. **Use references**: Reference issues and pull requests when applicable.
4. **Be consistent**: Follow the format consistently across all commits.
5. **Separate concerns**: Split unrelated changes into separate commits.

## Commit Tools

We recommend using tools to help ensure your commit messages follow our standards:

- [Commitizen](http://commitizen.github.io/cz-cli/): CLI tool for creating formatted commit messages
- [commitlint](https://commitlint.js.org/): Lints commit messages against our rules

To use Commitizen in this repository:

```bash
# Install commitizen globally
npm install -g commitizen

# Use the local configuration
git cz
```

## Branch Naming and Commits

When working on a feature or bug fix:

1. Create a branch with an appropriate name (e.g., `feature/add-user-authentication`, `bugfix/fix-login-error`)
2. Make focused commits following the commit message format
3. Push your branch and create a pull request
4. Reference any related issues in your commit messages or PR description 