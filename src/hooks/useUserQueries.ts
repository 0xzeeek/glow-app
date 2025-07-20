import { useQuery } from '@tanstack/react-query';
import { getApiClient, queryKeys } from '../services/ApiClient';

// Hook for fetching user profile
export function useUserProfile(walletAddress: string | null) {
  const apiClient = getApiClient();

  return useQuery({
    queryKey: walletAddress ? queryKeys.users.profile(walletAddress) : ['users', 'no-wallet', 'profile'],
    queryFn: async () => {
      if (!walletAddress) {
        return null;
      }
      return apiClient.getUserProfile(walletAddress);
    },
    enabled: !!walletAddress,
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
}

// Hook for fetching wallet holdings
export function useWalletHoldings(walletAddress: string | null) {
  const apiClient = getApiClient();

  return useQuery({
    queryKey: walletAddress ? queryKeys.users.holdings(walletAddress) : ['users', 'no-wallet', 'holdings'],
    queryFn: async () => {
      if (!walletAddress) {
        return null;
      }
      return apiClient.getWalletBalance(walletAddress);
    },
    enabled: !!walletAddress,
  });
} 