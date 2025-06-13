# CODEOWNERS Guide

This document explains how the CODEOWNERS file works in the Conceptus Veritas backend repository and how to maintain it.

## What is CODEOWNERS?

The CODEOWNERS file is a special file that defines which team members are responsible for code in different parts of the repository. When someone opens a pull request that modifies code in a particular area, the corresponding code owners are automatically requested for review.

## How CODEOWNERS Works

- CODEOWNERS uses a pattern matching system similar to .gitignore files
- Patterns are matched against file paths relative to the location of the CODEOWNERS file
- Order is important - the last matching pattern takes precedence
- Multiple owners can be specified for each pattern
- GitHub usernames, team names, or email addresses can be used as owners

## Pattern Syntax

- `*`: Matches any character except for `/`
- `**`: Matches any character including `/`
- `/`: Used to separate directories
- `#`: Starts a comment
- `\`: Escapes special characters

Examples:
- `*.js` matches all JavaScript files in the repository
- `/docs/*.md` matches all Markdown files in the docs directory
- `/src/api/**/*.js` matches all JavaScript files in the src/api directory and all subdirectories

## Maintaining CODEOWNERS

When updating the CODEOWNERS file:

1. **Be Specific**: Use the most specific pattern possible to target the right files
2. **Use Comments**: Add clear comments to explain the purpose of each section
3. **Consider Structure**: Organize patterns logically, grouping related patterns together
4. **Check for Conflicts**: Ensure patterns don't unintentionally override each other
5. **Update Regularly**: Keep the file up-to-date as the repository structure evolves
6. **Onboard New Team Members**: Add new team members to appropriate sections

## Adding New Owners

To add a new owner:

1. Identify the area(s) of code they should be responsible for
2. Add their GitHub username to the appropriate pattern(s)
3. If adding a new pattern, place it in the appropriate section
4. Consider whether they should be added to broader patterns as well

## Example

```
# API controllers
/src/api/controllers/    @api-team @tech-lead

# Authentication modules
/src/auth/               @security-team @tech-lead

# Specific critical file
/src/config/security.js  @security-team
```

## Best Practices

1. **Assign Teams Where Possible**: Prefer assigning teams over individuals to reduce bottlenecks
2. **Distribute Ownership**: Avoid having a single person as the owner for too many areas
3. **Designate Backups**: Ensure critical areas have multiple owners
4. **Consider Expertise**: Assign ownership based on expertise and knowledge
5. **Limit Scope**: Don't make code ownership too broad or too narrow
6. **Document Expectations**: Make sure code owners understand their responsibilities

## Current Ownership Structure

The current CODEOWNERS file in our repository is structured as follows:

1. Repository configuration and GitHub workflows
2. API routes and controllers
3. Database models, schemas, and migrations
4. Core functionality
5. Services (including AI-specific components)
6. Configuration files
7. Tests
8. Tasks and utilities
9. Package dependencies
10. Security-related files
11. Documentation

## Review Process for CODEOWNERS Changes

Changes to the CODEOWNERS file itself should be reviewed by the tech lead and team managers to ensure appropriate ownership assignments. 