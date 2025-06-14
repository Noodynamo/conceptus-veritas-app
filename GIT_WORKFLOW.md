# Git Workflow Rules

## Branch Structure

This project follows the Gitflow workflow with the following branch structure:

- **`main`**: Production branch containing stable, release-ready code
- **`develop`**: Integration branch where features are merged before release

## Development Workflow

### Feature Development

1. Create a feature branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/[issue-id]-feature-name
   ```
2. Implement your feature with regular commits

3. Push your feature branch:

   ```bash
   git push origin feature/[issue-id]-feature-name
   ```

4. Create a Pull Request to merge into `develop`

5. After code review and all checks pass, merge into `develop`

### Bug Fixes

1. Create a bugfix branch from `develop`:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b bugfix/[issue-id]-bug-description
   ```

2. Fix the bug with appropriate commits

3. Create a Pull Request to merge into `develop`

## Release Process

1. Create a release branch from `develop`:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/vX.Y.Z
   ```

2. Make any last-minute fixes and version bumps

3. Merge into both `main` and `develop`:

   ```bash
   # Merge to main
   git checkout main
   git merge --no-ff release/vX.Y.Z
   git tag -a vX.Y.Z -m "Version X.Y.Z"
   git push origin main --tags

   # Merge back to develop
   git checkout develop
   git merge --no-ff release/vX.Y.Z
   git push origin develop
   ```

## Emergency Fixes

1. For critical bugs in production, create a hotfix branch from `main`:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/vX.Y.Z.W
   ```

2. Fix the critical bug

3. Merge into both `main` and `develop`:

   ```bash
   # Merge to main
   git checkout main
   git merge --no-ff hotfix/vX.Y.Z.W
   git tag -a vX.Y.Z.W -m "Hotfix X.Y.Z.W"
   git push origin main --tags

   # Merge back to develop
   git checkout develop
   git merge --no-ff hotfix/vX.Y.Z.W
   git push origin develop
   ```

## Branch Naming Conventions

- Feature branches: `feature/[issue-id]-short-description`
- Bugfix branches: `bugfix/[issue-id]-short-description`
- Release branches: `release/vX.Y.Z`
- Hotfix branches: `hotfix/vX.Y.Z.W`

## Pull Request Requirements

1. All PRs must use the project PR template
2. The "API & Components Master List Alignment" section must be properly filled out
3. All automated checks must pass:
   - All tests pass
   - Code follows project style rules
4. Code must be reviewed by at least one team member
5. Feature branches must be up-to-date with `develop` before merging
