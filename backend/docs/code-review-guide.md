# Code Review Guide

This document outlines the code review process and requirements for the Conceptus Veritas backend repository.

## Code Review Principles

Our code review process follows these core principles:

1. **Be Respectful and Constructive**: Focus on the code, not the person. Provide actionable feedback.
2. **Be Thorough**: Take the time to understand the changes and their implications.
3. **Be Timely**: Respond to review requests promptly (ideally within 24 hours).
4. **Be Clear**: Clearly articulate your concerns and suggestions.
5. **Focus on Improvement**: The goal is to improve code quality and share knowledge.

## Code Review Process

### For Authors

1. **Prepare Your Changes**:
   - Ensure your code follows our [coding standards](./coding-standards.md)
   - Write clear commit messages
   - Include tests for your changes
   - Update documentation if necessary

2. **Create a Pull Request**:
   - Use the PR template
   - Fill in all relevant sections
   - Link to related issues
   - Provide context for your changes

3. **Respond to Feedback**:
   - Address all comments
   - Explain your reasoning when you disagree
   - Make requested changes promptly
   - Notify reviewers when you've addressed their feedback

### For Reviewers

1. **Review Promptly**:
   - Aim to complete reviews within 24 business hours
   - If you can't review in time, notify the author and suggest another reviewer

2. **Be Thorough**:
   - Verify the code works as intended
   - Check for edge cases
   - Validate test coverage
   - Review documentation updates

3. **Provide Constructive Feedback**:
   - Be specific and clear
   - Explain the reasoning behind your suggestions
   - Differentiate between required changes and suggestions
   - Share relevant resources or examples when possible

4. **Approve When Ready**:
   - Only approve PRs that meet our quality standards
   - If you request changes, follow up to verify they've been addressed

## Code Review Requirements

All pull requests must meet these requirements before merging:

### Functional Requirements

- [ ] The code works as intended and fulfills the requirements
- [ ] All edge cases are handled appropriately
- [ ] The PR includes appropriate error handling
- [ ] The PR includes necessary logging

### Technical Requirements

- [ ] The code follows our coding standards and style guide
- [ ] The PR includes appropriate tests with adequate coverage
- [ ] All automated checks pass (linting, type checking, tests)
- [ ] The code is performant and efficient
- [ ] Security best practices are followed

### Documentation Requirements

- [ ] The code is well-commented where necessary
- [ ] Public APIs are documented
- [ ] Changes to existing APIs are reflected in documentation
- [ ] The PR description clearly explains the changes

### Review Requirements

- [ ] At least one approval from a code owner
- [ ] All required changes have been addressed
- [ ] No unresolved comments or discussions

## Review Checklist

Reviewers should consider the following aspects:

### Code Quality

- Is the code easy to understand and maintain?
- Is the code DRY (Don't Repeat Yourself)?
- Are functions and variables named descriptively?
- Is the code modular and reusable?
- Are there any unnecessary complexities?

### Functionality

- Does the code correctly implement the requirements?
- Are there any logical errors or bugs?
- Are edge cases handled appropriately?
- Is error handling comprehensive?

### Security

- Are there any potential security vulnerabilities?
- Is user input properly validated and sanitized?
- Are authentication and authorization checks in place?
- Are sensitive data handled securely?

### Performance

- Are there any performance bottlenecks?
- Are database queries optimized?
- Are appropriate caching strategies used?
- Could any operations be more efficient?

### Testing

- Are there tests for the new functionality?
- Do tests cover edge cases and error conditions?
- Are tests clear and maintainable?
- Is the test coverage adequate?

## Branch Protection Settings

The following branch protection rules are in place:

### For `main` and `develop` branches:

- Require pull request reviews before merging
- Require at least 1 approval from code owners
- Dismiss stale pull request approvals when new commits are pushed
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Do not allow bypassing the above settings
- Restrict who can push to matching branches (only administrators)

### For feature and bugfix branches:

- No specific protection rules, but all changes must go through PR process

## Review Comments

When commenting on code, follow these guidelines:

- **Prefix comments** to indicate their nature:
  - `[Blocker]`: Must be fixed before merging
  - `[Suggestion]`: Recommended improvement, but optional
  - `[Question]`: Seeking clarification
  - `[Nit]`: Minor style or formatting issue
  - `[Praise]`: Positive feedback on good code

- **Be specific and actionable**:
  - ❌ "This function is poorly written."
  - ✅ "This function could be simplified by using Array.map() instead of a for loop."

- **Explain why**:
  - ❌ "Use a different variable name."
  - ✅ "Consider renaming 'data' to 'userProfile' to better indicate what it contains."

## Additional Resources

- [Google's Code Review Guidelines](https://google.github.io/eng-practices/review/)
- [Thoughtbot's Code Review Guide](https://github.com/thoughtbot/guides/tree/main/code-review)
- [The Art of Readable Code](https://www.oreilly.com/library/view/the-art-of/9781449318482/) 