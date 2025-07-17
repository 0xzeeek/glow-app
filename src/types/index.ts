export interface TopMover {
  address: string;
  name: string;
  image: string;
  change24h: number;
}

export interface FeaturedTokenData {
  address: string;
  name: string;
  image: string;
  status: string;
  marketCap: string;
  price: number;
}

export interface CreatorToken {
  address: string;
  creatorName: string;
  avatar: string;
  marketCap: string;
  price: string;
  change24h: number;
  chartData: number[];
}


export interface TokenDetails {
  address: string;
  name: string;
  symbol: string;
  price: string;
  change24h: number;
  image: string;
  backgroundImage: string;
  marketCap: string;
  volume24h: string;
  holders: number;
  circulatingSupply: string;
  createdAt: string;
  description: string;
  socialLinks: {
    platform: string;
    handle: string;
    icon: string;
  }[];
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
  change24h: number;  // 24-hour percentage change
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
  range?: '1h' | '24h' | '7d' | '30d';
  resolution?: '1m' | '5m' | '15m' | '1h' | '1d';
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