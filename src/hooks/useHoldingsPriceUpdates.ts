import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocketPriceUpdates } from './useWebSocketPriceUpdates';
import { queryKeys } from '../services/ApiClient';
import { TokenHolding, WalletBalance } from '../types';
import { calculatePnlPercentage } from '../utils';

interface UseHoldingsPriceUpdatesProps {
  walletAddress: string | null;
  tokenHoldings: TokenHolding[];
}

/**
 * Hook to manage live price updates for user's token holdings
 * Updates the cached wallet balance data when prices change
 */
export function useHoldingsPriceUpdates({ 
  walletAddress, 
  tokenHoldings 
}: UseHoldingsPriceUpdatesProps) {
  const queryClient = useQueryClient();

  // Handle price updates by updating the cached wallet holdings
  const handlePriceUpdate = useCallback((tokenAddress: string, newPrice: number) => {
    if (!walletAddress) return;

    // Update the cached wallet holdings data
    queryClient.setQueryData<WalletBalance>(
      queryKeys.users.holdings(walletAddress),
      (oldData) => {
        if (!oldData) return oldData;

        // Find the token that was updated
        const tokenIndex = oldData.tokens.findIndex(t => t.address === tokenAddress);
        if (tokenIndex === -1) return oldData;

        // Create a copy of the tokens array
        const updatedTokens = [...oldData.tokens];
        const token = updatedTokens[tokenIndex];

        // Calculate new USD value with the updated price
        const newUsdValue = token.balance * newPrice;

        // Recalculate PnL percentage with the new price
        const newPnlPercentage = calculatePnlPercentage(
          token.balance,
          newPrice,
          token.pnlData
        );

        // Update the token with new price and calculated values
        updatedTokens[tokenIndex] = {
          ...token,
          price: newPrice,
          value: newUsdValue,
          pnlPercentage: newPnlPercentage,
        };

        // Recalculate total USD value
        const newTotalUsdValue = updatedTokens.reduce((total, t) => total + t.value, 0);

        // Return the updated wallet balance
        return {
          ...oldData,
          tokens: updatedTokens,
          totalUsdValue: newTotalUsdValue,
          timestamp: Date.now(),
        };
      }
    );
  }, [walletAddress, queryClient]);

  // Use the WebSocket price updates hook - TokenHolding now extends Token
  const { isConnected } = useWebSocketPriceUpdates({
    tokens: tokenHoldings,
    onPriceUpdate: handlePriceUpdate,
  });

  return {
    isConnected,
  };
} 