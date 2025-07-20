import { useState, useMemo, useEffect } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getApiClient, queryKeys } from '../services/ApiClient';
import { Token, TokenAddress, TopHolder } from '../types';
import { useTokenData } from '../contexts';

interface ChartDataPoint {
  timestamp: number;
  price: number;
}

type TimeRange = '1h' | '1d' | '7d' | '30d' | 'all';

interface UseTokenDetailsReturn {
  tokenDetails: Token | null;
  topHolders: TopHolder[];
  chartData: ChartDataPoint[];
  isLoading: boolean;
  isChartLoading: boolean;
  error: Error | null;
  refetch: () => void;
  selectedRange: TimeRange;
  setSelectedRange: (range: TimeRange) => void;
  availableRanges: Record<TimeRange, boolean>;
}

export function useTokenDetails(address: TokenAddress): UseTokenDetailsReturn {
  const apiClient = getApiClient();
  const { getTokenByAddress } = useTokenData();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1d');
  
  // Get token from context
  const tokenFromContext = useMemo(() => getTokenByAddress(address), [address, getTokenByAddress]);
  
  // All time ranges we want to prefetch
  const timeRanges: TimeRange[] = ['1h', '1d', '7d', '30d', 'all'];
  
  // Fetch price history for all time ranges in parallel
  const priceQueries = useQueries({
    queries: timeRanges.map(range => ({
      queryKey: queryKeys.prices.history(address, { range }),
      queryFn: () => apiClient.getTokenPrices(address, { range }),
      enabled: !!address,
      staleTime: range === '1h' ? 1000 * 60 * 1 : 1000 * 60 * 5, // 1 min for 1h, 5 min for others
      gcTime: 1000 * 60 * 10, // 10 minutes
    })),
  });
  
  // Determine which ranges have data
  const availableRanges = useMemo(() => {
    const ranges: Record<TimeRange, boolean> = {
      '1h': false,
      '1d': false,
      '7d': false,
      '30d': false,
      'all': false,
    };
    
    priceQueries.forEach((query, index) => {
      const range = timeRanges[index];
      ranges[range] = !!(query.data && query.data.prices && query.data.prices.length > 0);
    });
    
    return ranges;
  }, [priceQueries]);
  
  // Auto-select first available range if current selection has no data
  useEffect(() => {
    if (!availableRanges[selectedRange]) {
      const firstAvailable = timeRanges.find(range => availableRanges[range]);
      if (firstAvailable) {
        setSelectedRange(firstAvailable);
      }
    }
  }, [availableRanges, selectedRange]);
  
  // Get the current selected range data
  const selectedPriceData = priceQueries[timeRanges.indexOf(selectedRange)]?.data;
  const isPriceLoading = priceQueries[timeRanges.indexOf(selectedRange)]?.isLoading || false;
  
  // Use useQueries for parallel fetching of other data
  const queries = useQueries({
    queries: [
      {
        queryKey: queryKeys.tokens.holders(address),
        queryFn: () => apiClient.getTokenHolders(address, 3),
        enabled: !!address,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
      },
    ],
  });

  // Extract results
  const [holdersQuery] = queries;
  
  // Transform price data to chart data format
  const chartData: ChartDataPoint[] = selectedPriceData?.prices.map(point => ({
    timestamp: point.timestamp,
    price: point.price,
  })) || [];
  
  // Check if any query has an error
  const error = queries.find(q => q.error)?.error || priceQueries.find(q => q.error)?.error;
  
  const tokenDetails = tokenFromContext || null;
  const topHolders = holdersQuery.data || [];
  
  return {
    tokenDetails,
    topHolders,
    chartData,
    isLoading: queries.some(q => q.isLoading) || (!tokenFromContext && !queries.some(q => q.data)),
    isChartLoading: isPriceLoading,
    error: error as Error | null,
    refetch: () => {
      queries.forEach(q => q.refetch());
      priceQueries.forEach(q => q.refetch());
    },
    selectedRange,
    setSelectedRange,
    availableRanges,
  };
}

// Export individual fetch functions for flexibility
export async function fetchTopHolders(address: TokenAddress): Promise<TopHolder[]> {
  const apiClient = getApiClient();
  return apiClient.getTokenHolders(address, 3);
} 