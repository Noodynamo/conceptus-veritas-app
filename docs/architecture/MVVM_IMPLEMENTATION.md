# MVVM Pattern Implementation Guide

## Introduction

This document provides a detailed guide for implementing the MVVM (Model-View-ViewModel) pattern in the Conceptus Veritas App using React. The MVVM pattern helps separate UI logic from business logic, making the application more maintainable and testable.

## MVVM Overview

The MVVM pattern consists of three main components:

1. **Model**: Domain entities and business logic (from the domain layer)
2. **View**: UI components that display data and handle user interactions
3. **ViewModel**: Mediator between the Model and View, containing UI logic and state

### Benefits of MVVM

- **Separation of Concerns**: UI logic is separated from business logic
- **Testability**: ViewModels can be tested independently of Views
- **Reusability**: ViewModels can be reused across multiple Views
- **Maintainability**: Changes to the UI don't affect the business logic

## MVVM in React

In React, the MVVM pattern can be implemented using:

- **Model**: Domain entities and use cases from the domain layer
- **View**: React components (functional or class components)
- **ViewModel**: Custom hooks that manage state and UI logic

## Implementation Guidelines

### ViewModel Implementation

ViewModels are implemented as custom hooks that:

- Manage UI state
- Handle business logic by calling use cases
- Provide methods for UI interactions
- Handle loading states and errors

```typescript
// Example: src/presentation/viewmodels/subscription/useSubscriptionViewModel.ts
import { useState, useEffect } from 'react';
import { SubscriptionTier } from '../../../domain/entities/subscription/SubscriptionTier';
import { GetUserSubscriptionUseCase } from '../../../domain/usecases/subscription/GetUserSubscriptionUseCase';
import { GetAllTiersUseCase } from '../../../domain/usecases/subscription/GetAllTiersUseCase';
import { UpgradeTierUseCase } from '../../../domain/usecases/subscription/UpgradeTierUseCase';

export interface SubscriptionViewModelState {
  currentTier: SubscriptionTier | null;
  availableTiers: SubscriptionTier[];
  loading: boolean;
  error: string | null;
}

export interface SubscriptionViewModel extends SubscriptionViewModelState {
  upgradeTier: (tierId: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export const useSubscriptionViewModel = (
  userId: string,
  getUserSubscriptionUseCase: GetUserSubscriptionUseCase,
  getAllTiersUseCase: GetAllTiersUseCase,
  upgradeTierUseCase: UpgradeTierUseCase
): SubscriptionViewModel => {
  const [state, setState] = useState<SubscriptionViewModelState>({
    currentTier: null,
    availableTiers: [],
    loading: true,
    error: null,
  });

  const fetchSubscriptionData = async () => {
    try {
      setState(prevState => ({ ...prevState, loading: true }));

      const [userSubscription, allTiers] = await Promise.all([
        getUserSubscriptionUseCase.execute(userId),
        getAllTiersUseCase.execute(),
      ]);

      setState({
        currentTier: userSubscription,
        availableTiers: allTiers,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: err.message,
      }));
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [userId]);

  const upgradeTier = async (tierId: string): Promise<boolean> => {
    try {
      setState(prevState => ({ ...prevState, loading: true }));

      const result = await upgradeTierUseCase.execute(userId, tierId);

      if (result) {
        // Refresh subscription data
        await fetchSubscriptionData();
      } else {
        setState(prevState => ({ ...prevState, loading: false }));
      }

      return result;
    } catch (err) {
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: err.message,
      }));
      return false;
    }
  };

  return {
    ...state,
    upgradeTier,
    refreshData: fetchSubscriptionData,
  };
};
```

### View Implementation

Views are React components that:

- Use ViewModels for state and logic
- Focus solely on rendering UI and handling user interactions
- Don't contain business logic

```typescript
// Example: src/presentation/screens/subscription/SubscriptionScreen.tsx
import React from 'react';
import { View, Text, ActivityIndicator, Button, StyleSheet } from 'react-native';
import { useSubscriptionViewModel } from '../../viewmodels/subscription/useSubscriptionViewModel';
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
    upgradeTier,
    refreshData
  } = useSubscriptionViewModel(
    user.id,
    getUserSubscriptionUseCase,
    getAllTiersUseCase,
    upgradeTierUseCase
  );

  const handleUpgrade = async (tierId: string) => {
    const success = await upgradeTier(tierId);
    if (success) {
      // Show success message or navigate
    } else {
      // Show error message
    }
  };

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
        <Button title="Retry" onPress={refreshData} />
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
            onSelect={() => handleUpgrade(tier.id)}
          />
        ))
      }

      <Button title="Refresh" onPress={refreshData} />
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
    marginBottom: 16,
  },
});
```

### Reusable Components

Create reusable UI components that are purely presentational:

```typescript
// Example: src/presentation/components/subscription/SubscriptionCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SubscriptionTier } from '../../../domain/entities/subscription/SubscriptionTier';

interface SubscriptionCardProps {
  tier: SubscriptionTier;
  isCurrent: boolean;
  onSelect?: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  tier,
  isCurrent,
  onSelect
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isCurrent && styles.currentContainer]}
      onPress={onSelect}
      disabled={isCurrent || !onSelect}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{tier.name}</Text>
        {isCurrent && <Text style={styles.currentBadge}>Current</Text>}
      </View>

      <Text style={styles.price}>${tier.monthlyPrice}/month</Text>
      <Text style={styles.description}>{tier.description}</Text>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Features:</Text>
        {tier.features.map(feature => (
          <View key={feature.id} style={styles.featureRow}>
            <Text style={[
              styles.featureText,
              !feature.isEnabled && styles.disabledFeature
            ]}>
              {feature.isEnabled ? '✓' : '✗'} {feature.name}
              {feature.usageLimit ? ` (${feature.usageLimit})` : ''}
            </Text>
          </View>
        ))}
      </View>

      {!isCurrent && onSelect && (
        <TouchableOpacity style={styles.button} onPress={onSelect}>
          <Text style={styles.buttonText}>Upgrade</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  currentContainer: {
    backgroundColor: '#e6f7ff',
    borderColor: '#1890ff',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  currentBadge: {
    backgroundColor: '#1890ff',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
  },
  disabledFeature: {
    color: '#999',
  },
  button: {
    backgroundColor: '#1890ff',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

## Advanced MVVM Patterns

### Handling Form State

For forms, create specialized ViewModels that handle form state, validation, and submission:

```typescript
// Example: src/presentation/viewmodels/auth/useLoginViewModel.ts
import { useState } from 'react';
import { LoginUseCase } from '../../../domain/usecases/auth/LoginUseCase';

interface LoginForm {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export const useLoginViewModel = (loginUseCase: LoginUseCase) => {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitForm = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    try {
      setLoading(true);
      const result = await loginUseCase.execute(form.email, form.password);
      return result;
    } catch (error) {
      setErrors({ general: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    loading,
    updateField,
    submitForm,
  };
};
```

### Handling Lists and Pagination

For lists with pagination, create ViewModels that handle loading, pagination, and filtering:

```typescript
// Example: src/presentation/viewmodels/content/useContentListViewModel.ts
import { useState, useEffect, useCallback } from 'react';
import { Content } from '../../../domain/entities/content/Content';
import { GetContentListUseCase } from '../../../domain/usecases/content/GetContentListUseCase';

interface ContentListFilters {
  category?: string;
  searchQuery?: string;
  sortBy?: 'date' | 'popularity';
}

export const useContentListViewModel = (getContentListUseCase: GetContentListUseCase) => {
  const [content, setContent] = useState<Content[]>([]);
  const [filters, setFilters] = useState<ContentListFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchContent = useCallback(
    async (newPage: number = 1, newFilters?: ContentListFilters) => {
      try {
        setLoading(true);
        setError(null);

        const activeFilters = newFilters || filters;
        const result = await getContentListUseCase.execute({
          page: newPage,
          limit: 20,
          ...activeFilters,
        });

        if (newPage === 1) {
          setContent(result.items);
        } else {
          setContent(prev => [...prev, ...result.items]);
        }

        setHasMore(result.hasMore);
        setPage(newPage);

        if (newFilters) {
          setFilters(newFilters);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [filters, getContentListUseCase]
  );

  // Initial load
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchContent(page + 1);
    }
  };

  const refresh = () => {
    fetchContent(1);
  };

  const updateFilters = (newFilters: ContentListFilters) => {
    fetchContent(1, newFilters);
  };

  return {
    content,
    filters,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    updateFilters,
  };
};
```

## Testing ViewModels

ViewModels should be thoroughly tested to ensure they correctly handle state, interactions with use cases, and error conditions:

```typescript
// Example: src/presentation/viewmodels/__tests__/useSubscriptionViewModel.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useSubscriptionViewModel } from '../subscription/useSubscriptionViewModel';
import { GetUserSubscriptionUseCase } from '../../../domain/usecases/subscription/GetUserSubscriptionUseCase';
import { GetAllTiersUseCase } from '../../../domain/usecases/subscription/GetAllTiersUseCase';
import { UpgradeTierUseCase } from '../../../domain/usecases/subscription/UpgradeTierUseCase';
import { SubscriptionTier, TierType } from '../../../domain/entities/subscription/SubscriptionTier';

describe('useSubscriptionViewModel', () => {
  const mockUserId = 'user-123';

  const mockCurrentTier: SubscriptionTier = {
    id: '1',
    type: TierType.FREE,
    name: 'Free',
    description: 'Free tier',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [],
  };

  const mockAvailableTiers: SubscriptionTier[] = [
    mockCurrentTier,
    {
      id: '2',
      type: TierType.PREMIUM,
      name: 'Premium',
      description: 'Premium tier',
      monthlyPrice: 9.99,
      annualPrice: 99.99,
      features: [],
    },
  ];

  let mockGetUserSubscriptionUseCase: jest.Mocked<GetUserSubscriptionUseCase>;
  let mockGetAllTiersUseCase: jest.Mocked<GetAllTiersUseCase>;
  let mockUpgradeTierUseCase: jest.Mocked<UpgradeTierUseCase>;

  beforeEach(() => {
    mockGetUserSubscriptionUseCase = {
      execute: jest.fn(),
    } as any;

    mockGetAllTiersUseCase = {
      execute: jest.fn(),
    } as any;

    mockUpgradeTierUseCase = {
      execute: jest.fn(),
    } as any;

    mockGetUserSubscriptionUseCase.execute.mockResolvedValue(mockCurrentTier);
    mockGetAllTiersUseCase.execute.mockResolvedValue(mockAvailableTiers);
    mockUpgradeTierUseCase.execute.mockResolvedValue(true);
  });

  it('should load subscription data on init', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSubscriptionViewModel(
        mockUserId,
        mockGetUserSubscriptionUseCase,
        mockGetAllTiersUseCase,
        mockUpgradeTierUseCase
      )
    );

    // Initial state
    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    // State after loading
    expect(result.current.loading).toBe(false);
    expect(result.current.currentTier).toEqual(mockCurrentTier);
    expect(result.current.availableTiers).toEqual(mockAvailableTiers);
    expect(result.current.error).toBeNull();

    // Verify use cases were called
    expect(mockGetUserSubscriptionUseCase.execute).toHaveBeenCalledWith(mockUserId);
    expect(mockGetAllTiersUseCase.execute).toHaveBeenCalled();
  });

  it('should handle upgrade tier', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSubscriptionViewModel(
        mockUserId,
        mockGetUserSubscriptionUseCase,
        mockGetAllTiersUseCase,
        mockUpgradeTierUseCase
      )
    );

    await waitForNextUpdate();

    // Reset mocks to verify they're called during upgrade
    mockGetUserSubscriptionUseCase.execute.mockClear();

    // Update to return a new tier after upgrade
    const newTier = { ...mockCurrentTier, id: '2', type: TierType.PREMIUM };
    mockGetUserSubscriptionUseCase.execute.mockResolvedValue(newTier);

    // Perform upgrade
    let upgradeResult: boolean | undefined;
    act(() => {
      result.current.upgradeTier('2').then(res => {
        upgradeResult = res;
      });
    });

    await waitForNextUpdate();

    // Verify result
    expect(upgradeResult).toBe(true);
    expect(result.current.currentTier).toEqual(newTier);

    // Verify use cases were called
    expect(mockUpgradeTierUseCase.execute).toHaveBeenCalledWith(mockUserId, '2');
    expect(mockGetUserSubscriptionUseCase.execute).toHaveBeenCalledWith(mockUserId);
  });

  it('should handle errors', async () => {
    // Setup error case
    const errorMessage = 'Failed to load subscription';
    mockGetUserSubscriptionUseCase.execute.mockRejectedValue(new Error(errorMessage));

    const { result, waitForNextUpdate } = renderHook(() =>
      useSubscriptionViewModel(
        mockUserId,
        mockGetUserSubscriptionUseCase,
        mockGetAllTiersUseCase,
        mockUpgradeTierUseCase
      )
    );

    await waitForNextUpdate();

    // Verify error state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });
});
```

## Best Practices

### 1. Keep ViewModels Focused

Each ViewModel should focus on a specific UI concern. Avoid creating large ViewModels that handle multiple unrelated features.

### 2. Separate UI Logic from Business Logic

ViewModels should contain UI logic (state management, user interactions) but delegate business logic to domain use cases.

### 3. Use TypeScript for Type Safety

Define clear interfaces for ViewModel state and methods to ensure type safety and improve code quality.

### 4. Handle Loading and Error States

Always handle loading and error states in ViewModels to provide a good user experience.

### 5. Test ViewModels Thoroughly

Write comprehensive tests for ViewModels to ensure they correctly handle all scenarios, including edge cases and errors.

### 6. Use Dependency Injection

Inject use cases and other dependencies into ViewModels to make them more testable and flexible.

### 7. Keep Views Simple

Views should focus on rendering UI and handling user interactions. Avoid complex logic in View components.

## Conclusion

The MVVM pattern provides a clean separation between UI and business logic, making the application more maintainable and testable. By implementing ViewModels as custom hooks, we can leverage the power of React's functional components while maintaining a clear separation of concerns.

This implementation guide provides a solid foundation for applying MVVM in the Conceptus Veritas App, ensuring a scalable and maintainable architecture for the UI layer.
