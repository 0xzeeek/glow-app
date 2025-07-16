import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWebSocketManager } from '../services';
import { queryKeys } from '../services/ApiClient';
import { BalanceUpdate } from '../types';

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
        const handleBalanceUpdate = (data: BalanceUpdate) => {
          if (data.wallet === walletAddress) {
            // Update React Query cache
            queryClient.setQueryData(
              queryKeys.users.usdcBalance(walletAddress),
              { balance: data.balance }
            );
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
        console.error('Failed to setup balance subscription:', error);
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