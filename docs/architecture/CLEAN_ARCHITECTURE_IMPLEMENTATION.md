# Clean Architecture Implementation Guide

## Introduction

This document provides detailed implementation guidelines for applying Clean Architecture principles to the Conceptus Veritas App. It outlines the responsibilities of each layer, the interfaces between them, and best practices for implementation.

## Domain Layer

The domain layer is the core of the application, containing business logic and rules independent of any external frameworks or tools.

### Entities

Entities are the core business objects of the application. They should be pure TypeScript classes/interfaces with no dependencies on external frameworks.

```typescript
// Example: src/domain/entities/subscription/SubscriptionTier.ts
export enum TierType {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  PRO = 'PRO',
}

export interface SubscriptionTier {
  id: string;
  type: TierType;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: SubscriptionFeature[];
}

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  usageLimit?: number;
}
```

### Use Cases

Use cases represent the business logic and operations that can be performed in the application. They should depend only on entities and repository interfaces.

```typescript
// Example: src/domain/usecases/subscription/GetUserSubscriptionUseCase.ts
import { SubscriptionTier } from '../../entities/subscription/SubscriptionTier';
import { SubscriptionRepository } from '../../repositories/subscription/SubscriptionRepository';

export class GetUserSubscriptionUseCase {
  constructor(private subscriptionRepository: SubscriptionRepository) {}

  async execute(userId: string): Promise<SubscriptionTier> {
    return this.subscriptionRepository.getUserSubscription(userId);
  }
}
```

### Repository Interfaces

Repository interfaces define the contracts for data access. They are implemented in the data layer but defined in the domain layer.

```typescript
// Example: src/domain/repositories/subscription/SubscriptionRepository.ts
import { SubscriptionTier } from '../../entities/subscription/SubscriptionTier';

export interface SubscriptionRepository {
  getUserSubscription(userId: string): Promise<SubscriptionTier>;
  getAllTiers(): Promise<SubscriptionTier[]>;
  upgradeTier(userId: string, tierId: string): Promise<boolean>;
  downgradeTier(userId: string, tierId: string): Promise<boolean>;
}
```

## Data Layer

The data layer implements the repository interfaces defined in the domain layer, providing concrete implementations for data access.

### Repositories

Repositories implement the interfaces defined in the domain layer, coordinating between different data sources.

```typescript
// Example: src/data/repositories/subscription/SubscriptionRepositoryImpl.ts
import { SubscriptionTier } from '../../../domain/entities/subscription/SubscriptionTier';
import { SubscriptionRepository } from '../../../domain/repositories/subscription/SubscriptionRepository';
import { RemoteSubscriptionDataSource } from '../../datasources/subscription/RemoteSubscriptionDataSource';
import { LocalSubscriptionDataSource } from '../../datasources/subscription/LocalSubscriptionDataSource';

export class SubscriptionRepositoryImpl implements SubscriptionRepository {
  constructor(
    private remoteDataSource: RemoteSubscriptionDataSource,
    private localDataSource: LocalSubscriptionDataSource
  ) {}

  async getUserSubscription(userId: string): Promise<SubscriptionTier> {
    try {
      // Try to get from local cache first
      const localSubscription = await this.localDataSource.getUserSubscription(userId);
      if (localSubscription) {
        return localSubscription;
      }

      // If not available locally, fetch from remote
      const remoteSubscription = await this.remoteDataSource.getUserSubscription(userId);

      // Cache the result locally
      if (remoteSubscription) {
        await this.localDataSource.saveUserSubscription(userId, remoteSubscription);
      }

      return remoteSubscription;
    } catch (error) {
      throw new Error(`Failed to get user subscription: ${error.message}`);
    }
  }

  async getAllTiers(): Promise<SubscriptionTier[]> {
    // Implementation...
  }

  async upgradeTier(userId: string, tierId: string): Promise<boolean> {
    // Implementation...
  }

  async downgradeTier(userId: string, tierId: string): Promise<boolean> {
    // Implementation...
  }
}
```

### Data Sources

Data sources are responsible for fetching data from specific sources (API, local storage, etc.).

```typescript
// Example: src/data/datasources/subscription/RemoteSubscriptionDataSource.ts
import { SubscriptionTier } from '../../../domain/entities/subscription/SubscriptionTier';
import { ApiClient } from '../../../infrastructure/api/ApiClient';
import { SubscriptionDto } from '../../models/subscription/SubscriptionDto';
import { subscriptionDtoToEntity } from '../../models/subscription/SubscriptionMapper';

export class RemoteSubscriptionDataSource {
  constructor(private apiClient: ApiClient) {}

  async getUserSubscription(userId: string): Promise<SubscriptionTier> {
    try {
      const response = await this.apiClient.get<SubscriptionDto>(`/users/${userId}/subscription`);
      return subscriptionDtoToEntity(response);
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  }

  // Other methods...
}

// Example: src/data/datasources/subscription/LocalSubscriptionDataSource.ts
import { SubscriptionTier } from '../../../domain/entities/subscription/SubscriptionTier';
import { StorageService } from '../../../infrastructure/storage/StorageService';

export class LocalSubscriptionDataSource {
  constructor(private storageService: StorageService) {}

  async getUserSubscription(userId: string): Promise<SubscriptionTier | null> {
    try {
      const key = `user_subscription_${userId}`;
      return await this.storageService.get<SubscriptionTier>(key);
    } catch (error) {
      console.error(`Storage Error: ${error.message}`);
      return null;
    }
  }

  async saveUserSubscription(userId: string, subscription: SubscriptionTier): Promise<void> {
    try {
      const key = `user_subscription_${userId}`;
      await this.storageService.set(key, subscription);
    } catch (error) {
      console.error(`Storage Error: ${error.message}`);
    }
  }

  // Other methods...
}
```

### DTOs and Mappers

Data Transfer Objects (DTOs) represent the data structure as received from external sources. Mappers convert between DTOs and domain entities.

```typescript
// Example: src/data/models/subscription/SubscriptionDto.ts
export interface SubscriptionDto {
  id: string;
  tier_type: string;
  name: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  features: {
    id: string;
    name: string;
    description: string;
    is_enabled: boolean;
    usage_limit?: number;
  }[];
}

// Example: src/data/models/subscription/SubscriptionMapper.ts
import {
  SubscriptionTier,
  TierType,
  SubscriptionFeature,
} from '../../../domain/entities/subscription/SubscriptionTier';
import { SubscriptionDto } from './SubscriptionDto';

export function subscriptionDtoToEntity(dto: SubscriptionDto): SubscriptionTier {
  return {
    id: dto.id,
    type: dto.tier_type as TierType,
    name: dto.name,
    description: dto.description,
    monthlyPrice: dto.monthly_price,
    annualPrice: dto.annual_price,
    features: dto.features.map(feature => ({
      id: feature.id,
      name: feature.name,
      description: feature.description,
      isEnabled: feature.is_enabled,
      usageLimit: feature.usage_limit,
    })),
  };
}

export function subscriptionEntityToDto(entity: SubscriptionTier): SubscriptionDto {
  return {
    id: entity.id,
    tier_type: entity.type,
    name: entity.name,
    description: entity.description,
    monthly_price: entity.monthlyPrice,
    annual_price: entity.annualPrice,
    features: entity.features.map(feature => ({
      id: feature.id,
      name: feature.name,
      description: feature.description,
      is_enabled: feature.isEnabled,
      usage_limit: feature.usageLimit,
    })),
  };
}
```

## Presentation Layer (MVVM)

The presentation layer is responsible for displaying data to the user and handling user interactions. It follows the MVVM pattern.

### ViewModels

ViewModels manage UI state and business logic for views. They depend on use cases from the domain layer.

```typescript
// Example: src/presentation/viewmodels/subscription/SubscriptionViewModel.ts
import { useState, useEffect } from 'react';
import { SubscriptionTier } from '../../../domain/entities/subscription/SubscriptionTier';
import { GetUserSubscriptionUseCase } from '../../../domain/usecases/subscription/GetUserSubscriptionUseCase';
import { GetAllTiersUseCase } from '../../../domain/usecases/subscription/GetAllTiersUseCase';
import { UpgradeTierUseCase } from '../../../domain/usecases/subscription/UpgradeTierUseCase';

export const useSubscriptionViewModel = (
  userId: string,
  getUserSubscriptionUseCase: GetUserSubscriptionUseCase,
  getAllTiersUseCase: GetAllTiersUseCase,
  upgradeTierUseCase: UpgradeTierUseCase
) => {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier | null>(null);
  const [availableTiers, setAvailableTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoading(true);
        const [userSubscription, allTiers] = await Promise.all([
          getUserSubscriptionUseCase.execute(userId),
          getAllTiersUseCase.execute(),
        ]);

        setCurrentTier(userSubscription);
        setAvailableTiers(allTiers);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [userId]);

  const upgradeTier = async (tierId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await upgradeTierUseCase.execute(userId, tierId);

      if (result) {
        // Refresh subscription data
        const userSubscription = await getUserSubscriptionUseCase.execute(userId);
        setCurrentTier(userSubscription);
      }

      return result;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentTier,
    availableTiers,
    loading,
    error,
    upgradeTier,
  };
};
```

### Views (React Components)

Views are React components that display data and handle user interactions. They use ViewModels for state management and business logic.

```typescript
// Example: src/presentation/screens/subscription/SubscriptionScreen.tsx
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useSubscriptionViewModel } from '../../viewmodels/subscription/SubscriptionViewModel';
import { SubscriptionCard } from '../../components/subscription/SubscriptionCard';
import { useAuth } from '../../hooks/useAuth';
import { useDependencies } from '../../contexts/DependencyContext';

export const SubscriptionScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    getUserSubscriptionUseCase,
    getAllTiersUseCase,
    upgradeTierUseCase
  } = useDependencies();

  const {
    currentTier,
    availableTiers,
    loading,
    error,
    upgradeTier
  } = useSubscriptionViewModel(
    user.id,
    getUserSubscriptionUseCase,
    getAllTiersUseCase,
    upgradeTierUseCase
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Subscription</Text>

      {currentTier && (
        <View style={styles.currentTierContainer}>
          <Text style={styles.subtitle}>Current Plan</Text>
          <SubscriptionCard
            tier={currentTier}
            isCurrent={true}
            onSelect={() => {}}
          />
        </View>
      )}

      <Text style={styles.subtitle}>Available Plans</Text>
      {availableTiers
        .filter(tier => tier.id !== currentTier?.id)
        .map(tier => (
          <SubscriptionCard
            key={tier.id}
            tier={tier}
            isCurrent={false}
            onSelect={() => upgradeTier(tier.id)}
          />
        ))
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  currentTierContainer: {
    marginBottom: 16,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});
```

### Dependency Injection (Context)

Use React Context for dependency injection to provide use cases and repositories to components.

```typescript
// Example: src/presentation/contexts/DependencyContext.tsx
import React, { createContext, useContext } from 'react';
import { ApiClient } from '../../infrastructure/api/ApiClient';
import { StorageService } from '../../infrastructure/storage/StorageService';
import { RemoteSubscriptionDataSource } from '../../data/datasources/subscription/RemoteSubscriptionDataSource';
import { LocalSubscriptionDataSource } from '../../data/datasources/subscription/LocalSubscriptionDataSource';
import { SubscriptionRepositoryImpl } from '../../data/repositories/subscription/SubscriptionRepositoryImpl';
import { GetUserSubscriptionUseCase } from '../../domain/usecases/subscription/GetUserSubscriptionUseCase';
import { GetAllTiersUseCase } from '../../domain/usecases/subscription/GetAllTiersUseCase';
import { UpgradeTierUseCase } from '../../domain/usecases/subscription/UpgradeTierUseCase';

interface Dependencies {
  // Use cases
  getUserSubscriptionUseCase: GetUserSubscriptionUseCase;
  getAllTiersUseCase: GetAllTiersUseCase;
  upgradeTierUseCase: UpgradeTierUseCase;
}

const DependencyContext = createContext<Dependencies | null>(null);

export const DependencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Infrastructure
  const apiClient = new ApiClient();
  const storageService = new StorageService();

  // Data sources
  const remoteSubscriptionDataSource = new RemoteSubscriptionDataSource(apiClient);
  const localSubscriptionDataSource = new LocalSubscriptionDataSource(storageService);

  // Repositories
  const subscriptionRepository = new SubscriptionRepositoryImpl(
    remoteSubscriptionDataSource,
    localSubscriptionDataSource
  );

  // Use cases
  const getUserSubscriptionUseCase = new GetUserSubscriptionUseCase(subscriptionRepository);
  const getAllTiersUseCase = new GetAllTiersUseCase(subscriptionRepository);
  const upgradeTierUseCase = new UpgradeTierUseCase(subscriptionRepository);

  const dependencies: Dependencies = {
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

## Infrastructure Layer

The infrastructure layer provides implementations for external dependencies like API clients, storage, and authentication.

### API Client

```typescript
// Example: src/infrastructure/api/ApiClient.ts
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://api.conceptusveritas.com') {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`API Request Failed: ${error.message}`);
    }
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`API Request Failed: ${error.message}`);
    }
  }

  // Other methods (put, delete, etc.)

  private getToken(): string {
    // Get token from secure storage or state
    return ''; // Placeholder
  }
}
```

### Storage Service

```typescript
// Example: src/infrastructure/storage/StorageService.ts
export class StorageService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Storage Error: ${error.message}`);
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Storage Error: ${error.message}`);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Storage Error: ${error.message}`);
    }
  }
}
```

### Authentication Service

```typescript
// Example: src/infrastructure/auth/AuthService.ts
export class AuthService {
  private apiClient: ApiClient;
  private storageService: StorageService;

  constructor(apiClient: ApiClient, storageService: StorageService) {
    this.apiClient = apiClient;
    this.storageService = storageService;
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await this.apiClient.post<{ token: string; user: any }>('/auth/login', {
        email,
        password,
      });

      await this.storageService.set('auth_token', response.token);
      await this.storageService.set('user', response.user);

      return true;
    } catch (error) {
      console.error(`Login Error: ${error.message}`);
      return false;
    }
  }

  async logout(): Promise<void> {
    await this.storageService.remove('auth_token');
    await this.storageService.remove('user');
  }

  async getCurrentUser(): Promise<any | null> {
    return await this.storageService.get('user');
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.storageService.get<string>('auth_token');
    return !!token;
  }
}
```

## Best Practices

### Error Handling

```typescript
// Example: src/domain/errors/AppError.ts
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Example usage in a repository
try {
  // Code that might fail
} catch (error) {
  if (error.response && error.response.status === 401) {
    throw new AuthenticationError('Authentication failed');
  }
  throw new NetworkError(`API Error: ${error.message}`);
}
```

### Testing

```typescript
// Example: src/domain/usecases/subscription/__tests__/GetUserSubscriptionUseCase.test.ts
import { GetUserSubscriptionUseCase } from '../GetUserSubscriptionUseCase';
import { SubscriptionRepository } from '../../../repositories/subscription/SubscriptionRepository';
import { SubscriptionTier, TierType } from '../../../entities/subscription/SubscriptionTier';

describe('GetUserSubscriptionUseCase', () => {
  let useCase: GetUserSubscriptionUseCase;
  let mockRepository: jest.Mocked<SubscriptionRepository>;

  const mockTier: SubscriptionTier = {
    id: '1',
    type: TierType.PREMIUM,
    name: 'Premium',
    description: 'Premium tier',
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    features: [],
  };

  beforeEach(() => {
    mockRepository = {
      getUserSubscription: jest.fn(),
      getAllTiers: jest.fn(),
      upgradeTier: jest.fn(),
      downgradeTier: jest.fn(),
    };

    useCase = new GetUserSubscriptionUseCase(mockRepository);
  });

  it('should get user subscription from repository', async () => {
    mockRepository.getUserSubscription.mockResolvedValue(mockTier);

    const result = await useCase.execute('user-123');

    expect(mockRepository.getUserSubscription).toHaveBeenCalledWith('user-123');
    expect(result).toEqual(mockTier);
  });

  it('should throw error when repository fails', async () => {
    const error = new Error('Repository error');
    mockRepository.getUserSubscription.mockRejectedValue(error);

    await expect(useCase.execute('user-123')).rejects.toThrow(error);
  });
});
```

## Migration Strategy

To migrate the existing codebase to this architecture:

1. **Create the new folder structure** while keeping the existing code functional
2. **Identify domain entities and use cases** from the current implementation
3. **Extract repository interfaces** based on current data access patterns
4. **Implement repositories and data sources** to match the interfaces
5. **Refactor UI components** to use the MVVM pattern
6. **Set up dependency injection** using React Context
7. **Migrate one feature at a time** to minimize disruption

## Conclusion

This implementation guide provides a comprehensive approach to applying Clean Architecture with MVVM in the Conceptus Veritas App. By following these guidelines, the application will be:

- More maintainable through clear separation of concerns
- More testable with well-defined interfaces and dependencies
- More scalable with a modular, feature-based organization
- More adaptable to changing requirements and external dependencies
