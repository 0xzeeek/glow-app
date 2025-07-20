import { useQueries } from '@tanstack/react-query';
import { getApiClient, queryKeys } from '../services/ApiClient';
import { TokenAddress } from '@/types';

// Hook for fetching multiple tokens' 24h prices in parallel (for home page)
export const useMultipleToken24hPrices = (tokenAddresses: TokenAddress[]) => {
  const apiClient = getApiClient();
  
  return useQueries({
    queries: tokenAddresses.map(address => ({
      queryKey: queryKeys.prices.history(address, { range: '1d' }),
      queryFn: () => apiClient.getTokenPrices(address, { range: '1d' }),
      enabled: !!address,
      staleTime: 1000 * 60 * 30, // 30 minutes (was 5)
      gcTime: 1000 * 60 * 60, // 60 minutes (was 10)
      refetchOnWindowFocus: false, // Don't refetch when app comes to foreground
    })),
  });
};