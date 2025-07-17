import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { Token } from '../types';
import { useAllTokens } from '../hooks';

interface TokenDataContextType {
  // Data
  topMovers: Token[];
  featuredToken: Token | null;
  creatorTokens: Token[];
  allTokens: Token[];
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  getTokenByAddress: (address: string) => Token | undefined;
  getTokenPrice: (address: string) => number;
  searchTokens: (query: string) => Token[];
  refreshTokenData: () => Promise<void>;
  updateTokenPrice: (address: string, price: number, change24h: number) => void;
}

const TokenDataContext = createContext<TokenDataContextType | undefined>(undefined);

interface TokenDataProviderProps {
  children: ReactNode;
}

export function TokenDataProvider({ children }: TokenDataProviderProps) {
  const { data: fetchedTokens = [], isLoading, error, refetch } = useAllTokens();
  const [localPriceUpdates, setLocalPriceUpdates] = useState<Record<string, { price: number; change24h: number }>>({});

  // Merge fetched tokens with local price updates
  const allTokens = useMemo(() => {
    return fetchedTokens.map(token => {
      const update = localPriceUpdates[token.address];
      if (update) {
        return { ...token, price: update.price, change24h: update.change24h };
      }
      return token;
    });
  }, [fetchedTokens, localPriceUpdates]);

  // Calculate top movers (10 tokens with highest change24h)
  const topMovers = useMemo(() => {
    return [...allTokens]
      .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
      .slice(0, 10);
  }, [allTokens]);

  // Calculate featured token (most recent createdAt)
  // This will only be null if we have no tokens at all
  const featuredToken = useMemo(() => {
    if (allTokens.length === 0) return null;
    return [...allTokens].sort((a, b) => b.createdAt - a.createdAt)[0];
  }, [allTokens]);

  // Calculate creator tokens (all tokens except featured token)
  const creatorTokens = useMemo(() => {
    if (!featuredToken) return allTokens;
    return allTokens.filter(token => token.address !== featuredToken.address);
  }, [allTokens, featuredToken]);

  const getTokenByAddress = useCallback((address: string): Token | undefined => {
    return allTokens.find(token => token.address === address);
  }, [allTokens]);

  const getTokenPrice = useCallback((address: string): number => {
    const token = allTokens.find(t => t.address === address);
    return token?.price || 0;
  }, [allTokens]);

  const searchTokens = useCallback((query: string): Token[] => {
    const lowercaseQuery = query.toLowerCase();
    
    return allTokens.filter(token =>
      token.name.toLowerCase().includes(lowercaseQuery) ||
      token.symbol.toLowerCase().includes(lowercaseQuery)
    );
  }, [allTokens]);

  const updateTokenPrice = useCallback((address: string, price: number, change24h: number) => {
    setLocalPriceUpdates(prev => ({
      ...prev,
      [address]: { price, change24h }
    }));
  }, []);

  const refreshTokenData = useCallback(async () => {
    await refetch();
    // Clear local updates after refresh
    setLocalPriceUpdates({});
  }, [refetch]);

  const value: TokenDataContextType = {
    topMovers,
    featuredToken,
    creatorTokens,
    allTokens,
    isLoading,
    error: error as Error | null,
    getTokenByAddress,
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