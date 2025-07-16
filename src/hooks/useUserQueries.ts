import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiClient, queryKeys } from '../services/ApiClient';
import { UpdateUserParams } from '../types';
import { getErrorHandler, ErrorCategory, ErrorSeverity } from '../services/ErrorHandler';

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
        const error = new Error('No wallet address available');
        getErrorHandler().handleError(
          error,
          ErrorCategory.VALIDATION,
          ErrorSeverity.MEDIUM,
          { metadata: { action: 'updateUserProfile' } }
        );
        throw error;
      }
      return apiClient.updateUserProfile(walletAddress, data);
    },
    onSuccess: (data) => {
      if (walletAddress) {
        // Update the cache with the new profile data
        queryClient.setQueryData(queryKeys.users.profile(walletAddress), data);
        
        // Add breadcrumb for successful profile update
        getErrorHandler().addBreadcrumb(
          'User profile updated successfully',
          'user',
          { walletAddress, updatedFields: Object.keys(data) }
        );
      }
    },
    onError: (error) => {
      // Additional context for profile update errors
      getErrorHandler().handleError(
        error,
        ErrorCategory.AUTH,
        ErrorSeverity.MEDIUM,
        { 
          metadata: { 
            action: 'updateUserProfile', 
            walletAddress 
          } 
        }
      );
    },
  });
}

// TODO: update this to the pattern we're using on the backend
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

// Hook for fetching wallet holdings
export function useWalletHoldings(walletAddress: string | null) {
  const apiClient = getApiClient();

  return useQuery({
    queryKey: walletAddress ? queryKeys.users.holdings(walletAddress) : ['users', 'no-wallet', 'holdings'],
    queryFn: async () => {
      if (!walletAddress) {
        return null;
      }
      return apiClient.getWalletHoldings(walletAddress);
    },
    enabled: !!walletAddress,
    staleTime: 30 * 1000, // 30 seconds - more frequent updates for balance
    gcTime: 5 * 60 * 1000, // 5 minutes
    // refetchInterval: 60 * 1000, // Refetch every minute // TODO: use websocket for this
  });
} 