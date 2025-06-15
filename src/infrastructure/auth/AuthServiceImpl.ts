import * as Sentry from '@sentry/react';
import { AuthService } from '../../domain/services/auth/AuthService';
import { ApiClient } from '../api/ApiClient';

/**
 * Implementation of the AuthService interface.
 * Handles authentication operations and integrates with Sentry for error tracking.
 */
export class AuthServiceImpl implements AuthService {
  private token: string | null = null;
  private userId: string | null = null;

  constructor(private apiClient: ApiClient) {
    // Initialize from localStorage if available
    this.token = localStorage.getItem('auth_token');
    this.userId = localStorage.getItem('user_id');

    // Set user context in Sentry if authenticated
    if (this.userId) {
      this.updateSentryContext();
    }
  }

  /**
   * Updates the Sentry user context with current authentication information.
   * This helps with error tracking and user identification in Sentry.
   */
  private updateSentryContext(): void {
    if (this.userId) {
      Sentry.setUser({ id: this.userId });
    } else {
      Sentry.setUser(null);
    }
  }

  /**
   * Gets the current authentication token.
   * @returns The authentication token or null if not authenticated
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Checks if the user is authenticated.
   * @returns A boolean indicating if the user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Gets the current user ID.
   * @returns The current user ID or null if not authenticated
   */
  getCurrentUserId(): string | null {
    return this.userId;
  }

  /**
   * Logs in a user with credentials.
   * @param email The user's email
   * @param password The user's password
   * @returns A Promise resolving to the authentication result
   */
  async login(email: string, password: string): Promise<{ userId: string; token: string }> {
    try {
      const response = await this.apiClient.post<{ userId: string; token: string }>('/auth/login', {
        email,
        password,
      });

      this.token = response.token;
      this.userId = response.userId;

      // Store in localStorage for persistence
      if (this.token && this.userId) {
        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('user_id', this.userId);
      }

      // Update Sentry context
      this.updateSentryContext();

      return { userId: this.userId || '', token: this.token || '' };
    } catch (error) {
      // Log to Sentry but keep user data private
      Sentry.captureException(error, {
        extra: { context: 'Authentication failed', email: email.substring(0, 2) + '...' },
      });
      throw error;
    }
  }

  /**
   * Logs out the current user.
   * @returns A Promise resolving when logout is complete
   */
  async logout(): Promise<void> {
    try {
      if (this.token) {
        await this.apiClient.post('/auth/logout', {});
      }
    } catch (error) {
      Sentry.captureException(error, {
        extra: { context: 'Logout failed' },
      });
    } finally {
      // Clear auth data regardless of API success
      this.token = null;
      this.userId = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');

      // Update Sentry context
      this.updateSentryContext();
    }
  }

  /**
   * Refreshes the authentication token.
   * @returns A Promise resolving to the new token
   */
  async refreshToken(): Promise<string> {
    try {
      const response = await this.apiClient.post<{ token: string }>('/auth/refresh', {});

      this.token = response.token;
      if (this.token) {
        localStorage.setItem('auth_token', this.token);
      }

      return this.token || '';
    } catch (error) {
      Sentry.captureException(error, {
        extra: { context: 'Token refresh failed' },
      });
      throw error;
    }
  }
}
