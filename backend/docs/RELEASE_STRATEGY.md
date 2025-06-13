# Release Branch Strategy

This document outlines the release branch strategy for the Conceptus Veritas backend repository, including branch management, versioning conventions, and release procedures.

## Branching Strategy

We follow a modified GitFlow branching model with the following branch types:

### Main Branches

- **`main`**: The production branch, containing the code currently in production.
- **`develop`**: The development branch, containing the latest development changes for the next release.

### Supporting Branches

- **`feature/*`**: Feature branches for developing new features.
- **`bugfix/*`**: Bugfix branches for fixing bugs in the upcoming release.
- **`hotfix/*`**: Hotfix branches for urgent fixes to production.
- **`release/*`**: Release branches for preparing a new release.
- **`docs/*`**: Documentation-only branches.
- **`refactor/*`**: Code refactoring branches.

## Versioning Strategy

We follow [Semantic Versioning (SemVer)](https://semver.org/) for version numbering:

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

- **MAJOR**: Incremented for incompatible API changes.
- **MINOR**: Incremented for backward-compatible functionality additions.
- **PATCH**: Incremented for backward-compatible bug fixes.
- **PRERELEASE**: Optional identifier for pre-release versions (e.g., `-alpha.1`, `-beta.2`, `-rc.1`).
- **BUILD**: Optional build metadata (e.g., `+20230615`, `+commit.5fe3456`).

Examples:
- `1.0.0`: Initial stable release
- `1.1.0`: New features added
- `1.1.1`: Bug fixes
- `2.0.0`: Breaking changes
- `1.2.0-beta.1`: Beta release with new features
- `1.2.0-rc.1`: Release candidate

## Release Process

### 1. Starting a Release

When the `develop` branch has enough features for a release:

1. Create a release branch from `develop`:
   ```bash
   git checkout -b release/x.y.0 develop
   ```

2. Update version numbers in:
   - `package.json`
   - `src/config/app.config.ts`
   - Any other version-dependent files

3. Generate and update CHANGELOG.md:
   ```bash
   # Using conventional-changelog
   npx conventional-changelog -p angular -i CHANGELOG.md -s
   ```

4. Push the release branch:
   ```bash
   git push --set-upstream origin release/x.y.0
   ```

### 2. Finalizing a Release

1. Create a pull request from `release/x.y.0` to `main`
2. Conduct final QA testing on the release branch
3. Fix any critical bugs directly in the release branch
4. Once approved and tested, merge the PR into `main`
5. Tag the release on `main`:
   ```bash
   git checkout main
   git pull
   git tag -a vx.y.0 -m "Release version x.y.0"
   git push --tags
   ```
6. Merge `main` back into `develop`:
   ```bash
   git checkout develop
   git pull
   git merge main
   git push
   ```

### 3. Hotfixes for Production

For urgent fixes to production:

1. Create a hotfix branch from `main`:
   ```bash
   git checkout -b hotfix/x.y.z main
   ```
2. Fix the issue and update version numbers
3. Create a PR from the hotfix branch to `main`
4. After merging to `main`, tag the release
5. Merge the hotfix into `develop` as well

## Database Migration Versioning

### Migration Naming Convention

Database migrations follow a standardized naming convention:

```
YYYYMMDD_HHMMSS_descriptive_name.ts
```

Example: `20230615_143022_add_user_preferences_table.ts`

### Migration Organization

Migrations are stored in the `src/db/migrations` directory and include:

1. **Up Migration**: Code to apply the migration
2. **Down Migration**: Code to revert the migration
3. **Version Check**: Verification to prevent duplicate application

### Migration Process

#### For Local Development

1. Create a new migration file:
   ```bash
   npm run migrations:create -- --name descriptive_name
   ```

2. Implement both `up` and `down` methods in the migration file

3. Run pending migrations:
   ```bash
   npm run migrations:up
   ```

4. If needed, revert the last migration:
   ```bash
   npm run migrations:down
   ```

#### For Feature Branches

1. All database changes must be made through migrations
2. Each significant database change should be in its own migration file
3. Migrations must be backward compatible with running code
4. Test migrations by applying and reverting them

#### For Release Branches

1. Review and test all migrations included in the release
2. Ensure migrations can be applied in sequence without errors
3. Include migration verification in the release PR checklist

### Production Deployment Considerations

1. **Backup**: Always back up the production database before applying migrations
2. **Dry Run**: Test migrations on a staging environment with production-like data
3. **Downtime Planning**: Schedule downtime if migrations might affect service
4. **Rollback Plan**: Have a tested plan to revert migrations if necessary

## Deployment Environments

Our deployment pipeline includes the following environments:

1. **Development**: Individual developer environments
2. **CI/Test**: Automated testing environment (ephemeral)
3. **Staging**: Pre-production environment with production-like data
4. **Production**: Live production environment

### Environment Progression

Code and database changes follow this progression:

1. **Development** → **CI/Test**: Triggered by PR creation
2. **CI/Test** → **Staging**: Triggered by merge to `develop`
3. **Staging** → **Production**: Triggered by merge to `main`

### Environment-specific Considerations

#### Staging Environment

- Database structure matches production
- Anonymized production-like data
- All migrations tested here before production deployment
- Performance testing and final QA occurs here

#### Production Environment

- Deployment during scheduled maintenance windows
- Database migrations run as part of deployment process
- Automatic rollback if deployment fails
- Post-deployment verification steps

## Release Schedule and Planning

1. **Regular Releases**: 
   - Minor releases every 2-4 weeks
   - Major releases according to product roadmap (typically quarterly)

2. **Hotfixes**:
   - Released as needed for critical issues
   - Follow expedited review process

3. **Release Planning**:
   - Features targeted for a release are tracked in project management tool
   - Release branches created based on roadmap milestones
   - Release notes prepared during release branch stabilization

## Versioning Tools and Automation

The following tools help manage our versioning and release process:

1. **Conventional Commits**: Structured commit messages that generate changelogs
2. **Semantic Release**: Automates version determination
3. **GitHub Actions**: Automates CI/CD pipeline for each environment
4. **Migration CLI**: Custom tools for database migration management

## Best Practices

1. **Never rewrite history** on `main` or `develop` branches
2. **Squash commits** when merging feature branches
3. **Rebase feature branches** on latest `develop` before PRs
4. **Write descriptive commit messages** following Conventional Commits format
5. **Keep releases small** to minimize risk
6. **Test migrations** thoroughly before applying to production
7. **Document all changes** in release notes
8. **Maintain a production-like staging environment** for testing

---

This release branch strategy and database migration versioning process should be reviewed periodically and updated as needed. 