import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWebSocketManager } from '../services';
import { queryKeys } from '../services/ApiClient';
import { PriceUpdate } from '../types';

export function useWebSocketPriceUpdates(tokenAddress: string | null) {
  const queryClient = useQueryClient();
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

        // Connect if not already connected
        if (!wsManager.isConnected()) {
          wsManager.connect();
        }

        // Subscribe if connected
        if (wsManager.isConnected() && !isSubscribedRef.current) {
          wsManager.subscribeToPrice(tokenAddress);
          isSubscribedRef.current = true;
        }

        // Handle price updates
        const handlePriceUpdate = (data: PriceUpdate) => {
          if (data.token === tokenAddress) {
            // Update React Query cache for latest price
            queryClient.setQueryData(
              queryKeys.prices.latest(tokenAddress),
              {
                price: data.price,
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
                        lastUpdated: data.timestamp,
                      }
                    : token
                );
              }
            );
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
        console.error('Failed to setup price subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      cleanup?.();
    };
  }, [tokenAddress, queryClient]);

  return {
    isConnected: wsManagerRef.current?.isConnected() ?? false,
  };
} 