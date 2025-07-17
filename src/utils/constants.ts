// Solana Token Addresses
export const TOKEN_ADDRESSES = {
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC on Solana mainnet
} as const;

// Token Decimals
export const TOKEN_DECIMALS = {
  USDC: 6, // USDC has 6 decimals on Solana
} as const;

export const API_CONFIG = {
  WS_RECONNECT_INTERVAL: 5000,
  WS_MAX_RECONNECT_ATTEMPTS: 5,
  PRICE_UPDATE_THROTTLE: 100, // ms
};

export const CHART_COLORS = {
  POSITIVE: '#00C853', // Green for gains
  NEGATIVE: '#FF3366', // Red for losses
} as const; 