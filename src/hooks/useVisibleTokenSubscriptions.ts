import { useEffect, useRef } from 'react';
import { useWebSocketPriceUpdates } from './useWebSocketPriceUpdates';
import { Token, TokenAddress } from '../types';

interface UseVisibleTokenSubscriptionsProps {
  visibleTokens: Token[];
  onPriceUpdate: (address: TokenAddress, price: number) => void;
}

/**
 * Manages WebSocket subscriptions for visible tokens only
 * This prevents subscribing to hundreds of tokens at once
 */
export function useVisibleTokenSubscriptions({
  visibleTokens,
  onPriceUpdate,
}: UseVisibleTokenSubscriptionsProps) {
  const subscribedTokensRef = useRef<Set<TokenAddress>>(new Set());
  
  // Use the WebSocket price updates hook with visible tokens
  const { subscribeToTokens, unsubscribeFromTokens } = useWebSocketPriceUpdates({
    tokens: visibleTokens, // Only pass visible tokens
    onPriceUpdate,
  });
  
  // Subscribe/unsubscribe based on visibility changes
  useEffect(() => {
    const visibleAddresses = new Set(visibleTokens.map(t => t.address));
    const currentSubscribed = subscribedTokensRef.current;
    
    // Find tokens to unsubscribe (no longer visible)
    const toUnsubscribe: TokenAddress[] = [];
    currentSubscribed.forEach(address => {
      if (!visibleAddresses.has(address)) {
        toUnsubscribe.push(address);
      }
    });
    
    // Find tokens to subscribe (newly visible)
    const toSubscribe: TokenAddress[] = [];
    visibleAddresses.forEach(address => {
      if (!currentSubscribed.has(address)) {
        toSubscribe.push(address);
      }
    });
    
    // Update subscriptions
    if (toUnsubscribe.length > 0) {
      unsubscribeFromTokens(toUnsubscribe);
      toUnsubscribe.forEach(addr => subscribedTokensRef.current.delete(addr));
    }
    
    if (toSubscribe.length > 0) {
      subscribeToTokens(toSubscribe);
      toSubscribe.forEach(addr => subscribedTokensRef.current.add(addr));
    }
    
    // Cleanup: unsubscribe from all on unmount
    return () => {
      const allSubscribed = Array.from(subscribedTokensRef.current);
      if (allSubscribed.length > 0) {
        unsubscribeFromTokens(allSubscribed);
        subscribedTokensRef.current.clear();
      }
    };
  }, [visibleTokens, subscribeToTokens, unsubscribeFromTokens]);
  
  return {
    subscribedCount: subscribedTokensRef.current.size,
  };
} 