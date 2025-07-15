import { useState, useEffect } from 'react';
import { getApiClient } from '../services/ApiClient';

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

interface TokenDetails {
  id: string;
  name: string;
  symbol: string;
  price: string;
  priceChange: number;
  profileImage: string;
  backgroundImage: string;
  marketCap: string;
  volume24h: string;
  holders: number;
  circulatingSupply: string;
  createdAt: string;
  description: string;
  socialLinks: {
    platform: string;
    handle: string;
    icon: string;
  }[];
}

interface UseTokenDetailsReturn {
  tokenDetails: TokenDetails | null;
  topHolders: TopHolder[];
  chartData: ChartDataPoint[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Fetch basic token details
async function fetchTokenDetails(tokenId: string): Promise<TokenDetails> {
  try {
    const apiClient = getApiClient();
    const response = await apiClient.request<TokenDetails>(`/tokens/${tokenId}`);
    return response;
  } catch (error) {
    console.error('Error fetching token details:', error);
    throw error;
  }
}

// Fetch top holders
async function fetchTopHolders(tokenId: string): Promise<TopHolder[]> {
  try {
    const apiClient = getApiClient();
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
    // Return empty array on error to maintain UI consistency
    return [];
  }
}

// Fetch chart data with timeframe
async function fetchChartData(tokenId: string, timeframe: string = '1D'): Promise<ChartDataPoint[]> {
  try {
    const apiClient = getApiClient();
    const response = await apiClient.request<ChartDataPoint[]>(`/tokens/${tokenId}/chart`, {
      params: { timeframe }
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
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
  const [topHolders, setTopHolders] = useState<TopHolder[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAllData = async () => {
    if (!tokenId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel for better performance
      const [details, holders, chart] = await Promise.all([
        fetchTokenDetails(tokenId),
        fetchTopHolders(tokenId),
        fetchChartData(tokenId),
      ]);

      setTokenDetails(details);
      setTopHolders(holders);
      setChartData(chart);
    } catch (err) {
      // setError(err as Error);
      // Still try to use mock data if available
      if (!tokenDetails) {
        // Use mock data from context as fallback
        const mockData = getMockTokenData(tokenId);
        if (mockData) {
          setTokenDetails(mockData.details);
          setTopHolders(mockData.holders);
          setChartData(mockData.chart);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAllData();
  }, [tokenId]);

  // Refetch function
  const refetch = () => {
    fetchAllData();
  };

  return {
    tokenDetails,
    topHolders,
    chartData,
    isLoading,
    error,
    refetch,
  };
}

// Mock data fallback function
function getMockTokenData(tokenId: string) {
  // This would normally import from your mock data
  // For now, returning a basic structure
  return {
    details: {
      id: tokenId,
      name: 'VisualBleed',
      symbol: 'VB',
      price: '$0.007',
      priceChange: 1.16,
      profileImage: 'https://i.pravatar.cc/300?img=25',
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

// Export individual fetch functions for flexibility
export { fetchTokenDetails, fetchTopHolders, fetchChartData }; 