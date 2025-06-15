# Clean Architecture Best Practices Guide

This guide outlines best practices for maintaining clean architecture in the Conceptus Veritas application. Following these guidelines will ensure that the codebase remains maintainable, testable, and scalable as it grows.

## Core Principles

### 1. Dependency Rule

The fundamental rule of Clean Architecture is that dependencies should point inward:

- **Outer layers** can depend on **inner layers**
- **Inner layers** cannot depend on **outer layers**

```
┌─────────────────────────┐
│                         │
│    UI / Presentation    │
│                         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│                         │
│    Application Logic    │
│                         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│                         │
│     Domain / Entities   │
│                         │
└─────────────────────────┘
```

### 2. Layer Responsibilities

Each layer has specific responsibilities:

| Layer              | Responsibility                   | Examples                                         |
| ------------------ | -------------------------------- | ------------------------------------------------ |
| **Domain**         | Core business logic and entities | `SubscriptionTier`, `GetUserSubscriptionUseCase` |
| **Data**           | Data access implementation       | `SubscriptionRepositoryImpl`                     |
| **Infrastructure** | External services                | `ApiClient`, `LocalStorage`                      |
| **Presentation**   | UI components                    | Screens, components, viewmodels                  |

### 3. SOLID Principles

| Principle                 | Application                                                      |
| ------------------------- | ---------------------------------------------------------------- |
| **S**ingle Responsibility | Each class should have only one reason to change                 |
| **O**pen/Closed           | Classes should be open for extension but closed for modification |
| **L**iskov Substitution   | Subtypes must be substitutable for their base types              |
| **I**nterface Segregation | Many specific interfaces are better than one general interface   |
| **D**ependency Inversion  | Depend on abstractions, not concretions                          |

## Practical Guidelines

### Domain Layer

✅ **DO**:

- Keep domain entities pure and free from external dependencies
- Define repository interfaces in the domain layer
- Use value objects for immutable concepts
- Define domain-specific exceptions

❌ **DON'T**:

- Import infrastructure or UI code in domain layer
- Add UI-specific properties to domain entities
- Put data persistence logic in domain entities

### Data Layer

✅ **DO**:

- Implement domain repository interfaces
- Use mappers to convert between domain and data models
- Handle data source specific exceptions and convert to domain exceptions
- Keep data sources implementation details hidden from repositories

❌ **DON'T**:

- Expose data models to the presentation layer
- Mix business logic with data access logic
- Directly use infrastructure services in repository interfaces

### Infrastructure Layer

✅ **DO**:

- Encapsulate external services and libraries
- Provide abstractions for platform-specific functionality
- Handle external service errors appropriately
- Implement caching strategies when appropriate

❌ **DON'T**:

- Expose external service implementation details to other layers
- Mix business logic with infrastructure code
- Create tight coupling with specific external services

### Presentation Layer

✅ **DO**:

- Use ViewModels to prepare data for display
- Keep UI components focused on rendering and user interaction
- Use dependency injection to access use cases
- Handle UI-specific errors appropriately

❌ **DON'T**:

- Access repositories directly from UI components
- Put business logic in ViewModels or components
- Create tight coupling between UI components and domain entities

## Dependency Injection Best Practices

### Context-Based Dependency Injection

The application uses React Context for dependency injection. Follow these best practices:

✅ **DO**:

- Keep the dependency container in a single place (`DependencyContext.tsx`)
- Inject dependencies at the highest appropriate level
- Use the `useDependencies` hook to access dependencies
- Create test-specific dependency providers for testing

❌ **DON'T**:

- Create dependencies directly in components or hooks
- Pass dependencies as props through multiple component levels
- Mix dependency creation with component logic

### Example: Proper Dependency Injection

```typescript
// Good: Using dependency injection
function MyComponent() {
  const { getUserSubscriptionUseCase } = useDependencies();

  // Use the injected dependency
  // ...
}

// Bad: Creating dependencies directly
function MyComponent() {
  const apiClient = new ApiClient('https://api.example.com');
  const repository = new SubscriptionRepositoryImpl(apiClient);
  const useCase = new GetUserSubscriptionUseCase(repository);

  // Use the created dependency
  // ...
}
```

## State Management Best Practices

### When to Use Different State Management Approaches

| Approach         | Use Case                                           | Example                               |
| ---------------- | -------------------------------------------------- | ------------------------------------- |
| **Local State**  | Component-specific state                           | Form inputs, toggle states            |
| **Context API**  | Shared state with moderate complexity              | Theme, authentication                 |
| **Redux**        | Complex global state with many interactions        | Shopping cart, multi-step workflows   |
| **BLoC Pattern** | Complex business logic with many state transitions | Advanced filtering, real-time updates |

### Guidelines for Context API

✅ **DO**:

- Split contexts by domain/feature
- Provide meaningful default values
- Create custom hooks to access context values
- Use context selectors to prevent unnecessary re-renders

❌ **DON'T**:

- Create a single context for all application state
- Put unrelated state in the same context
- Access context directly without custom hooks

## Error Handling Best Practices

### Domain-Specific Errors

Define domain-specific error classes:

```typescript
export class SubscriptionError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'SubscriptionError';
  }

  static notFound(userId: string): SubscriptionError {
    return new SubscriptionError(`Subscription not found for user ${userId}`, 'SUB_NOT_FOUND');
  }

  static insufficientPermissions(): SubscriptionError {
    return new SubscriptionError(
      'Insufficient permissions to access subscription',
      'SUB_FORBIDDEN'
    );
  }
}
```

### Error Handling by Layer

| Layer              | Responsibility                             |
| ------------------ | ------------------------------------------ |
| **Domain**         | Define domain-specific errors              |
| **Data**           | Translate external errors to domain errors |
| **Infrastructure** | Handle and log technical errors            |
| **Presentation**   | Display user-friendly error messages       |

## Testing Best Practices

### Testing by Layer

| Layer              | Testing Approach                         | Tools                 |
| ------------------ | ---------------------------------------- | --------------------- |
| **Domain**         | Unit tests with mocked dependencies      | Jest                  |
| **Data**           | Integration tests with test doubles      | Jest, test databases  |
| **Infrastructure** | Integration tests with external services | Jest, MSW             |
| **Presentation**   | Component tests                          | React Testing Library |

### Example: Testing a Use Case

```typescript
describe('GetUserSubscriptionUseCase', () => {
  it('should return user subscription when repository returns data', async () => {
    // Arrange
    const mockRepository = {
      getUserSubscription: jest.fn().mockResolvedValue(mockSubscriptionTier),
    };
    const useCase = new GetUserSubscriptionUseCase(mockRepository);

    // Act
    const result = await useCase.execute('user-123');

    // Assert
    expect(result).toEqual(mockSubscriptionTier);
    expect(mockRepository.getUserSubscription).toHaveBeenCalledWith('user-123');
  });

  it('should throw error when repository fails', async () => {
    // Arrange
    const mockRepository = {
      getUserSubscription: jest.fn().mockRejectedValue(new Error('Repository error')),
    };
    const useCase = new GetUserSubscriptionUseCase(mockRepository);

    // Act & Assert
    await expect(useCase.execute('user-123')).rejects.toThrow('Failed to get user subscription');
  });
});
```

## Code Review Checklist

When reviewing code changes, ensure they adhere to these principles:

- [ ] Dependencies point inward (outer layers depend on inner layers)
- [ ] Each class/function has a single responsibility
- [ ] Interfaces are properly segregated and focused
- [ ] Proper abstractions are used for external dependencies
- [ ] Error handling is consistent and appropriate
- [ ] Tests are comprehensive and focused on behavior, not implementation
- [ ] No business logic in UI components or infrastructure code
- [ ] Dependency injection is used consistently

## Conclusion

Following these best practices will ensure that the Conceptus Veritas application remains maintainable, testable, and adaptable to changing requirements. Clean Architecture principles provide a solid foundation for building complex applications that can evolve over time without accumulating technical debt.
