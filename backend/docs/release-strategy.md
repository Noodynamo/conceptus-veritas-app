# Release Branch Strategy

This document outlines the release branch strategy for the Conceptus Veritas backend repository, including versioning conventions, branch management, and release procedures.

## Versioning

We follow [Semantic Versioning (SemVer)](https://semver.org/) for our releases:

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

- **MAJOR**: Incremented for incompatible API changes
- **MINOR**: Incremented for backward-compatible functionality additions
- **PATCH**: Incremented for backward-compatible bug fixes
- **PRERELEASE**: Optional identifier for pre-release versions (e.g., `alpha`, `beta`, `rc.1`)
- **BUILD**: Optional build metadata

Examples:
- `1.0.0`: Initial stable release
- `1.1.0`: New features added
- `1.1.1`: Bug fixes
- `2.0.0`: Breaking changes
- `1.2.0-beta.1`: Beta release for testing
- `1.2.0-rc.1`: Release candidate

## Branch Structure

We use a modified GitFlow workflow with the following branches:

### Long-lived Branches

- **`main`**: Production-ready code (stable)
- **`develop`**: Integration branch for features (unstable)

### Short-lived Branches

- **`feature/*`**: New features or enhancements (from `develop`)
- **`bugfix/*`**: Bug fixes for upcoming releases (from `develop`)
- **`release/*`**: Preparing for a release (from `develop`)
- **`hotfix/*`**: Urgent fixes for production (from `main`)

## Branch Naming Conventions

- Feature branches: `feature/[issue-id]-short-description`
- Bugfix branches: `bugfix/[issue-id]-short-description`
- Release branches: `release/v[version]`
- Hotfix branches: `hotfix/v[version]`

Examples:
- `feature/123-user-authentication`
- `bugfix/145-fix-login-error`
- `release/v1.2.0`
- `hotfix/v1.1.1`

## Release Process

### Standard Release

1. **Prepare Release Branch**:
   ```bash
   git checkout develop
   git pull
   git checkout -b release/v1.2.0
   ```

2. **Version Bump and Changelog**:
   - Update version in `package.json`
   - Update `CHANGELOG.md`
   - Make any final release adjustments

3. **Quality Assurance**:
   - Run tests
   - Deploy to staging environment
   - Perform manual testing

4. **Finalize Release**:
   ```bash
   git add .
   git commit -m "chore(release): prepare v1.2.0"
   ```

5. **Merge to Main**:
   ```bash
   git checkout main
   git pull
   git merge --no-ff release/v1.2.0 -m "chore(release): merge v1.2.0 to main"
   git tag -a v1.2.0 -m "Release v1.2.0"
   git push origin main --tags
   ```

6. **Merge Back to Develop**:
   ```bash
   git checkout develop
   git pull
   git merge --no-ff release/v1.2.0 -m "chore(release): merge v1.2.0 to develop"
   git push origin develop
   ```

7. **Clean Up**:
   ```bash
   git branch -d release/v1.2.0
   ```

### Hotfix Process

1. **Create Hotfix Branch**:
   ```bash
   git checkout main
   git pull
   git checkout -b hotfix/v1.1.1
   ```

2. **Fix the Issue**:
   - Make necessary changes
   - Update version in `package.json`
   - Update `CHANGELOG.md`

3. **Commit and Test**:
   ```bash
   git add .
   git commit -m "fix: [description of the fix]"
   ```

4. **Merge to Main**:
   ```bash
   git checkout main
   git pull
   git merge --no-ff hotfix/v1.1.1 -m "fix: merge hotfix v1.1.1 to main"
   git tag -a v1.1.1 -m "Hotfix v1.1.1"
   git push origin main --tags
   ```

5. **Merge to Develop**:
   ```bash
   git checkout develop
   git pull
   git merge --no-ff hotfix/v1.1.1 -m "fix: merge hotfix v1.1.1 to develop"
   git push origin develop
   ```

6. **Clean Up**:
   ```bash
   git branch -d hotfix/v1.1.1
   ```

## Release Automation

We use GitHub Actions to automate parts of the release process:

1. **Creating a Release**:
   - When a tag is pushed, a GitHub Action builds the release
   - Artifacts are generated and attached to the GitHub Release
   - Release notes are generated from the tag message or CHANGELOG.md

2. **Deployment**:
   - Main branch is automatically deployed to production
   - Release branches are deployed to staging for testing

## Release Schedule

We follow a predictable release schedule:

- **Minor Releases**: Every 2-4 weeks
- **Major Releases**: As needed, with advanced notice
- **Patch Releases**: As needed for bug fixes
- **Hotfixes**: Immediately as critical issues arise

## Version Control in API

### API Versioning

We version our API using URL path versioning:

```
https://api.example.com/v1/users
```

When making breaking changes, we increment the major version number in the URL and maintain backward compatibility for a defined deprecation period.

### API Version Lifecycle

1. **Active**: Current version, fully supported
2. **Deprecated**: Still works but scheduled for removal
3. **Sunset**: No longer available

We communicate deprecation at least 6 months before sunsetting an API version.

## Documentation

For each release:

1. Update API documentation
2. Update migration guides if necessary
3. Communicate breaking changes
4. Provide upgrade instructions

## Release Notes

Release notes should include:

- Version number and release date
- New features
- Bug fixes
- Breaking changes
- Deprecations
- Security updates
- Performance improvements
- Contributors

## Emergency Rollback Procedure

If a critical issue is discovered after deployment:

1. **Assess Impact**: Determine severity and scope
2. **Decision Point**: Fix forward or rollback
3. **Rollback Process**:
   ```bash
   git checkout main
   git revert <problematic-commit>
   git push origin main
   ```
4. **Communication**: Inform stakeholders of the issue and rollback 