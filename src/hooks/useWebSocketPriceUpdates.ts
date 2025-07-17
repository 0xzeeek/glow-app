import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWebSocketManager } from '../services';
import { queryKeys } from '../services/ApiClient';
import { PriceUpdate } from '../types';
import { useTokenData } from '../contexts';

export function useWebSocketPriceUpdates(tokenAddress: string | null) {
  const queryClient = useQueryClient();
  const { updateTokenPrice } = useTokenData();
  const wsManagerRef = useRef<ReturnType<typeof getWebSocketManager> | null>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!tokenAddress) return;

    let cleanup: (() => void) | undefined;

    const setupSubscription = () => {
      try {
        // Get WebSocket manager instance
        const wsManager = getWebSocketManager();
        wsManagerRef.current = wsManager;

        // Don't need to connect - it's already connected from _layout.tsx

        // Handle price updates
        const handlePriceUpdate = (data: PriceUpdate) => {
          if (data.token === tokenAddress) {
            // Update TokenDataContext with new price and 24h change
            updateTokenPrice(tokenAddress, data.price, data.change24h);
            
            // Update React Query cache for latest price
            queryClient.setQueryData(
              queryKeys.prices.latest(tokenAddress),
              {
                price: data.price,
                change24h: data.change24h,
                timestamp: data.timestamp,
              }
            );

            // Also update token metadata cache if it exists
            queryClient.setQueryData(
              queryKeys.tokens.metadata(tokenAddress),
              (oldData: any) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  price: `$${data.price.toFixed(3)}`, // Update price in the format used by TokenDetails
                  priceChange: data.change24h, // Update the 24h change
                  currentPrice: data.price,
                  lastUpdated: data.timestamp,
                };
              }
            );

            // Update the price in any token lists
            queryClient.setQueriesData(
              { queryKey: ['tokens'], type: 'active' },
              (oldData: any) => {
                if (!oldData || !Array.isArray(oldData)) return oldData;
                return oldData.map((token: any) =>
                  token.address === tokenAddress
                    ? {
                        ...token,
                        currentPrice: data.price,
                        changePercent: data.change24h,
                        lastUpdated: data.timestamp,
                      }
                    : token
                );
              }
            );

            // Invalidate wallet holdings queries to update USD values
            queryClient.invalidateQueries({
              queryKey: ['users'],
              predicate: (query) => 
                query.queryKey.includes('holdings'),
            });
          }
        };

        // Handle connection events
        const handleConnected = () => {
          // Subscribe when WebSocket connects
          if (!isSubscribedRef.current) {
            wsManager.subscribeToPrice(tokenAddress);
            isSubscribedRef.current = true;
          }
        };

        const handleDisconnected = () => {
          isSubscribedRef.current = false;
        };

        // Subscribe immediately if already connected
        if (wsManager.isConnected() && !isSubscribedRef.current) {
          wsManager.subscribeToPrice(tokenAddress);
          isSubscribedRef.current = true;
        }

        wsManager.on('priceUpdate', handlePriceUpdate);
        wsManager.on('connected', handleConnected);
        wsManager.on('disconnected', handleDisconnected);

        // Cleanup function
        cleanup = () => {
          if (wsManagerRef.current) {
            if (isSubscribedRef.current) {
              wsManagerRef.current.unsubscribeFromPrice(tokenAddress);
            }
            wsManagerRef.current.off('priceUpdate', handlePriceUpdate);
            wsManagerRef.current.off('connected', handleConnected);
            wsManagerRef.current.off('disconnected', handleDisconnected);
            isSubscribedRef.current = false;
          }
        };
      } catch (error) {
        // WebSocketManager might not be initialized yet (e.g., if WS URL is not configured)
        console.log('WebSocket not available:', error);
      }
    };

    setupSubscription();

    return () => {
      cleanup?.();
    };
  }, [tokenAddress, queryClient, updateTokenPrice]);

  return {
    isConnected: wsManagerRef.current?.isConnected() ?? false,
  };
} 