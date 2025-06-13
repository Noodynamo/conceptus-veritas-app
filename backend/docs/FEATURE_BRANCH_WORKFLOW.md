# Feature Branch Workflow for Backend Repository

This document outlines the standardized feature branch workflow for the Conceptus Veritas backend repository.

## Branch Naming Convention

All branches should follow this naming pattern:

- `feature/[issue-number]-short-description` - For new features
- `bugfix/[issue-number]-short-description` - For bug fixes
- `hotfix/[issue-number]-short-description` - For critical fixes to production
- `refactor/[issue-number]-short-description` - For code refactoring
- `docs/[issue-number]-short-description` - For documentation updates
- `test/[issue-number]-short-description` - For test-only changes

Examples:
- `feature/123-user-authentication`
- `bugfix/456-fix-password-reset`

## Main Branches

- **main**: Production-ready code only. Deploys to production.
- **develop**: Integration branch for features. Deploys to staging.

## Workflow Steps

1. **Create a new branch**
   - Always branch from `develop` for regular development
   - Branch from `main` only for hotfixes

   ```bash
   git checkout develop
   git pull
   git checkout -b feature/123-user-authentication
   ```

2. **Develop and commit changes**
   - Make small, focused commits
   - Write descriptive commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification
   - Example: `feat(auth): implement JWT token validation`

3. **Keep your branch updated**
   - Regularly sync with the source branch (usually `develop`)
   
   ```bash
   git checkout develop
   git pull
   git checkout feature/123-user-authentication
   git merge develop
   # Resolve any conflicts if needed
   ```

4. **Run tests locally**
   - Ensure all tests pass before pushing
   - Run linting checks
   
   ```bash
   npm run test
   npm run lint
   ```

5. **Push and create a Pull Request**
   - Push your branch to the remote repository
   - Create a Pull Request targeting the `develop` branch (or `main` for hotfixes)
   - Fill out the PR template completely
   
   ```bash
   git push -u origin feature/123-user-authentication
   ```

6. **Code Review Process**
   - Request reviews from required reviewers
   - Address all feedback through additional commits
   - Do not squash or rebase during the review process to maintain review history

7. **Automated Checks**
   - All PRs must pass the CI pipeline checks
   - Required checks include:
     - Linting
     - Unit tests
     - Integration tests
     - Code coverage
     - Security scan

8. **Merging**
   - Once approved and all checks pass, merge using the "Squash and merge" option
   - Ensure the squashed commit message summarizes the changes appropriately
   - The branch will be automatically deleted after merging

9. **Releases**
   - When `develop` is ready for release, create a PR from `develop` to `main`
   - After thorough testing in staging, merge to `main` using "Create a merge commit"
   - Tag the release in `main` with a version number following semantic versioning

## Branch Protection

Both `main` and `develop` branches are protected with these rules:

- Require pull request reviews before merging
- Require status checks to pass before merging
- Require linear history (no merge commits)
- Include administrators in these restrictions
- Restrict who can push to matching branches

## Additional Guidelines

- Keep branches short-lived (ideally less than 2 weeks)
- One feature or fix per branch
- Regularly clean up local and remote branches
- Do not commit directly to `main` or `develop`
- Do not force-push to shared branches

By following this workflow, we ensure a consistent and reliable development process for the Conceptus Veritas backend repository. 