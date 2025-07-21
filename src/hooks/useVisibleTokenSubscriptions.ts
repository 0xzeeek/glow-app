import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getPriceSocket } from '../services';
import { queryKeys } from '../services/ApiClient';
import { Token, TokenAddress } from '../types';

interface UseVisibleTokenSubscriptionsProps {
  visibleTokens: Token[];
  featuredToken?: Token;
  balanceTokens?: Token[]; // User's holdings for profile page
  onPriceUpdate: (address: TokenAddress, price: number) => void;
}

/**
 * Manages PriceSocket subscriptions for visible tokens and user balance tokens
 * This prevents subscribing to hundreds of tokens at once
 * 
 * IMPORTANT: The `onPriceUpdate` callback should be wrapped in useCallback with stable dependencies
 * to prevent unnecessary re-subscriptions when the list re-orders.
 */
export function useVisibleTokenSubscriptions({
  visibleTokens,
  featuredToken,
  balanceTokens = [],
  onPriceUpdate,
}: UseVisibleTokenSubscriptionsProps) {
  const subscribedTokensRef = useRef<Set<TokenAddress>>(new Set());
  const handlersRef = useRef<Map<TokenAddress, (price: number, timestamp: number) => void>>(new Map());
  const queryClient = useQueryClient();
  
  // Create a stable handler factory that won't change unless dependencies change
  const createPriceHandler = useCallback((address: TokenAddress) => {
    return (price: number, timestamp: number) => {
      // Call the provided callback
      onPriceUpdate(address, price);
      
      // Update React Query cache for price history
      const ranges = ['1h', '1d', '7d', '30d', 'all'] as const;
      ranges.forEach(range => {
        queryClient.setQueryData(
          queryKeys.prices.history(address, { range }),
          (oldData: any) => {
            if (!oldData || !oldData.prices) return oldData;
            
            // Add the new price point to the end of the array
            const newPricePoint = {
              timestamp,
              price,
              source: 'websocket',
            };
            
            // Check if we already have this timestamp (prevent duplicates)
            const existingIndex = oldData.prices.findIndex(
              (p: any) => p.timestamp === timestamp
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
            const MAX_CHART_POINTS = 200;
            if (updatedPrices.length > MAX_CHART_POINTS) {
              // Sample the data to keep it under the limit
              const interval = Math.floor(updatedPrices.length / MAX_CHART_POINTS);
              const sampled = updatedPrices.filter((_: any, index: number) => index % interval === 0);
              
              // Always include the last point (most recent)
              const lastPoint = updatedPrices[updatedPrices.length - 1];
              if (!sampled.some((p: any) => p.timestamp === lastPoint.timestamp)) {
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
    };
  }, [onPriceUpdate, queryClient]);
  
  // Subscribe/unsubscribe based on visibility and balance changes
  useEffect(() => {
    try {
      const priceSocket = getPriceSocket();
      
      // Combine visible tokens and balance tokens, removing duplicates
      const allTokens = [...visibleTokens, ...balanceTokens, ...(featuredToken ? [featuredToken] : [])];
      const tokenMap = new Map<TokenAddress, Token>();
      allTokens.forEach(token => tokenMap.set(token.address, token));
      
      const requiredAddresses = new Set(tokenMap.keys());
      const currentSubscribed = subscribedTokensRef.current;
      
      // Find tokens to unsubscribe (no longer visible or in balance)
      const toUnsubscribe: TokenAddress[] = [];
      currentSubscribed.forEach(address => {
        if (!requiredAddresses.has(address)) {
          toUnsubscribe.push(address);
        }
      });
      
      // Find tokens to subscribe (newly visible or in balance)
      const toSubscribe: TokenAddress[] = [];
      requiredAddresses.forEach(address => {
        if (!currentSubscribed.has(address)) {
          toSubscribe.push(address);
        }
      });
      
      // Unsubscribe tokens that are no longer needed
      toUnsubscribe.forEach(address => {
        priceSocket.unwatch(address);
        subscribedTokensRef.current.delete(address);
        handlersRef.current.delete(address);
      });
      
      // Subscribe to new tokens
      toSubscribe.forEach(address => {
        const handler = createPriceHandler(address);
        handlersRef.current.set(address, handler);
        priceSocket.watch(address, handler);
        subscribedTokensRef.current.add(address);
      });
      
      // Update handlers for existing subscriptions if onPriceUpdate changed
      // This avoids unsubscribe/resubscribe cycles when only the handler changes
      currentSubscribed.forEach(address => {
        if (requiredAddresses.has(address)) {
          const existingHandler = handlersRef.current.get(address);
          const newHandler = createPriceHandler(address);
          
          // Only update if the handler actually changed
          if (existingHandler !== newHandler) {
            handlersRef.current.set(address, newHandler);
            // PriceSocket.watch will overwrite the handler without unsubscribing
            priceSocket.watch(address, newHandler);
          }
        }
      });
      
      // Cleanup: unsubscribe from all on unmount
      return () => {
        const allSubscribed = Array.from(subscribedTokensRef.current);
        allSubscribed.forEach(address => {
          priceSocket.unwatch(address);
        });
        subscribedTokensRef.current.clear();
        handlersRef.current.clear();
      };
    } catch (error) {
      // PriceSocket might not be initialized yet
      console.log('PriceSocket not available:', error);
      // Return an empty cleanup function to satisfy TypeScript
      return () => {};
    }
  }, [visibleTokens, balanceTokens, featuredToken, createPriceHandler]);
  
  return {
    subscribedCount: subscribedTokensRef.current.size,
  };
} 