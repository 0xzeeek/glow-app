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

export const formatPrice = (price: number): string => {
  return price.toFixed(4);
};

export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1000000) {
    return `$${(marketCap / 1000000).toFixed(0)}M`;
  } else if (marketCap >= 1000) {
    return `$${(marketCap / 1000).toFixed(0)}K`;
  }
  return `$${marketCap.toFixed(0)}`;
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

interface ChartPoint {
  timestamp: number;
  price: number;
}

export const interpolateChartData = (data: ChartPoint[], targetPoints: number = 200): ChartPoint[] => {
  if (!data || data.length === 0) return [];
  if (data.length === 1) {
    return Array(targetPoints).fill(data[0]);
  }
  
  // Sort data by timestamp
  const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
  
  // First, create initial points through linear interpolation or sampling
  let initialPoints: ChartPoint[] = [];
  
  if (sortedData.length >= targetPoints) {
    // If we have more data than needed, sample evenly
    const step = (sortedData.length - 1) / (targetPoints - 1);
    for (let i = 0; i < targetPoints; i++) {
      const index = Math.min(Math.floor(i * step), sortedData.length - 1);
      initialPoints.push(sortedData[index]);
    }
  } else {
    // Linear interpolation to get more points
    const timeRange = sortedData[sortedData.length - 1].timestamp - sortedData[0].timestamp;
    const timeStep = timeRange / (targetPoints - 1);
    
    for (let i = 0; i < targetPoints; i++) {
      const targetTime = sortedData[0].timestamp + (i * timeStep);
      
      // Find the two points this time falls between
      let j = 0;
      while (j < sortedData.length - 1 && sortedData[j + 1].timestamp < targetTime) {
        j++;
      }
      
      if (j === sortedData.length - 1) {
        initialPoints.push(sortedData[j]);
      } else {
        const t1 = sortedData[j].timestamp;
        const t2 = sortedData[j + 1].timestamp;
        const p1 = sortedData[j].price;
        const p2 = sortedData[j + 1].price;
        
        const ratio = (targetTime - t1) / (t2 - t1);
        const interpolatedPrice = p1 + (p2 - p1) * ratio;
        
        initialPoints.push({
          timestamp: targetTime,
          price: interpolatedPrice
        });
      }
    }
  }
  
  // Apply smoothing using a simple moving average with gaussian weights
  const smoothedPoints: ChartPoint[] = [];
  const windowSize = Math.min(5, Math.floor(initialPoints.length / 10)); // Adaptive window size
  
  for (let i = 0; i < initialPoints.length; i++) {
    let weightedSum = 0;
    let weightSum = 0;
    
    // Apply gaussian-like weights
    for (let j = -windowSize; j <= windowSize; j++) {
      const index = i + j;
      if (index >= 0 && index < initialPoints.length) {
        // Gaussian-like weight (higher for closer points)
        const weight = Math.exp(-(j * j) / (windowSize * windowSize * 0.5));
        weightedSum += initialPoints[index].price * weight;
        weightSum += weight;
      }
    }
    
    smoothedPoints.push({
      timestamp: initialPoints[i].timestamp,
      price: weightedSum / weightSum
    });
  }
  
  return smoothedPoints;
}; 