import { useQueries } from '@tanstack/react-query';
import { getApiClient, queryKeys } from '../services/ApiClient';
import { TokenDetails } from '../types';

interface TopHolder {
  position: number;
  avatar: string;
  address: string;
  holdings: number;
  percentage: number;
}

interface ChartDataPoint {
  timestamp: number;
  price: number;
}

interface UseTokenDetailsReturn {
  tokenDetails: TokenDetails | null;
  topHolders: TopHolder[];
  chartData: ChartDataPoint[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Mock chart data generator for fallback
function generateMockChartData(): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = Date.now();
  const basePrice = 0.007;
  
  for (let i = 0; i < 100; i++) {
    const variation = Math.random() * 0.002 - 0.001;
    data.push({
      timestamp: now - (100 - i) * 3600000,
      price: basePrice + variation + (i * 0.00001),
    });
  }
  
  return data;
}

export function useTokenDetails(tokenId: string): UseTokenDetailsReturn {
  const apiClient = getApiClient();
  
  // Use useQueries for parallel fetching
  const queries = useQueries({
    queries: [
      {
        queryKey: queryKeys.tokens.metadata(tokenId),
        queryFn: async () => {
          const response = await apiClient.request<TokenDetails>(`/tokens/${tokenId}`);
          return response;
        },
        enabled: !!tokenId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
      {
        queryKey: queryKeys.tokens.holders(tokenId),
        queryFn: async () => {
          try {
            const response = await apiClient.request<{ holders: any[] }>(`/tokens/${tokenId}/holders`);
            // Transform the response to match our interface
            return response.holders.slice(0, 3).map((holder: any, index: number) => ({
              position: index + 1,
              avatar: holder.profileImage || '',
              address: holder.address,
              holdings: holder.holdings,
              percentage: holder.percentage,
            }));
          } catch (error) {
            console.error('Error fetching top holders:', error);
            return [];
          }
        },
        enabled: !!tokenId,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
      },
      {
        queryKey: queryKeys.tokens.chart(tokenId, '1D'),
        queryFn: async () => {
          try {
            const response = await apiClient.request<ChartDataPoint[]>(`/tokens/${tokenId}/chart`, {
              params: { timeframe: '1D' }
            });
            // Ensure data is properly formatted
            return response.map((point: any) => ({
              timestamp: point.timestamp || point.time,
              price: point.price || point.value,
            }));
          } catch (error) {
            console.error('Error fetching chart data:', error);
            // Return mock data on error for development
            return generateMockChartData();
          }
        },
        enabled: !!tokenId,
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
      },
    ],
  });

  // Extract results
  const [detailsQuery, holdersQuery, chartQuery] = queries;
  
  // Check if any query has an error
  const error = queries.find(q => q.error)?.error as Error | null;
  
  // If there's an error and no data, try to use mock data
  const tokenDetails = detailsQuery.data || (error ? getMockTokenData(tokenId)?.details : null);
  const topHolders = holdersQuery.data || [];
  const chartData = chartQuery.data || [];
  
  return {
    tokenDetails,
    topHolders,
    chartData,
    isLoading: queries.some(q => q.isLoading),
    error,
    refetch: () => {
      queries.forEach(q => q.refetch());
    },
  };
}

// Mock data fallback function
function getMockTokenData(tokenId: string) {
  // This would normally import from your mock data
  // For now, returning a basic structure
  return {
    details: {
      address: tokenId,
      name: 'VisualBleed',
      symbol: 'VB',
      price: '$0.007',
      priceChange: 1.16,
      image: 'https://i.pravatar.cc/300?img=25',
      backgroundImage: 'https://picsum.photos/800/600?grayscale&blur=2',
      marketCap: '$8.3M',
      volume24h: '$134,877',
      holders: 17000,
      circulatingSupply: '237,271',
      createdAt: '6 day / 2 months ago',
      description: 'Born in a jet engine. Powered by energy drinks and 90 mode. Hold it if your heart rate matches the frame rate.',
      socialLinks: [
        { platform: 'X', handle: '@creatorname', icon: 'logo-twitter' },
        { platform: 'Instagram', handle: '@creatorname', icon: 'logo-instagram' },
        { platform: 'YouTube', handle: '@creatorname', icon: 'logo-youtube' },
      ],
    },
    holders: [
      { position: 1, avatar: 'https://i.pravatar.cc/150?img=1', address: '0x...', holdings: 1000000, percentage: 15.5 },
      { position: 2, avatar: 'https://i.pravatar.cc/150?img=2', address: '0x...', holdings: 800000, percentage: 12.3 },
      { position: 3, avatar: 'https://i.pravatar.cc/150?img=3', address: '0x...', holdings: 600000, percentage: 9.2 },
    ],
    chart: generateMockChartData(),
  };
}

// Export individual fetch functions for flexibility (these now return promises that can be used outside React)
export async function fetchTokenDetails(tokenId: string): Promise<TokenDetails> {
  const apiClient = getApiClient();
  return apiClient.request<TokenDetails>(`/tokens/${tokenId}`);
}

export async function fetchTopHolders(tokenId: string): Promise<TopHolder[]> {
  const apiClient = getApiClient();
  const response = await apiClient.request<{ holders: any[] }>(`/tokens/${tokenId}/holders`);
  return response.holders.slice(0, 3).map((holder: any, index: number) => ({
    position: index + 1,
    avatar: holder.profileImage || '',
    address: holder.address,
    holdings: holder.holdings,
    percentage: holder.percentage,
  }));
}

export async function fetchChartData(tokenId: string, timeframe: string = '1D'): Promise<ChartDataPoint[]> {
  const apiClient = getApiClient();
  const response = await apiClient.request<ChartDataPoint[]>(`/tokens/${tokenId}/chart`, {
    params: { timeframe }
  });
  return response.map((point: any) => ({
    timestamp: point.timestamp || point.time,
    price: point.price || point.value,
  }));
} 