import { useEffect, useCallback, useRef } from 'react';
import { getLiveWebSocketManager } from '../services';
import { TokenUpdateEvent } from '../types';

interface UseTokenSocketUpdatesOptions {
  onTokenUpdate: () => void | Promise<void>;
}

export function useTokenSocketUpdates({ onTokenUpdate }: UseTokenSocketUpdatesOptions) {
  const wsManager = useRef<ReturnType<typeof getLiveWebSocketManager> | null>(null);
  const isSubscribed = useRef(false);

  // Handle token updates
  const handleTokenUpdate = useCallback((data: TokenUpdateEvent) => {
    console.log('Received token update:', data);
    
    if (data.type === 'TOKEN_CREATED') {
      // When a new token is created, trigger the callback
      // This ensures the new token appears as the featured token
      onTokenUpdate();
    } else if (data.type === 'TOKEN_UPDATED') {
      // For regular updates, also trigger the callback
      onTokenUpdate();
    }
  }, [onTokenUpdate]);

  // Subscribe to token updates
  const subscribeToTokenUpdates = useCallback(() => {
    if (!wsManager.current || isSubscribed.current) return;
    
    console.log('Subscribing to token updates');
    
    // Use the new subscribeToTokens method
    wsManager.current.subscribeToTokens();
    
    isSubscribed.current = true;
  }, []);

  // Unsubscribe from token updates
  const unsubscribeFromTokenUpdates = useCallback(() => {
    if (!wsManager.current || !isSubscribed.current) return;
    
    console.log('Unsubscribing from token updates');
    
    // Use the new unsubscribeFromTokens method
    wsManager.current.unsubscribeFromTokens();
    
    isSubscribed.current = false;
  }, []);

  useEffect(() => {
    try {
      // Get the WebSocket manager instance
      wsManager.current = getLiveWebSocketManager();
      
      // Set up event listeners
      wsManager.current.on('tokenUpdate', handleTokenUpdate);
      wsManager.current.on('connected', subscribeToTokenUpdates);
      
      // If already connected, subscribe immediately
      if (wsManager.current.isConnected()) {
        subscribeToTokenUpdates();
      } else {
        // Connect to WebSocket
        wsManager.current.connect();
      }
      
      // Cleanup function
      return () => {
        if (wsManager.current) {
          unsubscribeFromTokenUpdates();
          wsManager.current.off('tokenUpdate', handleTokenUpdate);
          wsManager.current.off('connected', subscribeToTokenUpdates);
        }
      };
    } catch (error) {
      console.error('Failed to initialize token socket updates:', error);
    }
  }, [handleTokenUpdate, subscribeToTokenUpdates, unsubscribeFromTokenUpdates]);
  
  return {
    isSubscribed: isSubscribed.current,
  };
}
