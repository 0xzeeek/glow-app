import { useEffect, useCallback } from 'react';
import { getWebSocketManager } from '../services/WebSocketManager';
import { PriceUpdate, BalanceUpdate } from '../types/solana-trading-backend';
import { tradingStore } from '../stores/tradingStore';

export const useWebSocket = () => {
  const wsManager = getWebSocketManager();

  const subscribeToPrice = useCallback((token: string, callback?: (update: PriceUpdate) => void) => {
    // Subscribe to updates
    wsManager.subscribeToPrice(token);
    
    if (callback) {
      // Listen for updates
      const handler = (update: PriceUpdate) => {
        if (update.token === token) {
          callback(update);
        }
      };
      
      wsManager.on('priceUpdate', handler);
      
      // Return unsubscribe function
      return () => {
        wsManager.off('priceUpdate', handler);
        wsManager.unsubscribeFromPrice(token);
      };
    }
  }, [wsManager]);

  const subscribeToBalance = useCallback((wallet: string, callback?: (update: BalanceUpdate) => void) => {
    wsManager.subscribeToBalance(wallet);
    
    if (callback) {
      const handler = (update: BalanceUpdate) => {
        if (update.wallet === wallet) {
          callback(update);
        }
      };
      
      wsManager.on('balanceUpdate', handler);
      
      return () => {
        wsManager.off('balanceUpdate', handler);
        wsManager.unsubscribeFromBalance(wallet);
      };
    }
  }, [wsManager]);

  return {
    subscribeToPrice,
    subscribeToBalance,
    isConnected: wsManager.isConnected(),
  };
};

// Hook for subscribing to price updates and automatically updating store
export const usePriceSubscription = (token: string) => {
  const { subscribeToPrice } = useWebSocket();
  
  useEffect(() => {
    const unsubscribe = subscribeToPrice(token, (update) => {
      // Update the trading store
      tradingStore.getState().updatePrice(update);
    });
    
    return () => {
      unsubscribe?.();
    };
  }, [token, subscribeToPrice]);
};

// Hook for subscribing to balance updates
export const useBalanceSubscription = (wallet: string) => {
  const { subscribeToBalance } = useWebSocket();
  
  useEffect(() => {
    const unsubscribe = subscribeToBalance(wallet, (update) => {
      // Update the trading store
      tradingStore.getState().updateBalance(update);
    });
    
    return () => {
      unsubscribe?.();
    };
  }, [wallet, subscribeToBalance]);
}; 