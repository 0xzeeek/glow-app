import { getApiClient } from './ApiClient';
import { getWebSocketManager } from './WebSocketManager';
import { userStore } from '../stores/userStore';
import { tradingStore } from '../stores/tradingStore';
import * as SecureStore from 'expo-secure-store';

interface WalletInfo {
  address: string;
  chain: string;
}

export class CrossmintAuthService {
  private crossmintAuth: any = null;
  private crossmintWallet: any = null;

  // Set Crossmint hooks after providers are initialized
  public setCrossmintHooks(auth: any, wallet: any) {
    this.crossmintAuth = auth;
    this.crossmintWallet = wallet;
  }

  // Check if user is authenticated
  public async isAuthenticated(): Promise<boolean> {
    if (!this.crossmintAuth) return false;
    return this.crossmintAuth.jwt !== null;
  }

  // Get current wallet
  public async getCurrentWallet(): Promise<WalletInfo | null> {
    if (!this.crossmintWallet || !this.crossmintWallet.wallet) return null;
    
    return {
      address: this.crossmintWallet.wallet.publicKey,
      chain: 'solana',
    };
  }

  // Authenticate with backend using Crossmint wallet
  public async authenticateWithBackend(): Promise<void> {
    try {
      const wallet = await this.getCurrentWallet();
      if (!wallet) {
        throw new Error('No wallet available');
      }

      const apiClient = getApiClient();

      // Get nonce from backend
      const { nonce } = await apiClient.getNonce(wallet.address);

      // Sign nonce with Crossmint wallet
      const signature = await this.signMessage(nonce);

      // Connect WebSocket with auth params
      const wsManager = getWebSocketManager();
      wsManager.connect({
        wallet: wallet.address,
        signature,
        nonce,
      });

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 10000);

        wsManager.once('connected', () => {
          clearTimeout(timeout);
          resolve();
        });

        wsManager.once('error', (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      // Subscribe to user's balance updates
      wsManager.subscribeToBalance(wallet.address);

      // Subscribe to watchlist prices
      const { watchlist } = tradingStore.getState();
      watchlist.forEach((token: string) => {
        wsManager.subscribeToPrice(token);
      });

      // Store wallet address for reconnection
      await SecureStore.setItemAsync('last_wallet', wallet.address);

      // Update user store
      userStore.setState({
        isAuthenticated: true,
        wallet: wallet.address,
        email: this.crossmintAuth.user?.email || null,
      });
    } catch (error) {
      console.error('Failed to authenticate with backend:', error);
      throw new Error('Failed to connect to trading backend');
    }
  }

  // Sign message with Crossmint wallet
  private async signMessage(message: string): Promise<string> {
    if (!this.crossmintWallet || !this.crossmintWallet.wallet) {
      throw new Error('Wallet not available');
    }

    try {
      // Crossmint's signMessage expects a Uint8Array
      const encoder = new TextEncoder();
      const messageBytes = encoder.encode(message);
      
      const signature = await this.crossmintWallet.wallet.signMessage(messageBytes);
      
      // Convert signature to base64 string
      return btoa(String.fromCharCode(...signature));
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw new Error('Failed to sign authentication message');
    }
  }

  // Execute transaction using Crossmint wallet
  public async executeTransaction(transaction: any): Promise<string> {
    if (!this.crossmintWallet || !this.crossmintWallet.wallet) {
      throw new Error('Wallet not available');
    }

    try {
      const signature = await this.crossmintWallet.wallet.signAndSendTransaction(transaction);
      return signature;
    } catch (error) {
      console.error('Failed to execute transaction:', error);
      throw new Error('Transaction failed');
    }
  }

  // Logout
  public async logout(): Promise<void> {
    try {
      // Logout from Crossmint
      if (this.crossmintAuth && this.crossmintAuth.logout) {
        await this.crossmintAuth.logout();
      }

      // Clear stored wallet
      await SecureStore.deleteItemAsync('last_wallet');

      // Disconnect WebSocket
      const wsManager = getWebSocketManager();
      wsManager.disconnect();

      // Clear user store
      userStore.setState({
        isAuthenticated: false,
        wallet: null,
        email: null,
        profile: null,
      });

      // Clear trading data
      tradingStore.getState().reset();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }
}

// Singleton instance
let authService: CrossmintAuthService | null = null;

export const getCrossmintAuthService = (): CrossmintAuthService => {
  if (!authService) {
    authService = new CrossmintAuthService();
  }
  return authService;
}; 