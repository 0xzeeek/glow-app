import { useEffect, useRef } from 'react';
import { getWebSocketManager } from '../services';
import { PriceUpdate } from '../types';
import { useTokenData } from '../contexts';

export function useGlobalWebSocketUpdates() {
  const { updateTokenPrice, topMovers, creatorTokens } = useTokenData();
  const wsManagerRef = useRef<ReturnType<typeof getWebSocketManager> | null>(null);
  const subscribedTokensRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const setupGlobalSubscriptions = () => {
      try {
        // Get WebSocket manager instance
        const wsManager = getWebSocketManager();
        wsManagerRef.current = wsManager;

        // Connect if not already connected
        if (!wsManager.isConnected()) {
          wsManager.connect();
        }

        // Collect all unique token addresses
        const allTokens = new Set<string>();
        
        topMovers.forEach(token => allTokens.add(token.address));
        creatorTokens.forEach(token => allTokens.add(token.address));

        // Subscribe to tokens that aren't already subscribed
        allTokens.forEach(address => {
          if (!subscribedTokensRef.current.has(address)) {
            wsManager.subscribeToPrice(address);
            subscribedTokensRef.current.add(address);
          }
        });

        // Unsubscribe from tokens that are no longer visible
        subscribedTokensRef.current.forEach(address => {
          if (!allTokens.has(address)) {
            wsManager.unsubscribeFromPrice(address);
            subscribedTokensRef.current.delete(address);
          }
        });

        // Handle price updates for all tokens
        const handlePriceUpdate = (data: PriceUpdate) => {
          // Update the token price in context, which will trigger re-sorting
          updateTokenPrice(data.token, data.price, data.change24h);
        };

        // Handle connection events
        const handleConnected = () => {
          // Re-subscribe to all tokens when WebSocket reconnects
          subscribedTokensRef.current.forEach(address => {
            wsManager.subscribeToPrice(address);
          });
        };

        const handleDisconnected = () => {
          // Connection lost, but keep track of subscriptions for reconnect
        };

        wsManager.on('priceUpdate', handlePriceUpdate);
        wsManager.on('connected', handleConnected);
        wsManager.on('disconnected', handleDisconnected);

        // Cleanup function
        cleanup = () => {
          if (wsManagerRef.current) {
            // Unsubscribe from all tokens
            subscribedTokensRef.current.forEach(address => {
              wsManagerRef.current!.unsubscribeFromPrice(address);
            });
            subscribedTokensRef.current.clear();
            
            wsManagerRef.current.off('priceUpdate', handlePriceUpdate);
            wsManagerRef.current.off('connected', handleConnected);
            wsManagerRef.current.off('disconnected', handleDisconnected);
          }
        };
      } catch (error) {
        console.log('WebSocket not available for global updates:', error);
      }
    };

    setupGlobalSubscriptions();

    return () => {
      cleanup?.();
    };
  }, [topMovers, creatorTokens, updateTokenPrice]);

  return {
    isConnected: wsManagerRef.current?.isConnected() ?? false,
    subscribedCount: subscribedTokensRef.current.size,
  };
} 