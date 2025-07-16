import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiClient, queryKeys } from '../services/ApiClient';
import { 
  LatestPriceResponse, 
  UpdateTokenMetadataParams,
  GetPricesParams,
} from '../types';
import { getErrorHandler, ErrorCategory, ErrorSeverity } from '../services/ErrorHandler';

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

// Hook for updating token metadata
export function useUpdateTokenMetadata(tokenAddress: string) {
  const queryClient = useQueryClient();
  const apiClient = getApiClient();

  return useMutation({
    mutationFn: async (data: UpdateTokenMetadataParams) => {
      return apiClient.updateTokenMetadata(tokenAddress, data);
    },
    onSuccess: (data) => {
      // Update the cache with the new metadata
      queryClient.setQueryData(queryKeys.tokens.metadata(tokenAddress), data);
      
      // Add breadcrumb for tracking
      getErrorHandler().addBreadcrumb(
        'Token metadata updated',
        'trading',
        { tokenAddress, updatedFields: Object.keys(data) }
      );
    },
    onError: (error) => {
      // Provide context for token metadata errors
      getErrorHandler().handleError(
        error,
        ErrorCategory.TRADING,
        ErrorSeverity.MEDIUM,
        { 
          metadata: { 
            action: 'updateTokenMetadata', 
            tokenAddress 
          } 
        }
      );
    },
  });
}

// Hook for uploading token image
export function useUploadTokenImage(tokenAddress: string) {
  const queryClient = useQueryClient();
  const apiClient = getApiClient();

  return useMutation({
    mutationFn: async (imageFile: File | Blob) => {
      // Get upload URL
      const { uploadUrl, publicUrl } = await apiClient.getTokenImageUploadUrl(tokenAddress);

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

      // Update the metadata with the new image URL
      const updatedMetadata = await apiClient.updateTokenMetadata(tokenAddress, {
        imageUrl: publicUrl,
      });

      return updatedMetadata;
    },
    onSuccess: (data) => {
      // Update the metadata cache
      queryClient.setQueryData(queryKeys.tokens.metadata(tokenAddress), data);
    },
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