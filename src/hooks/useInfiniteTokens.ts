import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { getApiClient, queryKeys } from '../services/ApiClient';
import { Token, PaginatedTokensResponse } from '../types';

interface UseInfiniteTokensOptions {
  limit?: number;
  order?: 'asc' | 'desc';
}

type PageData = PaginatedTokensResponse & { offset: number };

export function useInfiniteTokens(options: UseInfiniteTokensOptions = {}) {
  const apiClient = getApiClient();
  const { limit = 20, order = 'desc' } = options;

  return useInfiniteQuery<PageData, Error, InfiniteData<PageData>, readonly unknown[], number>({
    queryKey: queryKeys.tokens.infinite({ limit, order }),
    queryFn: async ({ pageParam = 0 }) => {
      // For now, using offset-based pagination
      // Can switch to cursor-based if backend supports it
      const response = await apiClient.getTokensPaginated({
        limit,
        offset: pageParam,
        order,
      });

      console.log('response', response);
      
      return {
        ...response,
        // Add offset for next page calculation
        offset: pageParam,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // Calculate next offset
      const loadedCount = allPages.reduce((sum, page) => sum + page.tokens.length, 0);
      
      // If we've loaded all tokens, return undefined to indicate no more pages
      if (loadedCount >= lastPage.count) {
        return undefined;
      }
      
      // Return the next offset
      return loadedCount;
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Helper hook to get flattened token list from infinite query
export function useFlattenedInfiniteTokens(options: UseInfiniteTokensOptions = {}) {
  const query = useInfiniteTokens(options);
  
  const allTokens = query.data?.pages.flatMap((page) => page.tokens) ?? [];
  const totalCount = query.data?.pages[0]?.count ?? 0;
  
  return {
    ...query,
    tokens: allTokens,
    totalCount,
  };
} 