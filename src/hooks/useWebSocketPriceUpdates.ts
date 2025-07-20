import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWebSocketManager } from '../services';
import { queryKeys } from '../services/ApiClient';
import { PriceUpdate, Token, TokenAddress } from '../types';

interface UseWebSocketPriceUpdatesProps {
  tokens: Token[];
  onPriceUpdate: (address: TokenAddress, price: number) => void;
}

export function useWebSocketPriceUpdates({ tokens, onPriceUpdate }: UseWebSocketPriceUpdatesProps) {
  const queryClient = useQueryClient();
  const subscribedTokensRef = useRef<Set<TokenAddress>>(new Set());
  const lastPriceUpdatesRef = useRef<Record<string, PriceUpdate>>({});

  // WebSocket subscription management
  const subscribeToTokens = useCallback((tokenAddresses: TokenAddress[]) => {
    const wsManager = getWebSocketManager();
    if (!wsManager || !wsManager.isConnected()) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return;
    }

    tokenAddresses.forEach(address => {
      if (!subscribedTokensRef.current.has(address)) {
        try {
          wsManager.subscribeToPrice(address);
          subscribedTokensRef.current.add(address);
        } catch (error) {
          console.error(`Failed to subscribe to ${address}:`, error);
        }
      }
    });
  }, []);

  const unsubscribeFromTokens = useCallback((tokenAddresses: TokenAddress[]) => {
    const wsManager = getWebSocketManager();
    if (!wsManager) {
      console.warn('Cannot unsubscribe: WebSocket manager not available');
      return;
    }

    tokenAddresses.forEach(address => {
      if (subscribedTokensRef.current.has(address)) {
        try {
          wsManager.unsubscribeFromPrice(address);
          subscribedTokensRef.current.delete(address);
        } catch (error) {
          console.error(`Failed to unsubscribe from ${address}:`, error);
          // Still remove from tracking even if unsubscribe fails
          subscribedTokensRef.current.delete(address);
        }
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
        onPriceUpdate(data.token, data.price);
        
        // Update React Query cache for price history
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
              
              // Limit chart points to prevent unbounded growth
              const MAX_CHART_POINTS = 200; // Match backend limit
              if (updatedPrices.length > MAX_CHART_POINTS) {
                // Sample the data to keep it under the limit
                const interval = Math.floor(updatedPrices.length / MAX_CHART_POINTS);
                const sampled = updatedPrices.filter((_, index) => index % interval === 0);
                
                // Always include the last point (most recent)
                const lastPoint = updatedPrices[updatedPrices.length - 1];
                if (!sampled.some(p => p.timestamp === lastPoint.timestamp)) {
                  sampled.push(lastPoint);
                }
                
                updatedPrices = sampled;
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
      
      // Clean up old entries periodically to prevent memory leaks
      const tokenCount = Object.keys(lastPriceUpdatesRef.current).length;
      if (tokenCount > 100) { // Limit to prevent unbounded growth
        // Keep the top 50 tokens by market cap (those most likely to be visible)
        const tokensByMarketCap = Object.entries(lastPriceUpdatesRef.current)
          .map(([address, update]) => {
            const token = tokens.find(t => t.address === address);
            return {
              address,
              update,
              marketCap: token?.marketCap || 0
            };
          })
          .sort((a, b) => b.marketCap - a.marketCap) // Sort by market cap descending
          .slice(0, 50); // Keep top 50
        
        // Rebuild the ref with only the top tokens
        lastPriceUpdatesRef.current = Object.fromEntries(
          tokensByMarketCap.map(item => [item.address, item.update])
        );
      }
    };

    wsManager.on('priceUpdate', handlePriceUpdate);

    return () => {
      wsManager.off('priceUpdate', handlePriceUpdate);
      // Unsubscribe from all tokens on cleanup
      const allSubscribed = Array.from(subscribedTokensRef.current);
      unsubscribeFromTokens(allSubscribed);
    };
  }, [onPriceUpdate, unsubscribeFromTokens, queryClient, tokens]);

  // Handle token list changes - subscribe to new tokens, unsubscribe from removed ones
  useEffect(() => {
    const wsManager = getWebSocketManager();
    if (!wsManager || !wsManager.isConnected()) return;
    
    const currentAddresses = new Set(tokens.map(t => t.address));
    const subscribedAddresses = subscribedTokensRef.current;
    
    // Unsubscribe from removed tokens
    const toUnsubscribe: TokenAddress[] = [];
    subscribedAddresses.forEach(address => {
      if (!currentAddresses.has(address)) {
        toUnsubscribe.push(address);
      }
    });
    if (toUnsubscribe.length > 0) {
      unsubscribeFromTokens(toUnsubscribe);
    }
    
    // Subscribe to new tokens
    const toSubscribe: TokenAddress[] = [];
    currentAddresses.forEach(address => {
      if (!subscribedAddresses.has(address)) {
        toSubscribe.push(address);
      }
    });
    if (toSubscribe.length > 0) {
      subscribeToTokens(toSubscribe);
    }
  }, [tokens, subscribeToTokens, unsubscribeFromTokens]);

  // Listen for connection events
  useEffect(() => {
    const wsManager = getWebSocketManager();
    if (!wsManager) return;
    
    const handleConnect = () => {
      // Re-subscribe to all tokens when connection is established
      const currentAddresses = tokens.map(t => t.address);
      const toSubscribe = currentAddresses.filter(
        address => !subscribedTokensRef.current.has(address)
      );
      if (toSubscribe.length > 0) {
        subscribeToTokens(toSubscribe);
      }
    };
    
    wsManager.on('connected', handleConnect);
    return () => {
      wsManager.off('connected', handleConnect);
    };
  }, [tokens, subscribeToTokens]);

  return {
    subscribeToTokens,
    unsubscribeFromTokens,
    isConnected: getWebSocketManager()?.isConnected() ?? false,
  };
} 