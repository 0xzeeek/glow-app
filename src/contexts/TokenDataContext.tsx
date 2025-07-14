import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { topMovers, featuredToken, creatorTokens, TopMover, FeaturedTokenData, CreatorToken } from '../data/mockTokens';
import { getTokenDetailsById, TokenDetails } from '../data/mockTokenDetails';

interface TokenDataContextType {
  // Data
  topMovers: TopMover[];
  featuredToken: FeaturedTokenData;
  creatorTokens: CreatorToken[];
  
  // Actions
  getTokenById: (id: string) => CreatorToken | TopMover | FeaturedTokenData | undefined;
  getTokenDetails: (id: string) => TokenDetails;
  getTokenPrice: (id: string) => number;
  searchTokens: (query: string) => (CreatorToken | TopMover)[];
  refreshTokenData: () => Promise<void>;
}

const TokenDataContext = createContext<TokenDataContextType | undefined>(undefined);

interface TokenDataProviderProps {
  children: ReactNode;
}

export function TokenDataProvider({ children }: TokenDataProviderProps) {
  const [topMoversData, setTopMoversData] = useState<TopMover[]>(topMovers);
  const [featuredTokenData, setFeaturedTokenData] = useState<FeaturedTokenData>(featuredToken);
  const [creatorTokensData, setCreatorTokensData] = useState<CreatorToken[]>(creatorTokens);

  const getTokenById = useCallback((id: string): CreatorToken | TopMover | FeaturedTokenData | undefined => {
    // Check creator tokens
    const creatorToken = creatorTokensData.find(token => token.id === id);
    if (creatorToken) return creatorToken;
    
    // Check top movers
    const topMover = topMoversData.find(token => token.id === id);
    if (topMover) return topMover;
    
    // Check featured token
    if (featuredTokenData.id === id) return featuredTokenData;
    
    return undefined;
  }, [creatorTokensData, topMoversData, featuredTokenData]);

  const getTokenDetails = useCallback((id: string): TokenDetails => {
    return getTokenDetailsById(id);
  }, []);

  const getTokenPrice = useCallback((id: string): number => {
    const creatorToken = creatorTokensData.find(token => token.id === id);
    if (creatorToken) {
      // Extract price from string format "$0.007" to 0.007
      return parseFloat(creatorToken.price.replace('$', ''));
    }
    
    // For featured token and top movers, use a default or fetch from details
    const details = getTokenDetailsById(id);
    return parseFloat(details.price.replace('$', ''));
  }, [creatorTokensData]);

  const searchTokens = useCallback((query: string): (CreatorToken | TopMover)[] => {
    const lowercaseQuery = query.toLowerCase();
    
    const matchingCreatorTokens = creatorTokensData.filter(token =>
      token.creatorName.toLowerCase().includes(lowercaseQuery)
    );
    
    const matchingTopMovers = topMoversData.filter(token =>
      token.name.toLowerCase().includes(lowercaseQuery)
    );
    
    return [...matchingCreatorTokens, ...matchingTopMovers];
  }, [creatorTokensData, topMoversData]);

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
    getTokenById,
    getTokenDetails,
    getTokenPrice,
    searchTokens,
    refreshTokenData,
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