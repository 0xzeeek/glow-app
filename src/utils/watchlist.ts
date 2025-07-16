import AsyncStorage from '@react-native-async-storage/async-storage';

const WATCHLIST_KEY = 'user_watchlist';

export const watchlistUtils = {
  async getWatchlist(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(WATCHLIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading watchlist:', error);
      return [];
    }
  },

  async addToWatchlist(address: string): Promise<void> {
    try {
      const watchlist = await this.getWatchlist();
      
      // Check if already exists
      if (watchlist.includes(address)) {
        return;
      }
      
      const updatedList = [...watchlist, address];
      await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedList));
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  },

  async removeFromWatchlist(address: string): Promise<void> {
    try {
      const watchlist = await this.getWatchlist();
      const updatedList = watchlist.filter(item => item !== address);
      await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedList));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  },

  async isInWatchlist(address: string): Promise<boolean> {
    try {
      const watchlist = await this.getWatchlist();
      return watchlist.includes(address);
    } catch (error) {
      console.error('Error checking watchlist:', error);
      return false;
    }
  },

  async toggleWatchlist(address: string): Promise<boolean> {
    try {
      const isInList = await this.isInWatchlist(address);
      if (isInList) {
        await this.removeFromWatchlist(address);
        return false;
      } else {
        await this.addToWatchlist(address);
        return true;
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      throw error;
    }
  },

  async clearWatchlist(): Promise<void> {
    try {
      await AsyncStorage.removeItem(WATCHLIST_KEY);
    } catch (error) {
      console.error('Error clearing watchlist:', error);
      throw error;
    }
  },
}; 