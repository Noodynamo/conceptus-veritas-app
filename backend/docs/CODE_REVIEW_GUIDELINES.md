# Code Review Guidelines

This document outlines the code review process and requirements for the Conceptus Veritas backend repository.

## Objectives

Code reviews serve several critical purposes:

1. **Quality Assurance**: Identify bugs, security vulnerabilities, and potential issues before they reach production
2. **Knowledge Sharing**: Ensure at least two people understand each piece of code
3. **Code Consistency**: Maintain consistent coding standards across the codebase
4. **Best Practices**: Ensure adherence to architectural patterns and established practices
5. **Documentation**: Verify appropriate documentation and comments
6. **Testing**: Confirm adequate test coverage for all changes

## Code Review Process

### Before Requesting a Review

Before requesting a review, ensure your code meets these requirements:

1. **CI/CD Checks**: All automated checks must pass
2. **Self-Review**: Perform your own review first using the checklist below
3. **Documentation**: Update any relevant documentation
4. **Tests**: Include appropriate tests with good coverage
5. **PR Description**: Complete all sections of the PR template

### Review Request Guidelines

When requesting a review:

1. **Appropriate Reviewers**: Request reviews from relevant code owners and at least one other team member
2. **Small PRs**: Keep PRs focused and reasonably sized (under 500 lines when possible)
3. **Context**: Provide context in the PR description about the purpose and approach
4. **Areas of Focus**: Highlight areas you'd like reviewers to focus on, if applicable

### For Reviewers

When reviewing code:

1. **Timeliness**: Review PRs within 24 business hours of assignment
2. **Thoroughness**: Review the entire PR, not just the parts you're familiar with
3. **Constructive Feedback**: Be specific, helpful, and kind in your comments
4. **Approve Thoughtfully**: Only approve if you're confident in the changes
5. **Large PRs**: For PRs exceeding 500 lines, consider requesting they be broken down

## Review Checklist

### Functionality

- [ ] Code works as described in the PR description
- [ ] Edge cases are properly handled
- [ ] Error handling is appropriate and consistent
- [ ] Performance considerations have been addressed

### Code Quality

- [ ] Code follows project style guidelines
- [ ] No unnecessary complexity or over-engineering
- [ ] No duplication of existing functionality
- [ ] Code is modular and follows separation of concerns
- [ ] Variable and function names are clear and descriptive
- [ ] Proper abstraction levels are maintained

### Security

- [ ] Authentication and authorization checks are present where needed
- [ ] User input is properly validated and sanitized
- [ ] No sensitive information is exposed or logged
- [ ] Secure coding practices are followed
- [ ] No potential injection vulnerabilities

### Testing

- [ ] Tests cover happy paths, edge cases, and error scenarios
- [ ] Test coverage meets minimum thresholds (80% line coverage)
- [ ] Tests are clear and maintainable
- [ ] Mocks and stubs are used appropriately

### Documentation

- [ ] Code includes appropriate comments for complex logic
- [ ] Public APIs have JSDoc comments
- [ ] README or other documentation is updated if needed
- [ ] Comments explain "why" not just "what"

## Required Approvals

Pull requests have different approval requirements based on the target branch:

### For `develop` Branch
- At least 1 approval required
- Code owner approval required for sensitive areas

### For `main` Branch
- At least 2 approvals required
- Code owner approval required
- Tech lead approval for significant changes

## Comment Guidelines

### Types of Comments

1. **Blocking**: Issues that must be fixed before approval
   - Security vulnerabilities
   - Bugs or incorrect behavior
   - Breaking changes to public APIs without proper versioning
   - Missing critical tests

2. **Non-blocking**: Suggestions that can be addressed in follow-up PRs
   - Style improvements
   - Minor refactoring opportunities
   - Additional test coverage beyond minimum requirements
   - Documentation enhancements

3. **Questions**: Seeking clarification about the code
   - Reasoning behind specific approaches
   - Architectural decisions
   - Implementation details

### Commenting Best Practices

- Be specific about what needs to change
- Explain why changes are needed, not just what to change
- Provide examples or references when possible
- Use a constructive and respectful tone
- Prefix optional suggestions with "Suggestion:" or "Nit:"

## Code Owner Responsibilities

Code owners, as defined in the CODEOWNERS file, have special responsibilities:

1. Prioritize reviewing PRs in their areas of ownership
2. Ensure architectural consistency within their modules
3. Keep documentation up to date for their areas
4. Mentor other team members on best practices in their domain

## Resolving Disagreements

If reviewers and authors disagree about implementation:

1. Have a real-time discussion (chat, video call, etc.)
2. Consider involving a third reviewer, preferably a tech lead
3. Document the decision and reasoning in the PR
4. Respect the final decision, even if you disagree

## Continuous Improvement

The code review process itself should be regularly reviewed and improved:

1. Share code review best practices in team meetings
2. Periodically review and update these guidelines
3. Celebrate thorough, helpful reviews
4. Use retrospectives to identify opportunities for improvement

---

This document should evolve as our team and codebase grows. Suggestions for improvements are always welcome. 