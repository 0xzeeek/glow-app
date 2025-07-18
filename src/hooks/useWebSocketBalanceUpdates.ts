import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWebSocketManager } from '../services';
import { queryKeys } from '../services/ApiClient';
import { BalanceUpdate, WalletBalance } from '../types';
import { TOKEN_ADDRESSES, calculatePnlPercentage } from '../utils';

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

        // Don't need to connect - it's already connected from _layout.tsx

        // Handle balance updates
        const handleBalanceUpdate = async (data: BalanceUpdate) => {
          if (data.wallet === walletAddress) {

            // Get current holdings from cache
            const currentData = queryClient.getQueryData<WalletBalance>(
              queryKeys.users.holdings(walletAddress)
            );

            if (!currentData) {
              // If we don't have existing data, invalidate to fetch fresh data
              queryClient.invalidateQueries({
                queryKey: queryKeys.users.holdings(walletAddress),
              });
              return;
            }

            // Find the token in current holdings
            const tokenIndex = currentData.tokens.findIndex(t => t.address === data.token);

            if (tokenIndex === -1) {
              // New token not in holdings - refetch everything
              queryClient.invalidateQueries({
                queryKey: queryKeys.users.holdings(walletAddress),
              });
              return;
            }

            // Update the specific token balance
            const updatedTokens = [...currentData.tokens];
            const token = updatedTokens[tokenIndex];

            console.log('updatedTokensOnUpdate', updatedTokens);

            // WebSocket sends human-readable amounts (e.g., 0.5 for $0.50)
            const normalizedAmount = data.amount;

            console.log('normalizedAmount', normalizedAmount);

            // Update token balance (amount is the change, not the new balance)
            const newBalance = Math.max(0, token.balance + normalizedAmount);

            console.log('newBalance', newBalance);

            // Calculate new USD value for this token
            let newUsdValue = 0;
            if (data.token === TOKEN_ADDRESSES.USDC) {
              // For USDC, price is $1, so USD value = balance
              newUsdValue = newBalance * 1;
            } else {
              // For other tokens, calculate USD value using current price
              newUsdValue = newBalance * token.price;
            }

            // Calculate PnL percentage if pnlData exists
            const newPnlPercentage = calculatePnlPercentage(
              newBalance,
              token.price,
              token.pnlData
            );

            // Update the token in the array
            updatedTokens[tokenIndex] = {
              ...token,
              balance: newBalance,
              usdValue: newUsdValue,
              pnlPercentage: newPnlPercentage,
            };

            console.log('updatedTokens', updatedTokens);

            // Recalculate total USD value
            const newTotalUsdValue = updatedTokens.reduce((total, t) => total + t.usdValue, 0);

            console.log('newTotalUsdValue', newTotalUsdValue);

            // Update cache with new data
            queryClient.setQueryData(queryKeys.users.holdings(walletAddress), {
              ...currentData,
              tokens: updatedTokens,
              totalUsdValue: newTotalUsdValue,
              timestamp: Date.now(),
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

        // Subscribe immediately if already connected
        if (wsManager.isConnected() && !isSubscribedRef.current) {
          wsManager.subscribeToBalance(walletAddress);
          isSubscribedRef.current = true;
        }

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
