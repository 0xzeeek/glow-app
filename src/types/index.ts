// ============================================
// Main Types
// ============================================
export interface User {
  wallet: WalletAddress;
  email: string;
  username: string;
  image?: string;
  referralCode?: string;
  referredBy?: string;
  feesEarned?: number;
  createdAt: number;
  lastUpdated: number;
}

export interface Token {
  address: TokenAddress;
  symbol: string;
  name: string;
  description: string;
  image: string;
  video: string;
  socials: Social[];
  price: number;
  marketCap: number;
  holders: number;
  change24h: number;
  volume24h: number;
  totalSupply: number;
  circulatingSupply: number;
  decimals: number;
  createdAt: UnixTimestamp;
  lastUpdated: UnixTimestamp;
}

export interface Social {
  name: string;
  url: string;
  priority: number;
}

export interface WalletBalance {
  wallet: WalletAddress;
  totalUsdValue: number;
  totalPnLPercentage?: number;
  tokens: TokenHolding[];
  timestamp: number;
}

export interface TopHolder {
  position: number;
  image: string;
  wallet: WalletAddress;
  holdings: number;
  percentage: number;
}

export interface TokenHolding extends Token {
  balance: number;
  value: number;
  pnlPercentage?: number;
  pnlData?: {
    avgBuyPrice: number;
    totalSpentUsd: number;
    realizedPnL: number;
    totalBought: number;
    totalSold: number;
  };
}

// ============================================
// API Types
// ============================================

export interface PaginatedTokensResponse {
  tokens: Token[];
  count: number;
  hasNextPage: boolean;
  nextCursor?: string;
  limit: number;
  order: 'asc' | 'desc';
}

export interface WSConnectParams {
  wallet: WalletAddress;
  signature: string;
  nonce: string;
}

export interface WSMessage {
  action: 'subscribePrice' | 'subscribeBalance' | 'unsubscribePrice' | 'unsubscribeBalance';
  token?: TokenAddress;
  wallet?: WalletAddress;
}

export interface PriceUpdate {
  type: 'PRICE_UPDATE';
  token: TokenAddress;
  price: number;
  timestamp: number;
  slot?: number;
  txSignature?: string;
}

export interface BalanceUpdate {
  type: 'BALANCE_UPDATE';
  wallet: WalletAddress;
  token: TokenAddress;
  amount: number;
  timestamp: number;
}

export interface PricePoint {
  timestamp: number;
  price: number;
  source?: string;
  slot?: number;
  txSignature?: string;
}

export interface GetPricesParams {
  range: '1h' | '1d' | '7d' | '30d' | 'all';
}

export interface TokenPricesResponse {
  token: TokenAddress;
  prices: PricePoint[];
  range: string;
  count: number;
}

// ============================================
// Helper Types
// ============================================

export type WalletAddress = string;
export type TokenAddress = string;
export type UnixTimestamp = number;
