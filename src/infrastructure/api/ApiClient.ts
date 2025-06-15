/**
 * ApiClient class for handling HTTP requests
 * Part of the infrastructure layer
 */
export class ApiClient {
  private baseUrl: string;
  private getTokenCallback: () => string | null;

  /**
   * Creates a new API client
   * @param baseUrl The base URL for API requests
   * @param getTokenCallback Optional callback to get the authentication token
   */
  constructor(baseUrl: string, getTokenCallback?: () => string | null) {
    this.baseUrl = baseUrl;
    this.getTokenCallback = getTokenCallback || (() => null);
  }

  /**
   * Updates the token callback function
   * This allows setting the auth token provider after initialization
   * to avoid circular dependencies
   */
  setTokenProvider(getTokenCallback: () => string | null): void {
    this.getTokenCallback = getTokenCallback;
  }

  /**
   * Get the authentication token from the callback
   */
  private getToken(): string | null {
    return this.getTokenCallback();
  }

  /**
   * Perform a GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Perform a POST request
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Perform a PUT request
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Perform a DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }
}
