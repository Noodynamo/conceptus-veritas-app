/**
 * Auth Hook
 *
 * This hook provides authentication functionality for the application.
 */

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  displayName: string;
  isEmailVerified: boolean;
}

/**
 * Auth context value interface
 */
interface AuthContextValue {
  currentUser: User | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, displayName: string) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (profile: Partial<User>) => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth provider component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Check for existing user session on mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        setIsLoading(true);

        // TODO: Implement actual auth state check
        // Mock implementation for now
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to check auth state'));
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);

      // TODO: Implement actual authentication
      // Mock implementation for now
      const user: User = {
        id: '123',
        email,
        displayName: email.split('@')[0],
        isEmailVerified: true,
      };

      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));

      setIsLoading(false);
      return user;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign in'));
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Sign up with email and password
   */
  const signUp = async (email: string, password: string, displayName: string): Promise<User> => {
    try {
      setIsLoading(true);

      // TODO: Implement actual user creation
      // Mock implementation for now
      const user: User = {
        id: '123',
        email,
        displayName,
        isEmailVerified: false,
      };

      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));

      setIsLoading(false);
      return user;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign up'));
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Sign out
   */
  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // TODO: Implement actual sign out
      // Mock implementation for now
      setCurrentUser(null);
      localStorage.removeItem('user');

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign out'));
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);

      // TODO: Implement actual password reset
      // Mock implementation for now
      console.log(`Password reset email sent to ${email}`);

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to reset password'));
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (profile: Partial<User>): Promise<void> => {
    try {
      setIsLoading(true);

      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }

      // TODO: Implement actual profile update
      // Mock implementation for now
      const updatedUser = {
        ...currentUser,
        ...profile,
      };

      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      setIsLoading(false);
      throw err;
    }
  };

  // Create context value
  const value: AuthContextValue = {
    currentUser,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook for using the auth context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// Export the context for direct usage if needed
export { AuthContext };
