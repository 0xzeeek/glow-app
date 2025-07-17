import { useQuery } from '@tanstack/react-query';
import { getApiClient, queryKeys } from '../services/ApiClient';
import { 
  LatestPriceResponse, 
  GetPricesParams,
} from '../types';

// Hook for fetching latest token price
export function useTokenPrice(tokenAddress: string, options?: { enabled?: boolean }) {
  const apiClient = getApiClient();

  return useQuery({
    queryKey: queryKeys.prices.latest(tokenAddress),
    queryFn: async () => {
      return apiClient.getLatestPrice(tokenAddress);
    },
    enabled: options?.enabled ?? true,
    refetchInterval: false, // relying on websocket
    staleTime: 2000, // Consider stale after 2 seconds
  });
}

// Hook for fetching token price history
export function useTokenPriceHistory(
  tokenAddress: string, 
  params?: GetPricesParams,
  options?: { enabled?: boolean }
) {
  const apiClient = getApiClient();

  return useQuery({
    queryKey: queryKeys.prices.history(tokenAddress, params),
    queryFn: async () => {
      return apiClient.getTokenPrices(tokenAddress, params);
    },
    enabled: options?.enabled ?? true,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching token metadata
export function useTokenMetadata(tokenAddress: string, options?: { enabled?: boolean }) {
  const apiClient = getApiClient();

  return useQuery({
    queryKey: queryKeys.tokens.metadata(tokenAddress),
    queryFn: async () => {
      return apiClient.getTokenMetadata(tokenAddress);
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching multiple token prices at once
export function useMultipleTokenPrices(
  tokenAddresses: string[], 
  options?: { enabled?: boolean }
) {
  const apiClient = getApiClient();

  return useQuery({
    queryKey: ['prices', 'multiple', ...tokenAddresses.sort()],
    queryFn: async () => {
      // Fetch all prices in parallel
      const prices = await Promise.all(
        tokenAddresses.map(address => apiClient.getLatestPrice(address))
      );
      
      // Return a map for easy lookup
      return tokenAddresses.reduce((acc, address, index) => {
        acc[address] = prices[index];
        return acc;
      }, {} as Record<string, LatestPriceResponse>);
    },
    enabled: (options?.enabled ?? true) && tokenAddresses.length > 0,
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 2000, // Consider stale after 2 seconds
  });
} 