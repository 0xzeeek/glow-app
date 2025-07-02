import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  TokenMetadata, 
  PricePoint, 
  UserProfile,
  TokenPnL,
} from '../types/solana-trading-backend';

interface CacheConfig {
  maxAge?: number; // Max age in milliseconds
  maxItems?: number; // Max items per cache type
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PriceCache {
  [tokenAddress: string]: CacheItem<PricePoint[]>;
}

interface TokenCache {
  [tokenAddress: string]: CacheItem<TokenMetadata>;
}

interface UserCache {
  profile?: CacheItem<UserProfile>;
  pnl?: CacheItem<TokenPnL[]>;
}

export class OfflineManager {
  private config: Required<CacheConfig>;
  private readonly CACHE_KEYS = {
    PRICES: '@glow/prices',
    TOKENS: '@glow/tokens',
    USER: '@glow/user',
    SETTINGS: '@glow/settings',
  };

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxAge: config.maxAge || 1000 * 60 * 5, // 5 minutes default
      maxItems: config.maxItems || 100,
    };
  }

  // Price data caching
  public async cachePrices(
    tokenAddress: string, 
    prices: PricePoint[]
  ): Promise<void> {
    try {
      const cache = await this.getPriceCache();
      const now = Date.now();
      
      cache[tokenAddress] = {
        data: prices,
        timestamp: now,
        expiresAt: now + this.config.maxAge,
      };

      // Cleanup old entries if exceeding max items
      await this.cleanupCache(cache, this.config.maxItems);
      
      await AsyncStorage.setItem(
        this.CACHE_KEYS.PRICES,
        JSON.stringify(cache)
      );
    } catch (error) {
      console.error('Failed to cache prices:', error);
    }
  }

  public async getCachedPrices(
    tokenAddress: string
  ): Promise<PricePoint[] | null> {
    try {
      const cache = await this.getPriceCache();
      const item = cache[tokenAddress];
      
      if (item && item.expiresAt > Date.now()) {
        return item.data;
      }
      
      // Remove expired item
      if (item) {
        delete cache[tokenAddress];
        await AsyncStorage.setItem(
          this.CACHE_KEYS.PRICES,
          JSON.stringify(cache)
        );
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get cached prices:', error);
      return null;
    }
  }

  // Token metadata caching
  public async cacheTokenMetadata(
    tokenAddress: string,
    metadata: TokenMetadata
  ): Promise<void> {
    try {
      const cache = await this.getTokenCache();
      const now = Date.now();
      
      cache[tokenAddress] = {
        data: metadata,
        timestamp: now,
        expiresAt: now + this.config.maxAge * 12, // 1 hour for metadata
      };

      await this.cleanupCache(cache, this.config.maxItems);
      
      await AsyncStorage.setItem(
        this.CACHE_KEYS.TOKENS,
        JSON.stringify(cache)
      );
    } catch (error) {
      console.error('Failed to cache token metadata:', error);
    }
  }

  public async getCachedTokenMetadata(
    tokenAddress: string
  ): Promise<TokenMetadata | null> {
    try {
      const cache = await this.getTokenCache();
      const item = cache[tokenAddress];
      
      if (item && item.expiresAt > Date.now()) {
        return item.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get cached token metadata:', error);
      return null;
    }
  }

  // User data caching
  public async cacheUserProfile(profile: UserProfile): Promise<void> {
    try {
      const cache = await this.getUserCache();
      const now = Date.now();
      
      cache.profile = {
        data: profile,
        timestamp: now,
        expiresAt: now + this.config.maxAge * 4, // 20 minutes
      };
      
      await AsyncStorage.setItem(
        this.CACHE_KEYS.USER,
        JSON.stringify(cache)
      );
    } catch (error) {
      console.error('Failed to cache user profile:', error);
    }
  }

  public async getCachedUserProfile(): Promise<UserProfile | null> {
    try {
      const cache = await this.getUserCache();
      
      if (cache.profile && cache.profile.expiresAt > Date.now()) {
        return cache.profile.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get cached user profile:', error);
      return null;
    }
  }

  public async cacheUserPnL(pnl: TokenPnL[]): Promise<void> {
    try {
      const cache = await this.getUserCache();
      const now = Date.now();
      
      cache.pnl = {
        data: pnl,
        timestamp: now,
        expiresAt: now + this.config.maxAge * 2, // 10 minutes
      };
      
      await AsyncStorage.setItem(
        this.CACHE_KEYS.USER,
        JSON.stringify(cache)
      );
    } catch (error) {
      console.error('Failed to cache user PnL:', error);
    }
  }

  public async getCachedUserPnL(): Promise<TokenPnL[] | null> {
    try {
      const cache = await this.getUserCache();
      
      if (cache.pnl && cache.pnl.expiresAt > Date.now()) {
        return cache.pnl.data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get cached user PnL:', error);
      return null;
    }
  }

  // Settings storage
  public async saveSetting(key: string, value: any): Promise<void> {
    try {
      const settings = await this.getSettings();
      settings[key] = value;
      
      await AsyncStorage.setItem(
        this.CACHE_KEYS.SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  }

  public async getSetting<T = any>(key: string): Promise<T | null> {
    try {
      const settings = await this.getSettings();
      return settings[key] || null;
    } catch (error) {
      console.error('Failed to get setting:', error);
      return null;
    }
  }

  // Clear all caches
  public async clearAllCaches(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.CACHE_KEYS.PRICES),
        AsyncStorage.removeItem(this.CACHE_KEYS.TOKENS),
        AsyncStorage.removeItem(this.CACHE_KEYS.USER),
      ]);
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }

  // Clear expired items
  public async clearExpiredItems(): Promise<void> {
    try {
      const now = Date.now();
      
      // Clear expired price cache
      const priceCache = await this.getPriceCache();
      let pricesChanged = false;
      
      Object.keys(priceCache).forEach(key => {
        if (priceCache[key].expiresAt <= now) {
          delete priceCache[key];
          pricesChanged = true;
        }
      });
      
      if (pricesChanged) {
        await AsyncStorage.setItem(
          this.CACHE_KEYS.PRICES,
          JSON.stringify(priceCache)
        );
      }
      
      // Clear expired token cache
      const tokenCache = await this.getTokenCache();
      let tokensChanged = false;
      
      Object.keys(tokenCache).forEach(key => {
        if (tokenCache[key].expiresAt <= now) {
          delete tokenCache[key];
          tokensChanged = true;
        }
      });
      
      if (tokensChanged) {
        await AsyncStorage.setItem(
          this.CACHE_KEYS.TOKENS,
          JSON.stringify(tokenCache)
        );
      }
    } catch (error) {
      console.error('Failed to clear expired items:', error);
    }
  }

  // Private helper methods
  private async getPriceCache(): Promise<PriceCache> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEYS.PRICES);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      return {};
    }
  }

  private async getTokenCache(): Promise<TokenCache> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEYS.TOKENS);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      return {};
    }
  }

  private async getUserCache(): Promise<UserCache> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEYS.USER);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      return {};
    }
  }

  private async getSettings(): Promise<Record<string, any>> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEYS.SETTINGS);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      return {};
    }
  }

  private async cleanupCache<T>(
    cache: Record<string, T>,
    maxItems: number
  ): Promise<void> {
    const keys = Object.keys(cache);
    
    if (keys.length <= maxItems) return;
    
    // Sort by timestamp and remove oldest
    const sorted = keys.sort((a, b) => {
      const itemA = cache[a] as any;
      const itemB = cache[b] as any;
      return itemA.timestamp - itemB.timestamp;
    });
    
    const toRemove = sorted.slice(0, keys.length - maxItems);
    toRemove.forEach(key => delete cache[key]);
  }

  // Get cache statistics
  public async getCacheStats(): Promise<{
    prices: number;
    tokens: number;
    totalSize: number;
  }> {
    try {
      const [priceCache, tokenCache] = await Promise.all([
        this.getPriceCache(),
        this.getTokenCache(),
      ]);
      
      const pricesSize = JSON.stringify(priceCache).length;
      const tokensSize = JSON.stringify(tokenCache).length;
      
      return {
        prices: Object.keys(priceCache).length,
        tokens: Object.keys(tokenCache).length,
        totalSize: pricesSize + tokensSize,
      };
    } catch (error) {
      return { prices: 0, tokens: 0, totalSize: 0 };
    }
  }
}

// Singleton instance
let offlineManager: OfflineManager | null = null;

export const getOfflineManager = (config?: CacheConfig): OfflineManager => {
  if (!offlineManager) {
    offlineManager = new OfflineManager(config);
  }
  return offlineManager;
}; 