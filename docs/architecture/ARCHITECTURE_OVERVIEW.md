# Conceptus Veritas App - Architecture Overview

## Introduction

This document outlines the architectural blueprint for the Conceptus Veritas App, following Clean Architecture principles with a MVVM pattern for the UI layer. The architecture is designed to be modular, testable, and maintainable, with clear separation of concerns and dependencies flowing inward.

## Core Architectural Principles

### Clean Architecture

The application follows Clean Architecture with distinct layers:

1. **Domain Layer** - The innermost layer containing business logic, entities, and use cases
2. **Data Layer** - Implements repositories defined by the domain layer
3. **Presentation Layer** - UI components following MVVM pattern
4. **Infrastructure Layer** - External frameworks, libraries, and tools

### Dependency Rule

Dependencies always point inward:

- Domain layer has no dependencies on other layers
- Data layer depends only on the domain layer
- Presentation layer depends on the domain layer (and minimally on the data layer through interfaces)
- Infrastructure layer depends on all other layers

### MVVM for UI Components

The presentation layer follows the MVVM (Model-View-ViewModel) pattern:

- **Model** - Domain entities and use cases
- **View** - React components (screens, UI components)
- **ViewModel** - State management and business logic for views

## High-Level Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                         │
│                                                                   │
│  ┌─────────┐      ┌─────────────┐      ┌─────────────────────┐    │
│  │  Views  │◄────►│ ViewModels  │◄────►│ Presenters/Adapters │    │
│  └─────────┘      └─────────────┘      └─────────────────────┘    │
└───────────┬───────────────────────────────────────┬───────────────┘
            │                                       │
            ▼                                       ▼
┌───────────────────────────┐         ┌───────────────────────────┐
│       Domain Layer        │         │        Data Layer         │
│                           │         │                           │
│  ┌─────────┐ ┌─────────┐  │         │  ┌─────────────────────┐  │
│  │ Entities │ │Use Cases│  │◄───────►│  │    Repositories     │  │
│  └─────────┘ └─────────┘  │         │  └─────────────────────┘  │
└───────────────────────────┘         └─────────────┬─────────────┘
                                                    │
                                                    ▼
                                      ┌───────────────────────────┐
                                      │   Infrastructure Layer    │
                                      │                           │
                                      │  ┌─────────┐ ┌─────────┐  │
                                      │  │ APIs    │ │ Storage │  │
                                      │  └─────────┘ └─────────┘  │
                                      │  ┌─────────┐ ┌─────────┐  │
                                      │  │ Auth    │ │ External│  │
                                      │  └─────────┘ └─────────┘  │
                                      └───────────────────────────┘
```

## Key Components

### Domain Layer

- **Entities**: Core business objects (User, Subscription, Features, etc.)
- **Use Cases**: Application-specific business rules
- **Repository Interfaces**: Defines data access contracts

### Data Layer

- **Repositories**: Implementations of domain repository interfaces
- **Data Sources**: Remote (API) and local (storage) data sources
- **DTOs**: Data Transfer Objects for mapping between layers

### Presentation Layer

- **ViewModels**: Manages UI state and business logic
- **Views**: React components
- **Presenters/Adapters**: Transforms data for presentation

### Infrastructure Layer

- **API Clients**: HTTP clients, API services
- **Storage**: Local storage, secure storage
- **Authentication**: Auth services
- **External Services**: Third-party integrations

## Folder Structure

The project follows a feature-based organization within each architectural layer:

```
src/
├── domain/                # Domain Layer
│   ├── entities/          # Business objects
│   ├── usecases/          # Business logic
│   └── repositories/      # Repository interfaces
├── data/                  # Data Layer
│   ├── repositories/      # Repository implementations
│   ├── datasources/       # Data sources (remote, local)
│   └── models/            # DTOs and mappers
├── presentation/          # Presentation Layer
│   ├── screens/           # Screen components
│   ├── components/        # Reusable UI components
│   ├── viewmodels/        # ViewModels for screens
│   ├── contexts/          # React contexts
│   └── hooks/             # Custom React hooks
└── infrastructure/        # Infrastructure Layer
    ├── api/               # API clients
    ├── storage/           # Storage services
    ├── auth/              # Authentication services
    └── services/          # External services
```

## Feature-Based Organization

Each major feature will have its own directory structure within the architectural layers:

```
src/
├── domain/
│   ├── entities/
│   │   ├── subscription/
│   │   ├── user/
│   │   └── ...
│   ├── usecases/
│   │   ├── subscription/
│   │   ├── user/
│   │   └── ...
│   └── repositories/
│       ├── subscription/
│       ├── user/
│       └── ...
└── ...
```

## State Management

- **Local Component State**: For UI-specific state
- **React Context**: For shared state across components
- **Custom Hooks**: For encapsulating and reusing logic

## Error Handling

- Domain-specific errors in the domain layer
- Centralized error handling in the presentation layer
- Error boundaries for React components

## Testing Strategy

- **Domain Layer**: Unit tests for entities and use cases
- **Data Layer**: Unit tests with mocked dependencies
- **Presentation Layer**: Component tests with testing-library
- **Integration Tests**: Testing interactions between layers
- **E2E Tests**: Testing complete user flows

## Dependency Injection

- Use React Context for dependency injection
- Provide repositories and services through context providers
- Mock dependencies for testing

## Conclusion

This architectural blueprint provides a solid foundation for the Conceptus Veritas App, ensuring:

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Testability**: Dependencies can be easily mocked
3. **Maintainability**: Changes in one layer don't affect others
4. **Scalability**: New features can be added without modifying existing code
5. **Flexibility**: External frameworks can be replaced with minimal impact
