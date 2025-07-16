import { useState, useEffect, useCallback } from 'react';
import { watchlistUtils } from '../utils/watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load watchlist on mount
  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      setIsLoading(true);
      const data = await watchlistUtils.getWatchlist();
      setWatchlist(data);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWatchlist = useCallback(async (address: string) => {
    try {
      await watchlistUtils.addToWatchlist(address);
      await loadWatchlist(); // Reload to ensure state is in sync
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  }, []);

  const removeFromWatchlist = useCallback(async (address: string) => {
    try {
      await watchlistUtils.removeFromWatchlist(address);
      await loadWatchlist(); // Reload to ensure state is in sync
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  }, []);

  const toggleWatchlist = useCallback(async (address: string) => {
    try {
      await watchlistUtils.toggleWatchlist(address);
      await loadWatchlist(); // Reload to ensure state is in sync
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      throw error;
    }
  }, []);

  const isInWatchlist = useCallback((address: string) => {
    return watchlist.includes(address);
  }, [watchlist]);

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    isInWatchlist,
    refresh: loadWatchlist,
  };
} 