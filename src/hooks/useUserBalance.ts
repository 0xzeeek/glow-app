import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiClient, queryKeys } from '../services/ApiClient';

interface UseUserBalanceOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export function useUserBalance(walletAddress: string | null, options?: UseUserBalanceOptions) {
  const queryClient = useQueryClient();
  const apiClient = getApiClient();

  const query = useQuery({
    queryKey: walletAddress ? queryKeys.users.usdcBalance(walletAddress) : ['users', 'no-wallet', 'usdc-balance'],
    queryFn: async () => {
      if (!walletAddress) {
        return { balance: 0 };
      }
      return apiClient.getUserUSDCBalance(walletAddress);
    },
    enabled: !!walletAddress && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval ?? 30000, // Default to 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Manual refresh function
  const refreshBalance = async () => {
    if (walletAddress) {
      await queryClient.invalidateQueries({ 
        queryKey: queryKeys.users.usdcBalance(walletAddress) 
      });
    }
  };

  return {
    balance: query.data?.balance ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    refreshBalance,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,
  };
} 