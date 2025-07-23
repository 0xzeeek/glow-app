import { QueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import {
  User,
  CreateUserRequest,
  CreateUserResponse,
  Token,
  TokenAddress,
  WalletAddress,
  WalletBalance,
  PricePoint,
  TokenPricesResponse,
  GetPricesParams,
  TopHolder,
  PaginatedTokensResponse,
  TokenHolding,
  TokenHolder,
  GetTokenHoldersResponse,
} from '../types';
import { getErrorHandler, ErrorCategory, ErrorSeverity, ApiError } from './ErrorHandler';

interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
  retries?: number; // @deprecated - Retries are now handled by React Query
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
      retries = 0, // Deprecated: retries are now handled by React Query
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

      // Removed retry logic - now handled by React Query at the hook level
      // This prevents duplicate retry attempts (N×M problem)

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

  // Cancel all pending requests
  public cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  public async getTokenPrices(
    token: string,
    params?: GetPricesParams
  ): Promise<TokenPricesResponse> {
    return this.request<TokenPricesResponse>(`/tokens/${token}/prices`, { params });
  }

  // Get paginated tokens
  public async getTokensPaginated(params: {
    limit: number;
    cursor?: string;
    order?: 'asc' | 'desc';
  }): Promise<PaginatedTokensResponse> {
    return this.request<PaginatedTokensResponse>('/tokens', { params });
  }

  // Get token holders
  public async getTokenHolders(
    token: string,
  ): Promise<TopHolder[]> {
    const response = await this.request<GetTokenHoldersResponse>(`/tokens/${token}/holders`);

    console.log('response', response);
    
    // Transform the response to match our TopHolder interface
    return response.holders.map((holder: TokenHolder, index: number) => ({
      position: index + 1,
      image: holder.image || '',
      wallet: holder.address,
      holdings: holder.balance / Math.pow(10, holder.decimals),
      percentage: holder.percentage,
      username: holder.username || undefined,
    }));
  }

  // User profile
  public async getUserProfile(wallet: string): Promise<User> {
    return this.request<User>(`/users/${wallet}`);
  }

  // Create user
  public async createUser(wallet: string, email: string, recievedReferralCode?: string): Promise<{
    ok: boolean;
    user: User;
  }> {
    return this.request(`/users`, {
      method: 'POST',
      body: JSON.stringify({ 
        wallet, 
        email,
        ...(recievedReferralCode && { recievedReferralCode })
      }),
    });
  }

  // Update username using PUT endpoint
  public async updateUser(wallet: string, username: string): Promise<User> {
    return this.request<User>(`/users/${wallet}`, {
      method: 'PUT',
      body: JSON.stringify({ username }),
    });
  }

  // Wallet balance
  public async getWalletBalance(wallet: string): Promise<WalletBalance> {
    console.log('ApiClient: Fetching wallet balance for', wallet);
    return this.request<WalletBalance>(`/wallets/${wallet}/balance`);
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

// AsyncStorage persister configuration
// Performance optimization: Increased throttle time and excluded price history from persistence
// to prevent heavy disk I/O from WebSocket price updates (200+ data points every second)
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 15000, // Increased to 15 seconds to reduce disk I/O from frequent price updates
});

// TanStack Query configuration
export const createQueryClient = (): QueryClient => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours - keep data in cache for 24 hours
        // Enable experimental flag for prefetching during render
        experimental_prefetchInRender: true,
        // Retry strategy: 
        // - Retry up to 3 times for server errors (5xx) and network errors
        // - Don't retry client errors (4xx) 
        // - Exponential backoff: 1s, 2s, 4s... up to 30s max
        // Note: ApiClient no longer has retry logic to prevent duplicate retries
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
        // Important: Always refetch on mount to ensure fresh data
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
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

  // Set up persistence
  persistQueryClient({
    queryClient,
    persister: asyncStoragePersister,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours - persist data for 24 hours
    dehydrateOptions: {
      // Filter out price history queries from persistence
      // These are large arrays (up to 200 points) that update frequently via WebSocket
      shouldDehydrateQuery: (query) => {
        const queryKey = query.queryKey;
        // Don't persist price history queries
        if (Array.isArray(queryKey) && queryKey[0] === 'prices' && queryKey[2] === 'history') {
          return false;
        }
        // Persist all other queries
        return true;
      },
    },
    hydrateOptions: {
      // This ensures queries are marked as stale when restored from storage
      // so they'll refetch automatically when components mount
      defaultOptions: {
        queries: {
          gcTime: 1000 * 60 * 60 * 24, // 24 hours
        },
      },
    },
  });

  return queryClient;
};

// Query key factory for consistency
export const queryKeys = {
  prices: {
    latest: (token: string) => ['prices', token, 'latest'] as const,
    history: (token: string, params?: GetPricesParams) => 
      ['prices', token, 'history', params] as const,
  },
  tokens: {
    all: () => ['tokens', 'all'] as const,
    infinite: (params: { limit: number; order: 'asc' | 'desc' }) => 
      ['tokens', 'infinite', params] as const,
    metadata: (token: string) => ['tokens', token] as const,
    holders: (token: string) => ['tokens', token, 'holders'] as const,
    chart: (token: string, timeframe?: string) => ['tokens', token, 'chart', timeframe] as const,
  },
  users: {
    profile: (wallet: string) => ['users', wallet] as const,
    holdings: (wallet: string) => ['wallets', wallet, 'balance'] as const,
  },
}; 

export { ApiClient, ApiError };