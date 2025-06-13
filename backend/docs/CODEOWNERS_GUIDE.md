# CODEOWNERS Guide

This document provides guidance on the CODEOWNERS file configuration, usage, and best practices for the Conceptus Veritas backend repository.

## What is CODEOWNERS?

The CODEOWNERS file defines individuals or teams responsible for code in a repository. When someone opens a pull request that modifies code owned by a specific team or person, those owners are automatically requested for review.

## Location and Format

Our CODEOWNERS file is located at: `.github/CODEOWNERS`

The file uses a simple pattern format similar to gitignore:
```
# Comments start with #
/path/to/directory/  @owner1 @owner2 @team/name
/specific/file.ts    @owner1
*.js                 @team/javascript-developers
```

## Teams and Responsibility Areas

We've organized code ownership by functional teams:

| Team | Description | Areas of Responsibility |
|------|-------------|-------------------------|
| @conceptus-veritas/backend-leads | Lead backend developers | Architecture, core functionality, critical configuration |
| @conceptus-veritas/backend-developers | All backend developers | General services, utilities, tests |
| @conceptus-veritas/security-team | Security specialists | Authentication, authorization, security-critical code |
| @conceptus-veritas/devops | DevOps specialists | CI/CD, deployment, infrastructure |
| @conceptus-veritas/database | Database specialists | Models, schemas, migrations |
| @conceptus-veritas/ai-team | AI and ML specialists | AI services, models, evaluation |
| @conceptus-veritas/docs | Documentation specialists | Documentation, guides, README files |
| @conceptus-veritas/api-team | API design specialists | API endpoints, controllers, schemas |

## How Reviews Work with CODEOWNERS

1. When a pull request is opened, GitHub automatically requests reviews from the appropriate code owners
2. Requested reviewers appear in the PR sidebar
3. PRs affecting multiple owned areas will request reviews from all relevant owners
4. Code owner approval is required for PRs if branch protection rules are set to require it

## Code Owner Responsibilities

As a code owner, you have additional responsibilities:

1. **Timely Reviews**: Review PRs in your owned areas promptly (within 24 business hours)
2. **Thorough Assessment**: Ensure changes follow best practices and maintain code quality
3. **Knowledge Sharing**: Use review opportunities to share knowledge about your area
4. **Documentation**: Ensure relevant documentation is kept up to date
5. **Mentorship**: Guide other team members on best practices in your domain

## Best Practices for Developers

When working with code that has designated owners:

1. **Pre-Review Engagement**: For significant changes, consider discussing with code owners before implementation
2. **Self-Review**: Review your own code against the owned area's standards before requesting review
3. **Tag Specific Reviewers**: If you need insights from specific individuals, tag them in comments
4. **Respond to Feedback**: Address all code owner feedback thoroughly
5. **Learn from Reviews**: Use code owner feedback as a learning opportunity

## Ownership Hierarchy

The CODEOWNERS file follows a "last match wins" rule:

1. More specific patterns take precedence over general ones
2. Later matches override earlier matches
3. The last matching pattern in the file determines the final code owners

## Requesting Changes to CODEOWNERS

If you believe the CODEOWNERS file needs updating:

1. Discuss with your team lead first
2. Open a PR with the proposed changes
3. Provide justification for the ownership change
4. Ensure all affected teams are notified and involved in the review

## Handling Ownership Conflicts

If there are disagreements about code ownership:

1. Start with a discussion between the involved teams/individuals
2. Escalate to team leads if necessary
3. Focus on technical justifications for ownership
4. Consider creating "shared ownership" where appropriate

## Maintaining the CODEOWNERS File

The CODEOWNERS file should be reviewed and updated:

1. When new directories or important files are added
2. When team structures or responsibilities change
3. When new team members join who should be owners
4. At least quarterly to ensure it remains current

## Limitations and Considerations

Be aware of these limitations:

1. CODEOWNERS cannot specify ownership at the function or class level
2. Having too many owners can dilute responsibility
3. Having too few owners can create bottlenecks
4. GitHub only notifies the first 3 matching owner teams

## Integration with Other Processes

The CODEOWNERS file integrates with:

1. **Branch Protection**: Can require code owner approval for merging
2. **PR Templates**: Can suggest or automate selecting reviewers
3. **Auto-assignment**: Can be used to automatically assign issues

---

This guide should be reviewed and updated as our team structure and codebase evolve. 