# Cursor Rules

## Git Workflow Enforcement

This project strictly follows the Gitflow workflow as defined in `GIT_WORKFLOW.md`. The following rules must be enforced when using Cursor:

### Branch Management

- Always check that you're on the correct branch before making changes
- Create new branches only from the appropriate parent branch:
  - Feature branches from `develop`
  - Bugfix branches from `develop`
  - Release branches from `develop`
  - Hotfix branches from `main`
- Follow the branch naming conventions:
  - `feature/[issue-id]-short-description`
  - `bugfix/[issue-id]-short-description`
  - `release/vX.Y.Z`
  - `hotfix/vX.Y.Z.W`

### Commit Guidelines

- Write clear, descriptive commit messages
- Keep commits focused on a single logical change
- Include the issue ID in the commit message when applicable
- Avoid committing directly to `main` or `develop` branches

### Pull Request Process

- Always create a Pull Request for merging changes
- Fill out the PR template completely, especially the "API & Components Master List Alignment" section
- Ensure all automated checks pass before requesting review
- Address all review comments before merging
- Keep your branch up-to-date with its parent branch

### Code Review Standards

- Review code for correctness, style, and adherence to project standards
- Verify that appropriate tests are included
- Check that documentation is updated when necessary
- Ensure the PR template is properly completed

### Merge Procedures

- Use `--no-ff` (no fast-forward) when merging to preserve feature branch history
- For release branches, merge to both `main` and `develop`
- For hotfix branches, merge to both `main` and `develop`
- Always tag releases on the `main` branch

## Task Management Integration

- Update task status in Dart MCP when:
  - Starting work on a new branch (move task to "Doing")
  - Creating a PR (keep task in "Doing")
  - Merging a PR (move task to "Done" after approval)

## Documentation Requirements

- Update relevant documentation when making changes
- Ensure API changes are reflected in the API & Components Master List
- Keep README and other documentation files up-to-date

## Automated Checks

- Run tests locally before pushing changes
- Ensure code passes linting rules
- Fix any CI/CD pipeline failures before requesting review

## Enforcement

These rules are enforced through:

1. Code review process
2. Automated CI/CD checks
3. Branch protection rules on `main` and `develop`
4. PR template requirements
