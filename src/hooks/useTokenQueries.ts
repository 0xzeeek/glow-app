import { useQuery, useQueries } from '@tanstack/react-query';
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

// Hook for fetching 24h price data for home page charts
export const useToken24hPrices = (tokenAddress: string, enabled = true) => {
  const apiClient = getApiClient();
  
  return useQuery({
    queryKey: queryKeys.prices.history(tokenAddress, { range: '1d' }),
    queryFn: () => apiClient.getTokenPrices(tokenAddress, { range: '1d' }),
    enabled: enabled && !!tokenAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for fetching price data with customizable range for token detail page
export const useTokenPriceHistory = (
  tokenAddress: string, 
  range: '1h' | '1d' | '7d' | '30d' | 'all' = '1d',
  enabled = true
) => {
  const apiClient = getApiClient();
  
  return useQuery({
    queryKey: queryKeys.prices.history(tokenAddress, { range }),
    queryFn: () => apiClient.getTokenPrices(tokenAddress, { range }),
    enabled: enabled && !!tokenAddress,
    staleTime: range === '1h' ? 1000 * 60 * 1 : 1000 * 60 * 5, // 1 min for 1h, 5 min for others
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook for fetching multiple tokens' 24h prices in parallel (for home page)
export const useMultipleToken24hPrices = (tokenAddresses: string[]) => {
  const apiClient = getApiClient();
  
  return useQueries({
    queries: tokenAddresses.map(address => ({
      queryKey: queryKeys.prices.history(address, { range: '1d' }),
      queryFn: () => apiClient.getTokenPrices(address, { range: '1d' }),
      enabled: !!address,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    })),
  });
};

export const useTokenMetadata = (token: string) => {
  const apiClient = getApiClient();
  
  return useQuery({
    queryKey: queryKeys.tokens.metadata(token),
    queryFn: () => apiClient.getTokenMetadata(token),
    enabled: !!token,
  });
};

export const useAllTokens = () => {
  const apiClient = getApiClient();
  
  return useQuery({
    queryKey: queryKeys.tokens.all(),
    queryFn: () => apiClient.getAllTokens(),
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

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