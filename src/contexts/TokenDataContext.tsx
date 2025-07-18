import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect, useRef } from 'react';
import { Token, PriceUpdate } from '../types';
import { useAllTokens } from '../hooks';
import { getWebSocketManager } from '../services';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/ApiClient';

interface TokenDataContextType {
  // Data
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
  updateTokenPrice: (address: string, price: number) => void;
  
  // WebSocket subscription
  subscribeToTokens: (tokenAddresses: string[]) => void;
  unsubscribeFromTokens: (tokenAddresses: string[]) => void;
}

const TokenDataContext = createContext<TokenDataContextType | undefined>(undefined);

interface TokenDataProviderProps {
  children: ReactNode;
}

export function TokenDataProvider({ children }: TokenDataProviderProps) {
  const { data: fetchedTokens = [], isLoading, error, refetch } = useAllTokens();
  const [localPriceUpdates, setLocalPriceUpdates] = useState<Record<string, { price: number }>>({});
  const subscribedTokensRef = useRef<Set<string>>(new Set());
  const lastPriceUpdatesRef = useRef<Record<string, PriceUpdate>>({});
  const queryClient = useQueryClient();

  // Merge fetched tokens with local price updates
  const allTokens = useMemo(() => {
    return fetchedTokens.map(token => {
      const update = localPriceUpdates[token.address];
      if (update) {
        return { ...token, price: update.price };
      }
      return token;
    });
  }, [fetchedTokens, localPriceUpdates]);

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

  const updateTokenPrice = useCallback((address: string, price: number) => {
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

  // WebSocket subscription management
  const subscribeToTokens = useCallback((tokenAddresses: string[]) => {
    const wsManager = getWebSocketManager();
    if (!wsManager || !wsManager.isConnected()) return;

    tokenAddresses.forEach(address => {
      if (!subscribedTokensRef.current.has(address)) {
        wsManager.subscribeToPrice(address);
        subscribedTokensRef.current.add(address);
      }
    });
  }, []);

  const unsubscribeFromTokens = useCallback((tokenAddresses: string[]) => {
    const wsManager = getWebSocketManager();
    if (!wsManager) return;

    tokenAddresses.forEach(address => {
      if (subscribedTokensRef.current.has(address)) {
        wsManager.unsubscribeFromPrice(address);
        subscribedTokensRef.current.delete(address);
      }
    });
  }, []);

  // Set up WebSocket price update handler
  useEffect(() => {
    const wsManager = getWebSocketManager();
    if (!wsManager) return;

    const handlePriceUpdate = (data: PriceUpdate) => {
      const lastUpdate = lastPriceUpdatesRef.current[data.token];
      
      // Only update if this is a new update (newer timestamp)
      if (!lastUpdate || data.timestamp > lastUpdate.timestamp) {
        lastPriceUpdatesRef.current[data.token] = data;
        updateTokenPrice(data.token, data.price);
        
        // Update React Query cache for price history
        // This will add the new price point to the chart data
        const ranges = ['1h', '1d', '7d', '30d', 'all'] as const;
        ranges.forEach(range => {
          queryClient.setQueryData(
            queryKeys.prices.history(data.token, { range }),
            (oldData: any) => {
              if (!oldData || !oldData.prices) return oldData;
              
              // Add the new price point to the end of the array
              const newPricePoint = {
                timestamp: data.timestamp,
                price: data.price,
                source: 'websocket',
              };
              
              // Check if we already have this timestamp (prevent duplicates)
              const existingIndex = oldData.prices.findIndex(
                (p: any) => p.timestamp === data.timestamp
              );
              
              let updatedPrices;
              if (existingIndex >= 0) {
                // Update existing point
                updatedPrices = [...oldData.prices];
                updatedPrices[existingIndex] = newPricePoint;
              } else {
                // Add new point
                updatedPrices = [...oldData.prices, newPricePoint];
                // Keep array sorted by timestamp
                updatedPrices.sort((a: any, b: any) => a.timestamp - b.timestamp);
              }
              
              return {
                ...oldData,
                prices: updatedPrices,
                count: updatedPrices.length,
              };
            }
          );
        });
      }
    };

    wsManager.on('priceUpdate', handlePriceUpdate);

    return () => {
      wsManager.off('priceUpdate', handlePriceUpdate);
      // Unsubscribe from all tokens on cleanup
      const allSubscribed = Array.from(subscribedTokensRef.current);
      unsubscribeFromTokens(allSubscribed);
    };
  }, [updateTokenPrice, unsubscribeFromTokens, queryClient]);

  // Auto-subscribe to all tokens when they're loaded
  useEffect(() => {
    if (allTokens.length > 0) {
      const tokenAddresses = allTokens.map(token => token.address);
      subscribeToTokens(tokenAddresses);
    }
  }, [allTokens, subscribeToTokens]);

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
    subscribeToTokens,
    unsubscribeFromTokens,
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