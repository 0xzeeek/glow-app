export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  description: string;
  price: number;
  marketCap: number;
  totalSupply: number;
  image: string;
  video: string;
  youtube?: string;
  tiktok?: string;
  instagram?: string;
  x?: string;
  kick?: string;
  website?: string;
  phase: 'bonding' | 'amm';
  ammPool?: string;
  createdAt: number;
  transitionedAt?: number;
  lastUpdated?: number;
}

export interface PaginatedTokensResponse {
  tokens: Token[];
  count: number;
  hasNextPage: boolean;
  nextCursor?: string;
  limit: number;
  order: 'asc' | 'desc';
}

export interface WSConnectParams {
  wallet: string;
  signature: string;
  nonce: string;
}

export interface WSMessage {
  action: 'subscribePrice' | 'subscribeBalance' | 'unsubscribePrice' | 'unsubscribeBalance';
  token?: string;
  wallet?: string;
}

export interface PriceUpdate {
  type: 'PRICE_UPDATE';
  token: string;
  price: number;
  timestamp: number;
  slot?: number;
  txSignature?: string;
}

export interface BalanceUpdate {
  type: 'BALANCE_UPDATE';
  wallet: string;
  token: string;
  amount: number;
  timestamp: number;
}

export interface TokenMetadata {
  token: string;
  symbol: string;
  name: string;
  decimals: number;
  imageUrl?: string;
  phase: 'bonding' | 'amm';
  ammPool?: string;
  createdAt?: number;
  transitionedAt?: number;
  description?: string;
}

export interface PricePoint {
  timestamp: number;
  price: number;
  source?: string;
  slot?: number;
  txSignature?: string;
}

export interface UserProfile {
  wallet: string;
  username: string;
  email: string;
  image: string;
  createdAt: number;
}

export interface GetPricesParams {
  range: '1h' | '1d' | '7d' | '30d' | 'all';
}

export interface UpdateTokenMetadataParams {
  symbol?: string;
  name?: string;
  imageUrl?: string;
  description?: string;
}

export interface LatestPriceResponse {
  token: string;
  price: number;
  timestamp: number;
  source: string;
}

export interface TokenPricesResponse {
  token: string;
  prices: PricePoint[];
  range: string;
  count: number;
}

export type TokenAddress = string;
export type WalletAddress = string;
export type UnixTimestamp = number;
export type TokenAmount = number;

export interface TokenHolding {
  address: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  usdValue: number;
  price: number;
  totalSupply?: number;
  marketCap?: number;
  phase?: string;
  image: string;
  ammPool?: string;
  createdAt: number;
  transitionedAt?: number;
  description: string;
  pnlPercentage?: number;
  pnlData?: {
    avgBuyPrice: number;
    totalSpentUsd: number;
    realizedPnL: number;
    totalBought: number;
    totalSold: number;
  };
}

export interface WalletBalance {
  wallet: string;
  totalUsdValue: number;
  totalPnLPercentage?: number;
  tokens: TokenHolding[];
  timestamp: number;
} 

export interface TopHolder {
  position: number;
  image: string;
  wallet: string;
  holdings: number;
  percentage: number;
}