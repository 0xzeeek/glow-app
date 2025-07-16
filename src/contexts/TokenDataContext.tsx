import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { topMovers, featuredToken, creatorTokens, TopMover, FeaturedTokenData, CreatorToken } from '../data/mockTokens';
import { getTokenDetailsById, TokenDetails } from '../data/mockTokenDetails';

interface TokenDataContextType {
  // Data
  topMovers: TopMover[];
  featuredToken: FeaturedTokenData;
  creatorTokens: CreatorToken[];
  
  // Actions
  getTokenByAddress: (address: string) => CreatorToken | TopMover | FeaturedTokenData | undefined;
  getTokenDetails: (address: string) => TokenDetails;
  getTokenPrice: (address: string) => number;
  searchTokens: (query: string) => (CreatorToken | TopMover)[];
  refreshTokenData: () => Promise<void>;
  updateTokenPrice: (address: string, price: number, change24h: number) => void;
}

const TokenDataContext = createContext<TokenDataContextType | undefined>(undefined);

interface TokenDataProviderProps {
  children: ReactNode;
}

export function TokenDataProvider({ children }: TokenDataProviderProps) {
  const [topMoversData, setTopMoversData] = useState<TopMover[]>(topMovers);
  const [featuredTokenData] = useState<FeaturedTokenData>(featuredToken);
  const [creatorTokensData, setCreatorTokensData] = useState<CreatorToken[]>(creatorTokens);

  const getTokenByAddress = useCallback((address: string): CreatorToken | TopMover | FeaturedTokenData | undefined => {
    // Check creator tokens
    const creatorToken = creatorTokensData.find(token => token.address === address);
    if (creatorToken) return creatorToken;
    
    // Check top movers
    const topMover = topMoversData.find(token => token.address === address);
    if (topMover) return topMover;
    
    // Check featured token
    if (featuredTokenData.address === address) return featuredTokenData;
    
    return undefined;
  }, [creatorTokensData, topMoversData, featuredTokenData]);

  const getTokenDetails = useCallback((address: string): TokenDetails => {
    return getTokenDetailsById(address);
  }, []);

  const getTokenPrice = useCallback((address: string): number => {
    const creatorToken = creatorTokensData.find(token => token.address === address);
    if (creatorToken) {
      // Extract price from string format "$0.007" to 0.007
      return parseFloat(creatorToken.price.replace('$', ''));
    }
    
    // For featured token and top movers, use a default or fetch from details
    const details = getTokenDetailsById(address);
    return parseFloat(details.price.replace('$', ''));
  }, [creatorTokensData]);

  const searchTokens = useCallback((query: string): (CreatorToken | TopMover)[] => {
    const lowercaseQuery = query.toLowerCase();
    
    const matchingCreatorTokens = creatorTokensData.filter(token =>
      token.name.toLowerCase().includes(lowercaseQuery)
    );
    
    const matchingTopMovers = topMoversData.filter(token =>
      token.name.toLowerCase().includes(lowercaseQuery)
    );
    
    return [...matchingCreatorTokens, ...matchingTopMovers];
  }, [creatorTokensData, topMoversData]);

  const updateTokenPrice = useCallback((address: string, price: number, change24h: number) => {
    // Update creator tokens
    setCreatorTokensData(prev => prev.map(token => 
      token.address === address 
        ? {
            ...token,
            price: `$${price.toFixed(4)}`,
            changePercent: change24h,
            // Update chart data to reflect new price (add to end)
            chartData: [...token.chartData.slice(1), price * 1000] // Normalize for chart display
          }
        : token
    ));
    
    // Update top movers and re-sort by change percentage
    setTopMoversData(prev => {
      const updated = prev.map(token => 
        token.address === address 
          ? { ...token, changePercent: change24h }
          : token
      );
      // Sort by absolute change percentage (biggest movers first)
      return [...updated].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));
    });
  }, []);

  const refreshTokenData = useCallback(async () => {
    // In a real app, this would fetch from an API
    // For now, we'll simulate price updates
    
    // Update creator tokens with simulated price changes
    setCreatorTokensData(prev => prev.map(token => {
      const priceChange = (Math.random() - 0.5) * 10; // ±5% change
      const currentPrice = parseFloat(token.price.replace('$', ''));
      const newPrice = currentPrice * (1 + priceChange / 100);
      
      return {
        ...token,
        price: `$${newPrice.toFixed(4)}`,
        changePercent: priceChange,
        // Update chart data to reflect new trend
        chartData: [...token.chartData.slice(1), token.chartData[token.chartData.length - 1] * (1 + priceChange / 100)]
      };
    }));
    
    // Update top movers
    setTopMoversData(prev => prev.map(token => ({
      ...token,
      changePercent: (Math.random() - 0.5) * 20 // ±10% change
    })));
    
    // You could also update featured token here
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }, []);

  const value: TokenDataContextType = {
    topMovers: topMoversData,
    featuredToken: featuredTokenData,
    creatorTokens: creatorTokensData,
    getTokenByAddress,
    getTokenDetails,
    getTokenPrice,
    searchTokens,
    refreshTokenData,
    updateTokenPrice,
  };

  return <TokenDataContext.Provider value={value}>{children}</TokenDataContext.Provider>;
}

export function useTokenData() {
  const context = useContext(TokenDataContext);
  if (context === undefined) {
    throw new Error('useTokenData must be used within a TokenDataProvider');
  }
  return context;
} 