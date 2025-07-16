import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWebSocketManager, getApiClient } from '../services';
import { queryKeys } from '../services/ApiClient';
import { BalanceUpdate } from '../types';
import { TOKEN_ADDRESSES } from '../utils/constants';

export function useWebSocketBalanceUpdates(walletAddress: string | null) {
  const queryClient = useQueryClient();
  const wsManagerRef = useRef<ReturnType<typeof getWebSocketManager> | null>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!walletAddress) return;

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
          wsManager.subscribeToBalance(walletAddress);
          isSubscribedRef.current = true;
        }

        // Handle balance updates
        const handleBalanceUpdate = async (data: BalanceUpdate) => {
          if (data.wallet === walletAddress) {
            let usdValue = 0;

            // Check if the token is USDC
            if (data.token === TOKEN_ADDRESSES.USDC) {
              // For USDC, the amount is already in USD (accounting for decimals)
              usdValue = data.amount;
            } else {
              // For other tokens, fetch the current price and calculate USD value
              try {
                const apiClient = getApiClient();
                const priceData = await apiClient.getLatestPrice(data.token);
                // Calculate USD value: token amount * token price
                usdValue = data.amount * priceData.price;
              } catch (error) {
                console.error('Failed to fetch token price for balance calculation:', error);
                // If we can't get the price, we can't update the balance
                return;
              }
            }

            // Get current balance from cache
            const currentData = queryClient.getQueryData<{ balance: number }>(
              queryKeys.users.holdings(walletAddress)
            );
            const currentBalance = currentData?.balance || 0;

            // Update React Query cache with the new balance
            // The amount can be positive (deposit) or negative (withdrawal)
            const newBalance = Math.max(0, currentBalance + usdValue); // Ensure balance doesn't go negative
            
            queryClient.setQueryData(
              queryKeys.users.holdings(walletAddress),
              { balance: newBalance }
            );

            // Also update any other relevant caches
            queryClient.invalidateQueries({
              queryKey: queryKeys.users.holdings(walletAddress),
              refetchType: 'none', // Don't refetch, we just updated the cache
            });

            // Invalidate wallet holdings to get fresh data
            queryClient.invalidateQueries({
              queryKey: queryKeys.users.holdings(walletAddress),
            });
          }
        };

        // Handle connection events
        const handleConnected = () => {
          // Subscribe when WebSocket connects
          if (!isSubscribedRef.current) {
            wsManager.subscribeToBalance(walletAddress);
            isSubscribedRef.current = true;
          }
        };

        const handleDisconnected = () => {
          isSubscribedRef.current = false;
        };

        wsManager.on('balanceUpdate', handleBalanceUpdate);
        wsManager.on('connected', handleConnected);
        wsManager.on('disconnected', handleDisconnected);

        // Cleanup function
        cleanup = () => {
          if (wsManagerRef.current) {
            if (isSubscribedRef.current) {
              wsManagerRef.current.unsubscribeFromBalance(walletAddress);
            }
            wsManagerRef.current.off('balanceUpdate', handleBalanceUpdate);
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
  }, [walletAddress, queryClient]);

  return {
    isConnected: wsManagerRef.current?.isConnected() ?? false,
  };
} 