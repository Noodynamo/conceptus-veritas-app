/**
 * Interface for authentication services.
 * This interface defines the contract for authentication-related operations.
 * By defining this in the domain layer, we ensure that the domain doesn't depend
 * on specific authentication implementations.
 */
export interface AuthService {
  /**
   * Gets the current authentication token.
   * @returns The authentication token or null if not authenticated
   */
  getToken(): string | null;

  /**
   * Checks if the user is authenticated.
   * @returns A boolean indicating if the user is authenticated
   */
  isAuthenticated(): boolean;

  /**
   * Gets the current user ID.
   * @returns The current user ID or null if not authenticated
   */
  getCurrentUserId(): string | null;

  /**
   * Logs in a user with credentials.
   * @param email The user's email
   * @param password The user's password
   * @returns A Promise resolving to the authentication result
   */
  login(email: string, password: string): Promise<{ userId: string; token: string }>;

  /**
   * Logs out the current user.
   * @returns A Promise resolving when logout is complete
   */
  logout(): Promise<void>;

  /**
   * Refreshes the authentication token.
   * @returns A Promise resolving to the new token
   */
  refreshToken(): Promise<string>;
}
