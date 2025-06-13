# Task Completion Process

## Task Priority

- **Dart MCP tasks always take precedence** over any other task lists or tracking methods
- Always refer to the Dart MCP system as the source of truth for task status and prioritization
- When conflicting priorities exist, default to the order and priority specified in Dart MCP
- Other task lists (such as in TASK.md) should be kept in sync with Dart MCP, but Dart MCP is authoritative

## Task Status Workflow

1. Tasks begin with status `To-do` (represented as `⬜` in documentation)
2. When implementation begins, mark as `Doing` (represented as `🔄` in documentation) in Dart MCP first, then update other tracking systems
3. When implementation is complete, perform a thorough self-review to verify all requirements have been met
4. After self-review confirms completion, provide the user with a detailed outline of implementations
5. At the end of the outline, explicitly ask: "Should I mark this task as Done in Dart?"
6. Only after explicit user approval (in the form of "yes" or "y"), mark as `Done` (represented as `✅` in documentation)
7. If the user responds with "no", offer potential solutions to address their concerns
8. If rejected or issues found, revert to `Doing` and address issues
9. If more information is needed, communicate this clearly while maintaining the `Doing` status

## Task Completion Protocol

- Never skip the self-review or user approval steps - all tasks must go through both before being marked `Done`
- Always provide a comprehensive outline of completed work when requesting approval
- Include specific details about implementation choices, components created, and features delivered
- Conclude the outline with the explicit question: "Should I mark this task as Done in Dart?"
- Wait for explicit approval (in the form of "yes" or "y") before marking as `Done`
- If approval is denied, offer thoughtful solutions to address any concerns
- Only proceed to the next task after current task is explicitly approved and marked as `Done`
- Update Dart MCP first, then sync TASK.md to reflect current status
- Document all implementation details in your completion outline
- Request feedback clearly when presenting the task implementation outline
- After a task is marked as Done, DO NOT automatically proceed to the next task - always wait for explicit user instruction to begin the next task

## Implementation Guidelines

- Follow the Project Guidelines document strictly
- Adhere to code style and architecture decisions
- Implement full solutions, not just scaffolding
- Write thorough tests for all implementations
- Document code according to the Expert Dev Guidelines
- Use Winston logging appropriately to log all logical connections

## Review Process

- When requesting review, provide a concise summary of what was implemented
- Highlight any decisions or trade-offs made during implementation
- Be prepared to make revisions based on feedback
- After implementing requested changes, request review again
- Only consider a task complete after explicit approval

## Task Sequencing

- Complete tasks in the order they appear in the active Dart MCP task list
- Prioritize tasks based on their order in the Dart MCP boards
- Do not start a new task until the current one is approved and marked as Done
- Never proceed to a new task automatically - always wait for direct user prompt to begin the next task
- If blocked on a task, explain why and request guidance
- For complex tasks, break down into subtasks and track progress
  - Create subtasks in Dart MCP with clear descriptions and acceptance criteria
  - Link subtasks to the parent task for proper organization
  - Track each subtask through the same workflow (Doing → Done)
  - Update the parent task description with progress summaries
  - Consider using checklists within the task description for tracking completion
  - Document dependencies between subtasks to clarify sequencing
  - For especially complex work, create a separate planning document with implementation details
  - After completing a subtask, wait for explicit instruction before proceeding to the next subtask

## Documentation Requirements

- All implemented features must be documented in appropriate locations
- Update relevant README files for new components or services
- Add API documentation for new endpoints
- Include code comments explaining complex logic or important decisions
- Document any configuration changes in appropriate guides
- Create or update diagrams when architectural changes are made

## Communication Protocol

- When starting a task, acknowledge it and confirm understanding
- If encountering ambiguity, ask for clarification immediately
- Provide regular updates for lengthy tasks
- When blocking issues arise, document them clearly with potential solutions
- Always respond to feedback promptly and thoroughly

## Troubleshooting

- If Dart MCP status updates fail, verify that you're using the correct status names: `To-do`, `Doing`, and `Done`
- The symbols `⬜`, `🔄`, `⭕`, `✅`, `❌`, and `❓` in this document are for documentation purposes only and do not directly map to Dart MCP status names
- When requesting approval for a completed task, keep the status as `Doing` and clearly communicate that the task is ready for review
- Only change status to `Done` after receiving explicit approval
