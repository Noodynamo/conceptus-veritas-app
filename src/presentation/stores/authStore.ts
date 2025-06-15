import { create, StateCreator } from 'zustand';
import { AuthService } from '../../domain/services/auth/AuthService';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/**
 * Creates an auth store with Zustand.
 * This store manages authentication state and provides actions for login/logout.
 *
 * @param authService The authentication service implementation
 * @returns A Zustand store with auth state and actions
 */
export const createAuthStore = (authService: AuthService) => {
  return create<AuthState>((set, get) => ({
    isAuthenticated: authService.isAuthenticated(),
    userId: authService.getCurrentUserId(),
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null });

      try {
        const result = await authService.login(email, password);
        set({
          isAuthenticated: true,
          userId: result.userId,
          isLoading: false,
        });
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication failed',
        });
      }
    },

    logout: async () => {
      set({ isLoading: true });

      try {
        await authService.logout();
        set({
          isAuthenticated: false,
          userId: null,
          isLoading: false,
        });
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Logout failed',
        });
      }
    },

    clearError: () => set({ error: null }),
  }));
};

// Type for the store
export type AuthStore = ReturnType<typeof createAuthStore>;

// Helper hook for components that need to access auth state
export const useAuthStore = (store: AuthStore) => store;
