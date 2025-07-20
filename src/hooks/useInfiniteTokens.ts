import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
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
  
  const allTokens: Token[] = query.data?.pages.flatMap((page) => page.tokens) ?? [];
  const totalCount = query.data?.pages[0]?.count ?? 0;
  
  return {
    ...query,
    tokens: allTokens,
    totalCount,
  };
} 