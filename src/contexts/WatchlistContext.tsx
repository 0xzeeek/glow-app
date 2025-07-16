import React, { createContext, useContext, ReactNode } from 'react';
import { useWatchlist } from '../hooks/useWatchlist';

interface WatchlistContextType {
  watchlist: string[];
  isLoading: boolean;
  addToWatchlist: (address: string) => Promise<void>;
  removeFromWatchlist: (address: string) => Promise<void>;
  toggleWatchlist: (address: string) => Promise<void>;
  isInWatchlist: (address: string) => boolean;
  refresh: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const watchlistHook = useWatchlist();

  return (
    <WatchlistContext.Provider value={watchlistHook}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlistContext() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlistContext must be used within a WatchlistProvider');
  }
  return context;
} 