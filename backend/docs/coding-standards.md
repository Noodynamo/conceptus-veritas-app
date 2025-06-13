# Coding Standards

This document outlines the coding standards and best practices for the Conceptus Veritas backend repository.

## General Principles

- **KISS (Keep It Simple, Stupid)**: Prefer simple solutions over complex ones.
- **DRY (Don't Repeat Yourself)**: Avoid code duplication.
- **YAGNI (You Aren't Gonna Need It)**: Don't add functionality until it's necessary.
- **Separation of Concerns**: Each component should have a single responsibility.
- **Consistency**: Follow established patterns throughout the codebase.

## Code Formatting

We use ESLint and Prettier to enforce code formatting standards:

- 2-space indentation
- Semicolons required
- Single quotes for strings
- Trailing commas in multiline objects and arrays
- Maximum line length of 100 characters
- No unused variables or imports
- Consistent spacing around operators

All code must pass ESLint and Prettier checks before merging. Run these checks locally:

```bash
# Check code formatting
npm run format:check

# Fix formatting issues
npm run format

# Run ESLint
npm run lint

# Fix linting issues when possible
npm run lint:fix
```

## TypeScript Guidelines

- **Use Strong Typing**: Avoid `any` type when possible.
- **Define Interfaces and Types**: Create clear interfaces for data structures.
- **Use Type Guards**: When narrowing types, use proper type guards.
- **Readonly Properties**: Use readonly for immutable properties.
- **Function Signatures**: Clearly define parameter and return types.

Example:

```typescript
// Good
interface User {
  readonly id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

function getUserById(id: string): Promise<User | null> {
  // Implementation
}

// Bad
function getUser(id): any {
  // Implementation
}
```

## File Organization

- One class or component per file
- Group related files in appropriate directories
- Name files according to their primary export
- Use consistent file naming conventions:
  - `kebab-case.ts` for utility files
  - `PascalCase.ts` for classes and React components
  - `.interface.ts` suffix for interface files
  - `.model.ts` suffix for model files
  - `.service.ts` suffix for service files
  - `.controller.ts` suffix for controllers
  - `.repository.ts` suffix for repositories

## Naming Conventions

- **Classes and Interfaces**: PascalCase
- **Variables and Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Private Class Members**: prefix with underscore (_)
- **Boolean Variables**: use prefixes like 'is', 'has', 'should'
- **Array Variables**: use plural nouns

Example:

```typescript
// Good
const MAX_RETRY_COUNT = 3;
class UserService {
  private _userRepository: UserRepository;

  public async getActiveUsers(): Promise<User[]> {
    // Implementation
  }
  
  private _validateUser(user: User): boolean {
    // Implementation
  }
}

// Bad
const max = 3;
class userservice {
  userrepo: any;

  getusers() {
    // Implementation
  }
}
```

## Comments and Documentation

- Use JSDoc comments for public API methods and classes
- Write comments that explain "why", not "what"
- Keep comments up-to-date with code changes
- Document any non-obvious behavior or edge cases

Example:

```typescript
/**
 * Authenticates a user using email and password
 * 
 * @param email - User's email address
 * @param password - User's password (plaintext)
 * @returns User object if authentication succeeds, null otherwise
 * @throws {AuthenticationError} If authentication service is unavailable
 */
async function authenticateUser(email: string, password: string): Promise<User | null> {
  // Implementation
}
```

## Error Handling

- Use custom error classes for different error types
- Include meaningful error messages
- Log errors with appropriate context
- Handle all promises with try/catch or .catch()
- Return appropriate HTTP status codes from API endpoints

Example:

```typescript
try {
  const user = await userService.findById(userId);
  if (!user) {
    throw new NotFoundError(`User with ID ${userId} not found`);
  }
  return user;
} catch (error) {
  logger.error(`Error fetching user ${userId}`, { error });
  if (error instanceof NotFoundError) {
    throw error; // Rethrow application errors
  }
  throw new InternalServerError('Unable to process user request');
}
```

## Testing Standards

- Write unit tests for all business logic
- Write integration tests for API endpoints
- Aim for at least 80% code coverage
- Tests should be independent and idempotent
- Use meaningful test descriptions

Example:

```typescript
describe('UserService', () => {
  describe('getById', () => {
    it('should return user when valid ID is provided', async () => {
      // Test implementation
    });
    
    it('should return null when user does not exist', async () => {
      // Test implementation
    });
    
    it('should throw DatabaseError when database connection fails', async () => {
      // Test implementation
    });
  });
});
```

## Database Access

- Use repositories to encapsulate database operations
- Use transactions for operations that modify multiple records
- Always validate input before database operations
- Use parameterized queries to prevent SQL injection
- Keep database schema changes in migrations

## API Design

- Follow RESTful principles for API endpoints
- Use consistent URL patterns
- Return appropriate HTTP status codes
- Validate input using schemas (e.g., Joi, Zod)
- Include pagination for collection endpoints
- Use HATEOAS for resource links

## Security Practices

- Always validate and sanitize user input
- Use parameterized queries for database operations
- Implement proper authentication and authorization checks
- Don't expose sensitive information in error messages
- Set appropriate security headers in HTTP responses
- Use environment variables for sensitive configuration

## Performance Considerations

- Use async/await for asynchronous operations
- Implement caching for expensive operations
- Optimize database queries with proper indexing
- Use connection pooling for database connections
- Implement pagination for large data sets
- Consider rate limiting for public APIs

## Logging

- Use the Winston logger for all logging
- Include appropriate context with log messages
- Use the correct log level:
  - `error`: Application errors and exceptions
  - `warn`: Unusual but recoverable situations
  - `info`: Normal operation information
  - `debug`: Detailed debugging information
  - `trace`: Very detailed tracing information

Example:

```typescript
// Good
logger.info('User login successful', { userId, ip });
logger.error('Failed to process payment', { orderId, error: error.message });

// Bad
console.log('User logged in');
console.error(error);
```

## Dependencies

- Minimize external dependencies
- Keep dependencies up-to-date
- Consider the license, maintenance status, and community support when adding dependencies
- Prefer established libraries over experimental ones
- Document why a dependency is needed if it's not obvious 