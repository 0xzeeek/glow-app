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
  if (price === 0) return '0.0000';
  
  // For very small prices (less than 0.0001), use more decimal places
  if (price < 0.0001) {
    return price.toFixed(8);
  }
  
  // For small prices (less than 1), use 4 decimal places
  if (price < 1) {
    return price.toFixed(4);
  }
  
  // For prices between 1 and 1000, use 2 decimal places
  if (price < 1000) {
    return price.toFixed(2);
  }
  
  // For large prices, use comma formatting with no decimals
  return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
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

export const formatPercentage = (percentage: number, decimals: number = 2): string => {
  if (percentage >= 1_000_000) {
    return (percentage / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (percentage >= 1_000) {
    return (percentage / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return percentage.toFixed(decimals);
};

export const calculatePriceChange = (priceData: { price: number }[]): number => {
  if (!priceData || priceData.length === 0) return 0;
  
  const firstPrice = priceData[0].price;
  const lastPrice = priceData[priceData.length - 1].price;
  
  if (firstPrice === 0) return 0;
  
  // Return with reasonable precision
  const change = ((lastPrice - firstPrice) / firstPrice) * 100;
  return Math.round(change * 100) / 100; // Round to 2 decimal places
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