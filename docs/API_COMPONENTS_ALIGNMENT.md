# API & Components Master List Alignment Guidelines

This document outlines the requirements and process for ensuring all development work aligns with the Conceptus Veritas API & Components Master List.

## Overview

The API & Components Master List (found in `frontend/API_Components_Master_List.md`) serves as the definitive reference for our application's architecture. It contains:

1. A comprehensive inventory of all API endpoints
2. A catalog of all frontend components
3. A listing of all backend components and services
4. Documentation of data flows and integration points

**Strict adherence to this Master List is required for all development work.**

## Why This Matters

Maintaining alignment with the Master List ensures:

- Consistent architectural patterns across the codebase
- Prevention of duplicate/overlapping functionality
- Clear understanding of component responsibilities
- Accurate technical documentation
- Improved developer onboarding
- More effective code reviews

## Requirements for Developers

### During Feature Planning

1. **Always consult the Master List first** when planning new features or changes
2. **Identify relevant components** from the Master List that will be used or modified
3. **Document any gaps** where new components may be needed
4. **Include explicit references** to Master List components in feature specifications

### During Implementation

1. **Follow established patterns** from existing components in the Master List
2. **Maintain separation of concerns** as defined in the Master List
3. **Use existing components** whenever possible instead of creating new ones
4. **Document any deviations** with clear justification

### In Pull Requests

1. **Complete the API & Components section** in the PR template
2. **Explicitly list all endpoints and components** used or modified
3. **Provide justification** for any components not in the Master List
4. **Update the Master List** if creating new components

## Requirements for Reviewers

### During Code Reviews

1. **Verify alignment** with the Master List as the first step in any review
2. **Block PRs** that don't properly reference the Master List
3. **Question new components** when existing ones could be used
4. **Ensure documentation** is updated when necessary

### Enforcement Checklist

- [ ] PR template's API & Components section is fully completed
- [ ] All API endpoints used/modified are correctly referenced
- [ ] All frontend components used/modified are correctly referenced
- [ ] All backend components used/modified are correctly referenced
- [ ] Any new components are properly justified
- [ ] Master List has been updated if new components were created

## Master List Updates

When new components need to be added to the Master List:

1. **Create a separate PR** for updating the Master List
2. **Include thorough documentation** about the new component
3. **Explain why existing components** couldn't meet the requirements
4. **Get approval** from the architecture team
5. **Announce the update** to all developers

## Automation & Tooling

### GitHub PR Checks

An automated GitHub action will verify that PRs properly reference the Master List by:

1. Checking that the API & Components section is completed
2. Scanning the changed files against the referenced components
3. Flagging any mismatches for reviewer attention

### Cursor AI Integration

Cursor AI is configured to:

1. Automatically reference the Master List when developing solutions
2. Suggest existing components based on functionality requirements
3. Maintain API naming consistency with Master List
4. Flag potential architectural misalignments

## Regular Review Process

The alignment process itself will be reviewed:

1. Bi-weekly during sprint planning
2. Before each milestone release
3. Whenever significant architecture changes are proposed

## Getting Help

If you're unsure about Master List alignment:

1. Consult with the architecture team
2. Reference the technical documentation
3. Look at recent PRs for examples of proper alignment
4. Ask questions in the #architecture Slack channel

---

By enforcing these guidelines, we ensure a cohesive, maintainable codebase that follows our established architectural patterns.
