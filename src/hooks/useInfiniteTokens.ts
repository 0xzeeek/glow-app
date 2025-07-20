import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { useRef, useMemo } from 'react';
import { getApiClient, queryKeys } from '../services/ApiClient';
import { Token, PaginatedTokensResponse } from '../types';

interface UseInfiniteTokensOptions {
  limit?: number;
  order?: 'asc' | 'desc';
}

export function useInfiniteTokens(options: UseInfiniteTokensOptions = {}) {
  const apiClient = getApiClient();
  const { limit = 20, order = 'desc' } = options;

  return useInfiniteQuery<
    PaginatedTokensResponse,
    Error,
    InfiniteData<PaginatedTokensResponse>,
    readonly unknown[],
    string | undefined
  >({
    queryKey: queryKeys.tokens.infinite({ limit, order }),
    queryFn: async ({ pageParam }) => {
      const response = await apiClient.getTokensPaginated({
        limit,
        cursor: pageParam,
        order,
      });
      
      return response;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      // Return the nextCursor if there's a next page, otherwise undefined
      return lastPage.hasNextPage ? lastPage.nextCursor : undefined;
    },
    refetchOnWindowFocus: true,
    // staleTime: 1000 * 60 * 1, // 1 minute
    // TODO: update this back to 1 minute
    staleTime: 1000,
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Helper hook to get flattened token list from infinite query
export function useFlattenedInfiniteTokens(options: UseInfiniteTokensOptions = {}) {
  const query = useInfiniteTokens(options);
  
  // Cache the flattened result to avoid recalculating on every render
  const flattenedCacheRef = useRef<{
    tokens: Token[];
    dataUpdatedAt: number;
    pagesLength: number;
  }>({
    tokens: [],
    dataUpdatedAt: 0,
    pagesLength: 0,
  });
  
  // Only recalculate when data actually changes
  const allTokens = useMemo(() => {
    const currentDataUpdatedAt = query.dataUpdatedAt;
    const currentPagesLength = query.data?.pages.length ?? 0;
    const cache = flattenedCacheRef.current;
    
    // Check if we need to recalculate
    if (
      cache.dataUpdatedAt !== currentDataUpdatedAt ||
      cache.pagesLength !== currentPagesLength
    ) {
      // Perform the expensive flattening operation
      const newTokens = query.data?.pages.flatMap((page) => page.tokens) ?? [];
      
      // Update cache
      flattenedCacheRef.current = {
        tokens: newTokens,
        dataUpdatedAt: currentDataUpdatedAt,
        pagesLength: currentPagesLength,
      };
      
      return newTokens;
    }
    
    // Return cached result
    return cache.tokens;
  }, [query.dataUpdatedAt, query.data?.pages.length]);
  
  // totalCount is cheap to calculate, no need to cache
  const totalCount = query.data?.pages[0]?.count ?? 0;
  
  return {
    ...query,
    tokens: allTokens,
    totalCount,
  };
} 