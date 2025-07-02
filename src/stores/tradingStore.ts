import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  TokenMetadata, 
  PriceUpdate, 
  BalanceUpdate,
  TokenPnL,
} from '../types/solana-trading-backend';

interface TokenPrice {
  token: string;
  price: number;
  change24h: number;
  change24hPercent: number;
  lastUpdate: number;
}

interface TokenBalance {
  token: string;
  balance: number;
  usdValue: number;
  lastUpdate: number;
}

interface TradeFeedItem {
  id: string;
  type: 'buy' | 'sell';
  token: string;
  amount: number;
  price: number;
  totalUsd: number;
  timestamp: number;
  txSignature?: string;
}

interface TradingState {
  // Token prices
  prices: Map<string, TokenPrice>;
  
  // Token metadata
  tokens: Map<string, TokenMetadata>;
  
  // User balances
  balances: Map<string, TokenBalance>;
  
  // Trade feed
  tradeFeed: TradeFeedItem[];
  
  // Watchlist
  watchlist: string[];
  
  // Active token for detailed view
  activeToken: string | null;
  
  // PnL data
  tokenPnL: Map<string, TokenPnL>;
  
  // Actions
  updatePrice: (update: PriceUpdate) => void;
  updateBalance: (update: BalanceUpdate) => void;
  setTokenMetadata: (token: string, metadata: TokenMetadata) => void;
  addToWatchlist: (token: string) => void;
  removeFromWatchlist: (token: string) => void;
  setActiveToken: (token: string | null) => void;
  addTradeToFeed: (trade: Omit<TradeFeedItem, 'id'>) => void;
  setTokenPnL: (token: string, pnl: TokenPnL) => void;
  reset: () => void;
}

const MAX_TRADE_FEED_ITEMS = 50;

export const tradingStore = create<TradingState>()(
  subscribeWithSelector((set) => ({
    prices: new Map(),
    tokens: new Map(),
    balances: new Map(),
    tradeFeed: [],
    watchlist: [],
    activeToken: null,
    tokenPnL: new Map(),
    
    updatePrice: (update) => 
      set(state => {
        const prices = new Map(state.prices);
        const existingPrice = prices.get(update.token);
        
        // Calculate 24h change if we have historical data
        const change24h = existingPrice 
          ? update.price - existingPrice.price 
          : 0;
        const change24hPercent = existingPrice && existingPrice.price > 0
          ? (change24h / existingPrice.price) * 100
          : 0;
        
        prices.set(update.token, {
          token: update.token,
          price: update.price,
          change24h,
          change24hPercent,
          lastUpdate: update.timestamp,
        });
        
        return { prices };
      }),
    
    updateBalance: (update) =>
      set(state => {
        const balances = new Map(state.balances);
        const price = state.prices.get(update.token)?.price || 0;
        
        balances.set(update.token, {
          token: update.token,
          balance: update.balance,
          usdValue: update.balance * price,
          lastUpdate: update.timestamp,
        });
        
        return { balances };
      }),
    
    setTokenMetadata: (token, metadata) =>
      set(state => {
        const tokens = new Map(state.tokens);
        tokens.set(token, metadata);
        return { tokens };
      }),
    
    addToWatchlist: (token) =>
      set(state => {
        if (state.watchlist.includes(token)) {
          return state;
        }
        return { watchlist: [...state.watchlist, token] };
      }),
    
    removeFromWatchlist: (token) =>
      set(state => ({
        watchlist: state.watchlist.filter(t => t !== token),
      })),
    
    setActiveToken: (activeToken) =>
      set({ activeToken }),
    
    addTradeToFeed: (trade) =>
      set(state => {
        const newTrade = {
          ...trade,
          id: `${trade.timestamp}-${Math.random()}`,
        };
        
        const tradeFeed = [newTrade, ...state.tradeFeed];
        
        // Keep only the most recent trades
        if (tradeFeed.length > MAX_TRADE_FEED_ITEMS) {
          tradeFeed.length = MAX_TRADE_FEED_ITEMS;
        }
        
        return { tradeFeed };
      }),
    
    setTokenPnL: (token, pnl) =>
      set(state => {
        const tokenPnL = new Map(state.tokenPnL);
        tokenPnL.set(token, pnl);
        return { tokenPnL };
      }),
    
    reset: () =>
      set({
        prices: new Map(),
        tokens: new Map(),
        balances: new Map(),
        tradeFeed: [],
        watchlist: [],
        activeToken: null,
        tokenPnL: new Map(),
      }),
  }))
);

// Selectors
export const selectPrice = (token: string) => (state: TradingState) => 
  state.prices.get(token);

export const selectTokenMetadata = (token: string) => (state: TradingState) => 
  state.tokens.get(token);

export const selectBalance = (token: string) => (state: TradingState) => 
  state.balances.get(token);

export const selectWatchlistPrices = (state: TradingState) => 
  state.watchlist
    .map(token => state.prices.get(token))
    .filter(Boolean) as TokenPrice[];

export const selectPortfolioValue = (state: TradingState) => {
  let totalValue = 0;
  state.balances.forEach(balance => {
    totalValue += balance.usdValue;
  });
  return totalValue;
};

export const selectTokenPnL = (token: string) => (state: TradingState) =>
  state.tokenPnL.get(token);

export const selectTotalPnL = (state: TradingState) => {
  let totalInvested = 0;
  let totalCurrent = 0;
  
  state.tokenPnL.forEach(pnl => {
    totalInvested += pnl.invested;
    totalCurrent += pnl.current;
  });
  
  return {
    totalInvested,
    totalCurrent,
    totalProfit: totalCurrent - totalInvested,
    profitPercent: totalInvested > 0 
      ? ((totalCurrent - totalInvested) / totalInvested) * 100 
      : 0,
  };
}; 