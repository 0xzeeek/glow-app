export * from './constants';
export * from './watchlist';

/**
 * Calculate PnL percentage based on token holding data
 * @param currentBalance Current token balance
 * @param currentPrice Current token price
 * @param pnlData Historical PnL data from the API
 * @returns PnL percentage or undefined if cannot be calculated
 */
export function calculatePnlPercentage(
  currentBalance: number,
  currentPrice: number,
  pnlData?: {
    avgBuyPrice: number;
    totalSpentUsd: number;
    realizedPnL: number;
    totalBought: number;
    totalSold: number;
  }
): number | undefined {
  if (!pnlData || pnlData.totalSpentUsd === 0) {
    return undefined;
  }

  // Current value of holdings
  const currentValue = currentBalance * currentPrice;
  
  // Unrealized PnL = current value - (average buy price × current balance)
  const unrealizedPnL = currentValue - (pnlData.avgBuyPrice * currentBalance);
  
  // Total PnL = unrealized PnL + realized PnL
  const totalPnL = unrealizedPnL + pnlData.realizedPnL;
  
  // PnL percentage = (total PnL / total spent) × 100
  const pnlPercentage = (totalPnL / pnlData.totalSpentUsd) * 100;
  
  return pnlPercentage;
} 