# Repository Settings

This document outlines the GitHub repository settings for the Conceptus Veritas backend repository, including branch protection rules, access control, and other configuration details.

## Branch Protection Rules

### `main` Branch
- **Status**: Protected
- **Requirements for Merging**:
  - Require a pull request before merging
  - Require at least 2 approvals
  - Dismiss stale pull request approvals when new commits are pushed
  - Require review from code owners
  - Require status checks to pass before merging
    - Required checks: code-quality, unit-tests, integration-tests, build, security-scan
  - Require conversation resolution before merging
  - Require signed commits
  - Require linear history
  - Include administrators in these restrictions
  - Restrict who can push to matching branches: engineering-leads

### `develop` Branch
- **Status**: Protected
- **Requirements for Merging**:
  - Require a pull request before merging
  - Require at least 1 approval
  - Dismiss stale pull request approvals when new commits are pushed
  - Require review from code owners
  - Require status checks to pass before merging
    - Required checks: code-quality, unit-tests, integration-tests, build
  - Require conversation resolution before merging
  - Require linear history
  - Include administrators in these restrictions

### Release Branches (`release/*`)
- **Status**: Protected
- **Requirements for Merging**:
  - Require a pull request before merging
  - Require at least 1 approval
  - Dismiss stale pull request approvals when new commits are pushed
  - Require review from code owners
  - Require status checks to pass before merging
    - Required checks: code-quality, unit-tests, integration-tests, build, security-scan
  - Require linear history
  - Include administrators in these restrictions

## Repository Features

### Issues
- **Status**: Enabled
- **Issue Templates**:
  - Bug Report
  - Feature Request
  - Documentation Update
  - Security Vulnerability
  - Performance Issue

### Wikis
- **Status**: Disabled (documentation maintained in the repository)

### Projects
- **Status**: Enabled
- **Project Template**: Kanban-style project board

### Discussions
- **Status**: Enabled
- **Categories**:
  - Announcements
  - General
  - Ideas
  - Q&A
  - Show and Tell

### Merge Button Settings
- **Allow merge commits**: Disabled
- **Allow squash merging**: Enabled (default)
- **Allow rebase merging**: Disabled
- **Always suggest updating pull request branches**: Enabled
- **Automatically delete head branches**: Enabled

## Access Control

### Teams and Permissions
- **Admin Access**: Repository administrators
- **Maintain Access**: Engineering leads
- **Write Access**: Backend developers
- **Triage Access**: QA team
- **Read Access**: All organization members

### Outside Collaborators
- **Limited to**: Approved contractors with specific access levels
- **Approval Process**: Requires admin approval and signing of contributor agreement

## Webhooks and Integrations

### Required Integrations
- **CI/CD**: GitHub Actions
- **Code Quality**: SonarQube
- **Dependency Management**: Dependabot
- **Security Scanning**: Snyk
- **Performance Monitoring**: Datadog
- **Error Tracking**: Sentry

### Webhooks
- **Slack Integration**: Notifications for PRs, issues, and deployments
- **JIRA Integration**: Sync issues with JIRA tickets
- **Status Checks**: Report build and test status

## Code Scanning and Security

### Secret Scanning
- **Status**: Enabled
- **Scanning for**: API keys, access tokens, certificates, SSH keys

### Code Scanning (CodeQL)
- **Status**: Enabled
- **Languages**: JavaScript, TypeScript
- **Schedule**: On push to main/develop and weekly

### Dependency Review
- **Status**: Enabled
- **Alerting**: High and critical vulnerabilities block PRs

## Automation Settings

### GitHub Actions
- **Status**: Enabled
- **Workflow Permissions**: Read and write permissions
- **Required Workflows**: See `.github/workflows/` directory

### Issue Automation
- **Auto-assignment**: Based on code ownership
- **Auto-labeling**: Based on file paths and content
- **Stale issue handling**: Warning after 30 days, closing after 45 days of inactivity

## Repository Guidelines

### Commit Signing
- **Status**: Required for all commits
- **Setup Instructions**: Available in the developer onboarding documentation

### Large File Storage
- **Status**: Enabled for assets directory
- **Allowed File Types**: Images, audio files, binary documents

### Review Requirements
- **See**: [CODE_REVIEW_GUIDELINES.md](./CODE_REVIEW_GUIDELINES.md) for detailed review requirements

## Maintenance Procedures

### Scheduled Maintenance
- **Dependency Updates**: Weekly via Dependabot
- **Security Scans**: Daily
- **Performance Benchmarks**: Weekly

### Backup and Archiving
- **Git Backup**: Daily to separate storage
- **Release Archiving**: All releases archived to long-term storage

---

## Implementation Status

These settings are enforced through:
1. GitHub repository settings UI
2. Branch protection rules configuration
3. CODEOWNERS file
4. GitHub Actions workflows
5. Automated configuration tools

The settings in this document are the source of truth for repository configuration. Any changes to these settings should be proposed via a pull request to update this document first. 