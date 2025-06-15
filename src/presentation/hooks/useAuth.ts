import { useDependencies } from '../../contexts/DependencyContext';

/**
 * Hook for accessing authentication functionality in components.
 * Provides authentication state and actions from the auth store.
 */
export const useAuth = () => {
  const { authStore } = useDependencies();

  return {
    isAuthenticated: authStore(state => state.isAuthenticated),
    userId: authStore(state => state.userId),
    isLoading: authStore(state => state.isLoading),
    error: authStore(state => state.error),
    login: authStore(state => state.login),
    logout: authStore(state => state.logout),
    clearError: authStore(state => state.clearError),
  };
};
