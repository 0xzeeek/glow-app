import { QueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import {
  LatestPriceResponse,
  TokenPricesResponse,
  GetPricesParams,
  TokenMetadata,
  UserProfile,
  WalletBalance,
} from '../types';
import { getErrorHandler, ErrorCategory, ErrorSeverity } from './ErrorHandler';

interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(config: ApiConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.defaultTimeout = config.timeout || 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': `Glow/${Platform.OS}`,
      ...config.headers,
    };
  }

  public async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      params,
      timeout = this.defaultTimeout,
      retries = 0,
      ...fetchOptions
    } = options;

    // Build URL with query params
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Create abort controller for timeout
    const requestId = `${endpoint}-${Date.now()}`;
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    const timeoutId = setTimeout(() => {
      abortController.abort();
      this.abortControllers.delete(requestId);
    }, timeout);

    try {
      const response = await fetch(url.toString(), {
        ...fetchOptions,
        headers: {
          ...this.defaultHeaders,
          ...fetchOptions.headers,
        },
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);
      this.abortControllers.delete(requestId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      this.abortControllers.delete(requestId);

      // Handle abort errors
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new ApiError('Request timeout', 408);
        getErrorHandler().handleError(
          timeoutError,
          ErrorCategory.NETWORK,
          ErrorSeverity.MEDIUM,
          { metadata: { endpoint, method: fetchOptions.method || 'GET' } }
        );
        throw timeoutError;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message === 'Network request failed') {
        const networkError = new ApiError('Network error', 0);
        getErrorHandler().handleError(
          networkError,
          ErrorCategory.NETWORK,
          ErrorSeverity.HIGH,
          { metadata: { endpoint, method: fetchOptions.method || 'GET' } }
        );
        throw networkError;
      }

      // Retry logic for certain errors
      if (retries > 0 && this.shouldRetry(error)) {
        await this.delay(1000); // Wait 1 second before retry
        return this.request<T>(endpoint, { ...options, retries: retries - 1 });
      }

      // Handle other API errors
      if (error instanceof ApiError) {
        const severity = error.status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM;
        getErrorHandler().handleError(
          error,
          ErrorCategory.NETWORK,
          severity,
          { metadata: { endpoint, method: fetchOptions.method || 'GET', status: error.status } }
        );
      }

      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    if (error instanceof ApiError) {
      // Retry on server errors and timeout
      return error.status >= 500 || error.status === 408;
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cancel all pending requests
  public cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  // Price data
  public async getLatestPrice(token: string): Promise<LatestPriceResponse> {
    return this.request<LatestPriceResponse>(`/tokens/${token}/price`);
  }

  public async getTokenPrices(
    token: string,
    params?: GetPricesParams
  ): Promise<TokenPricesResponse> {
    return this.request<TokenPricesResponse>(`/tokens/${token}/prices`, { params });
  }

  // Token metadata
  public async getTokenMetadata(token: string): Promise<TokenMetadata> {
    return this.request<TokenMetadata>(`/tokens/${token}`);
  }

  // User profile
  public async getUserProfile(wallet: string): Promise<UserProfile> {
    return this.request<UserProfile>(`/users/${wallet}`);
  }

  // Update username using PUT endpoint
  public async updateUser(wallet: string, username: string): Promise<UserProfile> {
    return this.request<UserProfile>(`/users/${wallet}`, {
      method: 'PUT',
      body: JSON.stringify({ username }),
    });
  }

  // Wallet balance
  public async getWalletBalance(wallet: string): Promise<WalletBalance> {
    return this.request<WalletBalance>(`/wallets/${wallet}/balance`);
  }

  // Historical prices
  public async getHistoricalPrices(
    mint: string, 
    range: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<Array<{ timestamp: number; price: number }>> {
    return this.request<Array<{ timestamp: number; price: number }>>(`/tokens/${mint}/prices`, {
      params: { range }
    });
  }

  // Upload user profile image
  public async uploadUserImage(wallet: string, imageData: string): Promise<{
    ok: boolean;
    image: string;
  }> {
    return this.request(`/users/${wallet}/image`, {
      method: 'POST',
      body: JSON.stringify({ image: imageData }),
    });
  }

  public async checkUsernameExists(username: string): Promise<{
    available: boolean;
  }> {
    return this.request(`/users/check/${username}`, {
      method: 'GET'
    });
  }
}

// Custom error class
export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Create singleton instance
let apiClient: ApiClient | null = null;

export const initializeApiClient = (config: ApiConfig): ApiClient => {
  apiClient = new ApiClient(config);
  return apiClient;
};

export const getApiClient = (): ApiClient => {
  if (!apiClient) {
    throw new Error('ApiClient not initialized. Call initializeApiClient first.');
  }
  return apiClient;
};

// TanStack Query configuration
export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
        retry: (failureCount, error) => {
          if (error instanceof ApiError) {
            // Don't retry on 4xx errors
            if (error.status >= 400 && error.status < 500) {
              return false;
            }
          }
          return failureCount < 3;
        },
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: false,
        onError: (error) => {
          // Import will be added at top of file
          const errorHandler = getErrorHandler();
          const category = error instanceof ApiError ? ErrorCategory.NETWORK : ErrorCategory.UNKNOWN;
          const severity = error instanceof ApiError && error.status >= 500 
            ? ErrorSeverity.HIGH 
            : ErrorSeverity.MEDIUM;
          
          errorHandler.handleError(error, category, severity);
        },
      },
    },
  });
};

// Query key factory for consistency
export const queryKeys = {
  prices: {
    latest: (token: string) => ['prices', token, 'latest'] as const,
    history: (token: string, params?: GetPricesParams) => 
      ['prices', token, 'history', params] as const,
  },
  tokens: {
    metadata: (token: string) => ['tokens', token] as const,
    holders: (token: string) => ['tokens', token, 'holders'] as const,
    chart: (token: string, timeframe?: string) => ['tokens', token, 'chart', timeframe] as const,
  },
  users: {
    profile: (wallet: string) => ['users', wallet] as const,
    holdings: (wallet: string) => ['wallets', wallet, 'balance'] as const,
  },
}; 