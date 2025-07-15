import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiClient, queryKeys } from '../services/ApiClient';
import { UserProfile, UpdateUserParams, UserPnLResponse, AggregatePnL } from '../types/solana-trading-backend';

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

// Hook for updating user profile
export function useUpdateUserProfile(walletAddress: string | null) {
  const queryClient = useQueryClient();
  const apiClient = getApiClient();

  return useMutation({
    mutationFn: async (data: UpdateUserParams) => {
      if (!walletAddress) {
        throw new Error('No wallet address available');
      }
      return apiClient.updateUserProfile(walletAddress, data);
    },
    onSuccess: (data) => {
      if (walletAddress) {
        // Update the cache with the new profile data
        queryClient.setQueryData(queryKeys.users.profile(walletAddress), data);
      }
    },
  });
}

// Hook for fetching user PnL
export function useUserPnL(walletAddress: string | null, token?: string) {
  const apiClient = getApiClient();

  return useQuery({
    queryKey: walletAddress 
      ? ['users', walletAddress, 'pnl', token || 'all'] 
      : ['users', 'no-wallet', 'pnl'],
    queryFn: async () => {
      if (!walletAddress) {
        return null;
      }
      return apiClient.getUserPnL(walletAddress, token);
    },
    enabled: !!walletAddress,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // 30 seconds
  });
}

// Hook for fetching aggregate PnL
export function useAggregatePnL(walletAddress: string | null) {
  const apiClient = getApiClient();

  return useQuery({
    queryKey: walletAddress 
      ? queryKeys.users.aggregatePnl(walletAddress) 
      : ['users', 'no-wallet', 'pnl', 'aggregate'],
    queryFn: async () => {
      if (!walletAddress) {
        return null;
      }
      return apiClient.getAggregatePnL(walletAddress);
    },
    enabled: !!walletAddress,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // 30 seconds
  });
}

// Hook for uploading user profile image
export function useUploadUserImage(walletAddress: string | null) {
  const queryClient = useQueryClient();
  const apiClient = getApiClient();

  return useMutation({
    mutationFn: async (imageFile: File | Blob) => {
      if (!walletAddress) {
        throw new Error('No wallet address available');
      }

      // Get upload URL
      const { uploadUrl, publicUrl } = await apiClient.getUserImageUploadUrl(walletAddress);

      // Upload the image
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: imageFile,
        headers: {
          'Content-Type': imageFile.type || 'image/jpeg',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      // Update the profile with the new image URL
      const updatedProfile = await apiClient.updateUserProfile(walletAddress, {
        profileUrl: publicUrl,
      });

      return updatedProfile;
    },
    onSuccess: (data) => {
      if (walletAddress) {
        // Update the profile cache
        queryClient.setQueryData(queryKeys.users.profile(walletAddress), data);
      }
    },
  });
} 