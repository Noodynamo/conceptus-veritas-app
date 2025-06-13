# Git Workflow for Backend Repository

## Branch Structure

This repository uses the Gitflow workflow, which consists of the following branches:

### Main Branches
- `main`: The production branch containing stable code. All releases are tagged from this branch.
- `develop`: The integration branch where features are merged before being released.

### Supporting Branches
- `feature/*`: Feature branches created from `develop` for new features or enhancements.
- `bugfix/*`: Branches for fixing bugs in the `develop` branch.
- `release/*`: Branches for preparing a new production release from `develop`.
- `hotfix/*`: Branches for fixing critical bugs in production, created from `main`.

## Branch Naming Conventions

- Feature branches: `feature/[issue-id]-short-description`
- Bugfix branches: `bugfix/[issue-id]-short-description`
- Release branches: `release/vX.Y.Z`
- Hotfix branches: `hotfix/vX.Y.Z.W`

## Workflow Guidelines

### Feature Development
1. Create a feature branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/[issue-id]-feature-name
   ```

2. Implement your feature with regular commits.

3. When ready, push your feature branch:
   ```bash
   git push origin feature/[issue-id]-feature-name
   ```

4. Create a Pull Request to merge your feature branch into `develop`.

5. After code review and all checks pass, merge the feature into `develop`.

### Bug Fixes
1. Create a bugfix branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b bugfix/[issue-id]-bug-description
   ```

2. Fix the bug with appropriate commits.

3. Create a Pull Request to merge your bugfix branch into `develop`.

### Releases
1. When `develop` is ready for release, create a release branch:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/vX.Y.Z
   ```

2. Make any last-minute fixes and version bumps in the release branch.

3. When the release is ready, merge into both `main` and `develop`:
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

### Hotfixes
1. For critical bugs in production, create a hotfix branch from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/vX.Y.Z.W
   ```

2. Fix the critical bug.

3. Merge the hotfix into both `main` and `develop`:
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

## Pull Request Requirements

1. Code must be properly formatted according to project standards.
2. All tests must pass.
3. Code must be reviewed by at least one other developer.
4. Feature branches should be up-to-date with `develop` before merging.
5. Commit messages should be clear and descriptive.

## Database Migration Versioning

Database migrations are versioned and tracked in the `backend/migrations` directory:

1. Migrations should be sequentially numbered and follow the format: `YYYYMMDD_HHmmss_description.sql`
2. Each migration should have corresponding "up" and "down" scripts.
3. Migrations should be idempotent whenever possible.
4. Release branches should include any pending migrations.
5. Migrations are applied automatically as part of the CI/CD process.

## Code Reviews

All code changes require a code review before merging:

1. Pull requests must have a clear description of the changes.
2. Reviewers should focus on:
   - Code correctness
   - Test coverage
   - Design and architecture
   - Security considerations
   - Performance implications
3. Use constructive feedback and suggest alternatives when possible. 