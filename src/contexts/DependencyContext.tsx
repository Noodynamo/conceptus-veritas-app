import React, { createContext, useContext, ReactNode } from 'react';
import { ApiClient } from '../infrastructure/api/ApiClient';
import { SubscriptionRepositoryImpl } from '../data/repositories/subscription/SubscriptionRepositoryImpl';
import { GetUserSubscriptionUseCase } from '../domain/usecases/subscription/GetUserSubscriptionUseCase';
import { AuthService } from '../domain/services/auth/AuthService';
import { AuthServiceImpl } from '../infrastructure/auth/AuthServiceImpl';
import { createAuthStore, AuthStore } from '../presentation/stores/authStore';

/**
 * Interface for all dependencies in the application
 */
interface Dependencies {
  // Infrastructure
  apiClient: ApiClient;

  // Repositories
  subscriptionRepository: SubscriptionRepositoryImpl;

  // Use Cases
  getUserSubscriptionUseCase: GetUserSubscriptionUseCase;
  getAllTiersUseCase: any; // Would be properly typed in a real implementation
  upgradeTierUseCase: any; // Would be properly typed in a real implementation
  downgradeTierUseCase: any; // Would be properly typed in a real implementation

  // Services
  authService: AuthService;

  // Stores
  authStore: AuthStore;
}

// Define the context type
interface DependencyContextType {
  apiClient: ApiClient;
  getUserSubscriptionUseCase: GetUserSubscriptionUseCase;
  authService: AuthService;
  authStore: AuthStore;
}

// Create the context with a default value
const DependencyContext = createContext<DependencyContextType | null>(null);

/**
 * Props for the DependencyProvider component
 */
interface DependencyProviderProps {
  children: ReactNode;
  apiUrl: string;
}

/**
 * Provider component for dependency injection
 */
export const DependencyProvider: React.FC<DependencyProviderProps> = ({ children, apiUrl }) => {
  // Create API client first without auth
  const apiClient = new ApiClient(apiUrl);

  // Create auth service
  const authService = new AuthServiceImpl(apiClient);

  // Update API client with token provider from auth service
  apiClient.setTokenProvider(() => authService.getToken());

  // Create repositories
  const subscriptionRepository = new SubscriptionRepositoryImpl(apiClient);

  // Create use cases
  const getUserSubscriptionUseCase = new GetUserSubscriptionUseCase(subscriptionRepository);

  // Create stores
  const authStore = createAuthStore(authService);

  // Context value
  const value: DependencyContextType = {
    apiClient,
    getUserSubscriptionUseCase,
    authService,
    authStore,
  };

  return <DependencyContext.Provider value={value}>{children}</DependencyContext.Provider>;
};

/**
 * Hook to use the dependency injection context
 */
export const useDependencies = () => {
  const context = useContext(DependencyContext);

  if (!context) {
    throw new Error('useDependencies must be used within a DependencyProvider');
  }

  return context;
};
