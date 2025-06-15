# Project Scaffold

## Introduction

This document outlines the project scaffold for the Conceptus Veritas App, including the folder structure, essential dependencies, and configuration files. The scaffold is designed to support Clean Architecture with MVVM for the UI layer.

## Folder Structure

The project follows a feature-based organization within each architectural layer:

```
src/
├── domain/                # Domain Layer
│   ├── entities/          # Business objects
│   │   ├── subscription/
│   │   ├── user/
│   │   └── ...
│   ├── usecases/          # Business logic
│   │   ├── subscription/
│   │   ├── user/
│   │   └── ...
│   ├── repositories/      # Repository interfaces
│   │   ├── subscription/
│   │   ├── user/
│   │   └── ...
│   └── errors/            # Domain-specific errors
├── data/                  # Data Layer
│   ├── repositories/      # Repository implementations
│   │   ├── subscription/
│   │   ├── user/
│   │   └── ...
│   ├── datasources/       # Data sources (remote, local)
│   │   ├── remote/
│   │   │   ├── subscription/
│   │   │   ├── user/
│   │   │   └── ...
│   │   └── local/
│   │       ├── subscription/
│   │       ├── user/
│   │       └── ...
│   └── models/            # DTOs and mappers
│       ├── subscription/
│       ├── user/
│       └── ...
├── presentation/          # Presentation Layer
│   ├── screens/           # Screen components
│   │   ├── subscription/
│   │   ├── user/
│   │   └── ...
│   ├── components/        # Reusable UI components
│   │   ├── common/
│   │   ├── subscription/
│   │   ├── user/
│   │   └── ...
│   ├── viewmodels/        # ViewModels for screens
│   │   ├── subscription/
│   │   ├── user/
│   │   └── ...
│   ├── contexts/          # React contexts
│   │   ├── auth/
│   │   ├── theme/
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   │   ├── common/
│   │   ├── subscription/
│   │   ├── user/
│   │   └── ...
│   ├── navigation/        # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── ...
│   └── theme/             # UI theme configuration
│       ├── colors.ts
│       ├── typography.ts
│       └── ...
└── infrastructure/        # Infrastructure Layer
    ├── api/               # API clients
    │   ├── client/
    │   ├── interceptors/
    │   └── ...
    ├── storage/           # Storage services
    │   ├── local/
    │   ├── secure/
    │   └── ...
    ├── auth/              # Authentication services
    │   ├── providers/
    │   ├── tokens/
    │   └── ...
    ├── analytics/         # Analytics services
    ├── notifications/     # Notification services
    └── services/          # External services
```

## Essential Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-native": "^0.72.0",
    "@react-navigation/native": "^6.1.7",
    "@react-navigation/stack": "^6.3.17",
    "@react-navigation/bottom-tabs": "^6.5.8",
    "zustand": "^4.4.1",
    "axios": "^1.5.0",
    "@react-native-async-storage/async-storage": "^1.19.3",
    "react-native-mmkv": "^2.10.2",
    "styled-components": "^6.0.8",
    "react-native-vector-icons": "^10.0.0",
    "react-hook-form": "^7.46.1",
    "yup": "^1.2.0",
    "date-fns": "^2.30.0",
    "lodash": "^4.17.21",
    "uuid": "^9.0.0"
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "typescript": "^5.2.2",
    "@types/react": "^18.2.21",
    "@types/react-native": "^0.72.2",
    "jest": "^29.6.4",
    "@testing-library/react-native": "^12.3.0",
    "@testing-library/react-hooks": "^8.0.1",
    "jest-styled-components": "^7.1.1",
    "eslint": "^8.49.0",
    "prettier": "^3.0.3",
    "@typescript-eslint/eslint-plugin": "^6.7.0",
    "@typescript-eslint/parser": "^6.7.0",
    "metro-react-native-babel-preset": "^0.77.0",
    "babel-plugin-module-resolver": "^5.0.0"
  }
}
```

## Configuration Files

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "esnext",
    "moduleResolution": "node",
    "jsx": "react-native",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@domain/*": ["src/domain/*"],
      "@data/*": ["src/data/*"],
      "@presentation/*": ["src/presentation/*"],
      "@infrastructure/*": ["src/infrastructure/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```

### Babel Configuration

```javascript
// babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@domain': './src/domain',
          '@data': './src/data',
          '@presentation': './src/presentation',
          '@infrastructure': './src/infrastructure',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
```

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-navigation|@react-navigation|@react-native-community|react-native-vector-icons)/)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**/*',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
```

## Dependency Injection Setup

```typescript
// src/presentation/contexts/DependencyContext.tsx
import React, { createContext, useContext } from 'react';
import { ApiClient } from '../../infrastructure/api/client/ApiClient';
import { StorageService } from '../../infrastructure/storage/local/StorageService';
import { SecureStorageService } from '../../infrastructure/storage/secure/SecureStorageService';
import { AuthService } from '../../infrastructure/auth/AuthService';

// Repositories
import { UserRepositoryImpl } from '../../data/repositories/user/UserRepositoryImpl';
import { SubscriptionRepositoryImpl } from '../../data/repositories/subscription/SubscriptionRepositoryImpl';

// Data Sources
import { RemoteUserDataSource } from '../../data/datasources/remote/user/RemoteUserDataSource';
import { LocalUserDataSource } from '../../data/datasources/local/user/LocalUserDataSource';
import { RemoteSubscriptionDataSource } from '../../data/datasources/remote/subscription/RemoteSubscriptionDataSource';
import { LocalSubscriptionDataSource } from '../../data/datasources/local/subscription/LocalSubscriptionDataSource';

// Use Cases
import { LoginUseCase } from '../../domain/usecases/user/LoginUseCase';
import { RegisterUseCase } from '../../domain/usecases/user/RegisterUseCase';
import { GetUserProfileUseCase } from '../../domain/usecases/user/GetUserProfileUseCase';
import { GetUserSubscriptionUseCase } from '../../domain/usecases/subscription/GetUserSubscriptionUseCase';
import { GetAllTiersUseCase } from '../../domain/usecases/subscription/GetAllTiersUseCase';
import { UpgradeTierUseCase } from '../../domain/usecases/subscription/UpgradeTierUseCase';

interface Dependencies {
  // Auth Use Cases
  loginUseCase: LoginUseCase;
  registerUseCase: RegisterUseCase;
  getUserProfileUseCase: GetUserProfileUseCase;

  // Subscription Use Cases
  getUserSubscriptionUseCase: GetUserSubscriptionUseCase;
  getAllTiersUseCase: GetAllTiersUseCase;
  upgradeTierUseCase: UpgradeTierUseCase;
}

const DependencyContext = createContext<Dependencies | null>(null);

export const DependencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Infrastructure
  const apiClient = new ApiClient();
  const storageService = new StorageService();
  const secureStorageService = new SecureStorageService();
  const authService = new AuthService(apiClient, secureStorageService);

  // Data Sources
  const remoteUserDataSource = new RemoteUserDataSource(apiClient);
  const localUserDataSource = new LocalUserDataSource(storageService);
  const remoteSubscriptionDataSource = new RemoteSubscriptionDataSource(apiClient);
  const localSubscriptionDataSource = new LocalSubscriptionDataSource(storageService);

  // Repositories
  const userRepository = new UserRepositoryImpl(remoteUserDataSource, localUserDataSource);
  const subscriptionRepository = new SubscriptionRepositoryImpl(
    remoteSubscriptionDataSource,
    localSubscriptionDataSource
  );

  // Use Cases
  const loginUseCase = new LoginUseCase(userRepository, authService);
  const registerUseCase = new RegisterUseCase(userRepository);
  const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
  const getUserSubscriptionUseCase = new GetUserSubscriptionUseCase(subscriptionRepository);
  const getAllTiersUseCase = new GetAllTiersUseCase(subscriptionRepository);
  const upgradeTierUseCase = new UpgradeTierUseCase(subscriptionRepository);

  const dependencies: Dependencies = {
    loginUseCase,
    registerUseCase,
    getUserProfileUseCase,
    getUserSubscriptionUseCase,
    getAllTiersUseCase,
    upgradeTierUseCase,
  };

  return (
    <DependencyContext.Provider value={dependencies}>
      {children}
    </DependencyContext.Provider>
  );
};

export const useDependencies = () => {
  const context = useContext(DependencyContext);
  if (!context) {
    throw new Error('useDependencies must be used within a DependencyProvider');
  }
  return context;
};
```

## App Entry Point

```typescript
// src/App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { ThemeProvider } from 'styled-components/native';

import { DependencyProvider } from './presentation/contexts/DependencyContext';
import { AuthProvider } from './presentation/contexts/auth/AuthContext';
import { AppNavigator } from './presentation/navigation/AppNavigator';
import { theme } from './presentation/theme';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <DependencyProvider>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </AuthProvider>
        </ThemeProvider>
      </DependencyProvider>
    </SafeAreaProvider>
  );
};

export default App;
```

## Anti-Patterns to Avoid

1. **Circular Dependencies**: Ensure dependencies flow in one direction (inward).
2. **Leaky Abstractions**: Don't expose implementation details across layer boundaries.
3. **Direct Domain Layer Access**: Always access the domain layer through interfaces.
4. **Business Logic in UI**: Keep business logic in use cases, not in ViewModels or Views.
5. **Tight Coupling**: Use dependency injection to avoid tight coupling between components.
6. **Inconsistent Error Handling**: Implement a consistent error handling strategy across all layers.
7. **Lack of Testing**: Ensure all layers have appropriate test coverage.

## Next Steps

1. **Set up the project structure** as outlined above
2. **Install the essential dependencies**
3. **Configure TypeScript, Babel, ESLint, and Jest**
4. **Implement the core infrastructure services** (API client, storage, auth)
5. **Create the dependency injection context**
6. **Implement the domain layer** for the first feature
7. **Implement the data layer** for the first feature
8. **Implement the presentation layer** with MVVM for the first feature

## Conclusion

This project scaffold provides a solid foundation for building the Conceptus Veritas App using Clean Architecture with MVVM. By following this structure and using the recommended dependencies and configurations, the application will be maintainable, testable, and scalable.
