import React, { createContext, useContext, ReactNode, useMemo, useCallback, useState } from 'react';
import { useFlattenedInfiniteTokens } from '../hooks';
import { Token, TokenAddress } from '../types';

interface TokenDataContextType {
  featuredToken: Token | null;
  creatorTokens: Token[];
  allTokens: Token[];
  isLoading: boolean;
  error: Error | null;
  getTokenByAddress: (address: TokenAddress) => Token | undefined;
  getTokenPrice: (address: TokenAddress) => number | undefined;
  searchTokens: (query: string) => Token[];
  refreshTokenData: () => Promise<void>;
  updateTokenPrice: (address: TokenAddress, price: number) => void;
  // Infinite scrolling
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

const TokenDataContext = createContext<TokenDataContextType | undefined>(undefined);

interface TokenDataProviderProps {
  children: ReactNode;
}

export function TokenDataProvider({ children }: TokenDataProviderProps) {
  const {
    tokens,
    isLoading,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useFlattenedInfiniteTokens({
    limit: 20,
    order: 'desc',
  });

  // Track local price updates
  const [localPriceUpdates, setLocalPriceUpdates] = useState<{
    [address: string]: { price: number };
  }>({});

  // Merge fetched tokens with local price updates
  const allTokens = useMemo(() => {
    return tokens.map(token => {
      const update = localPriceUpdates[token.address];
      if (update) {
        return { ...token, price: update.price };
      }
      return token;
    });
  }, [tokens, localPriceUpdates]);

  // Calculate featured token (most recent createdAt)
  const featuredToken = useMemo(() => {
    if (allTokens.length === 0) return null;
    return [...allTokens].sort((a, b) => b.createdAt - a.createdAt)[0];
  }, [allTokens]);

  // Calculate creator tokens (all tokens except featured token)
  const creatorTokens = useMemo(() => {
    if (!featuredToken) return allTokens;
    return allTokens.filter(token => token.address !== featuredToken.address);
  }, [allTokens, featuredToken]);

  const getTokenByAddress = useCallback((address: TokenAddress): Token | undefined => {
    console.log('address', address);
    console.log('allTokens.find(token => token.address === address)', allTokens.find(token => token.address === address));
    return allTokens.find(token => token.address === address);
  }, [allTokens]);

  const getTokenPrice = useCallback((address: TokenAddress): number | undefined => {
    const token = allTokens.find(t => t.address === address);
    return token?.price;
  }, [allTokens]);

  const searchTokens = useCallback((query: string): Token[] => {
    const lowercaseQuery = query.toLowerCase();
    
    return allTokens.filter(token =>
      token.name.toLowerCase().includes(lowercaseQuery) ||
      token.symbol.toLowerCase().includes(lowercaseQuery)
    );
  }, [allTokens]);

  const updateTokenPrice = useCallback((address: TokenAddress, price: number) => {
    setLocalPriceUpdates(prev => ({
      ...prev,
      [address]: { price }
    }));
  }, []);

  const refreshTokenData = useCallback(async () => {
    await refetch();
    // Clear local updates after refresh
    setLocalPriceUpdates({});
  }, [refetch]);

  const value: TokenDataContextType = {
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
    // Infinite scrolling
    hasNextPage: hasNextPage || false,
    isFetchingNextPage,
    fetchNextPage,
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