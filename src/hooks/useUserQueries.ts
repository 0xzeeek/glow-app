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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
    staleTime: 30 * 1000, // 30 seconds - more frequent updates for balance
    gcTime: 5 * 60 * 1000, // 5 minutes
    // refetchInterval: 60 * 1000, // Refetch every minute // TODO: use websocket for this
  });
} 