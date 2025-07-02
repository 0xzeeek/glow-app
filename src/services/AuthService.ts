// @ts-ignore - Dynamic SDK types not fully available
import { createClient } from '@dynamic-labs/client';
// @ts-ignore - Dynamic SDK types not fully available
import { ReactNativeExtension } from '@dynamic-labs/react-native-extension';
import * as SecureStore from 'expo-secure-store';
import { getApiClient } from './ApiClient';
import { getWebSocketManager } from './WebSocketManager';
import { userStore } from '../stores/userStore';
import { tradingStore } from '../stores/tradingStore';

interface AuthConfig {
  environmentId: string;
  apiBaseUrl: string;
  wsBaseUrl: string;
}

interface WalletInfo {
  address: string;
  chain: string;
  connector: string;
}

export class AuthService {
  private dynamicClient: any; // Dynamic SDK client
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
    
    // Initialize Dynamic SDK client
    this.dynamicClient = createClient({
      environmentId: config.environmentId,
    }).extend(ReactNativeExtension());
  }

  // Initialize authentication service
  public async initialize(): Promise<void> {
    try {
      // Check if user has existing Dynamic session
      const isAuthenticated = await this.dynamicClient.auth.isAuthenticated();
      
      if (isAuthenticated) {
        const wallet = await this.getCurrentWallet();
        if (wallet) {
          // Reconnect to backend
          await this.authenticateWithBackend({
            address: wallet,
            chain: 'solana',
            connector: 'embedded'
          });
          
          // Update user store
          userStore.setState({
            isAuthenticated: true,
            wallet,
          });
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth service:', error);
    }
  }

  // Email OTP authentication flow
  public async sendOTP(email: string): Promise<void> {
    try {
      await this.dynamicClient.auth.email.sendOTP({
        email,
      });
    } catch (error) {
      console.error('Failed to send OTP:', error);
      throw new Error('Failed to send verification code');
    }
  }

  // Verify OTP and complete authentication
  public async verifyOTP(email: string, otp: string): Promise<WalletInfo> {
    try {
      // Verify OTP with Dynamic
      const authResult = await this.dynamicClient.auth.email.verifyOTP({
        email,
        token: otp,
      });

      if (!authResult.isAuthenticated) {
        throw new Error('Authentication failed');
      }

      // Get or create embedded wallet
      const wallet = await this.getOrCreateWallet();
      
      // Authenticate with backend WebSocket using Dynamic wallet
      await this.authenticateWithBackend(wallet);
      
      // Update user store
      userStore.setState({
        isAuthenticated: true,
        wallet: wallet.address,
        email,
      });

      return wallet;
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      throw new Error('Invalid verification code');
    }
  }

  // Get or create embedded wallet
  private async getOrCreateWallet(): Promise<WalletInfo> {
    try {
      // Check if user already has wallets
      const wallets = await this.dynamicClient.wallets.getWallets();
      
      if (wallets.length > 0) {
        // Return first Solana wallet
        const solanaWallet = wallets.find((w: any) => w.chain === 'solana');
        if (solanaWallet) {
          return {
            address: solanaWallet.address,
            chain: solanaWallet.chain,
            connector: solanaWallet.connector,
          };
        }
      }

      // Create new embedded Solana wallet
      const newWallet = await this.dynamicClient.wallets.createEmbeddedWallet({
        chain: 'solana',
      });

      return {
        address: newWallet.address,
        chain: newWallet.chain,
        connector: 'embedded',
      };
    } catch (error) {
      console.error('Failed to get/create wallet:', error);
      throw new Error('Failed to setup wallet');
    }
  }

  // Sign message with Dynamic wallet
  private async signMessage(message: string): Promise<string> {
    try {
      const signer = await this.dynamicClient.wallets.getSigner();
      const signature = await signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw new Error('Failed to sign authentication message');
    }
  }

  // Authenticate with backend using Dynamic wallet
  private async authenticateWithBackend(wallet: WalletInfo): Promise<void> {
    try {
      const apiClient = getApiClient();
      
      // Get nonce from backend
      const { nonce } = await apiClient.getNonce(wallet.address);
      
      // Sign nonce with Dynamic wallet
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
        
        wsManager.once('error', (error) => {
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
      
    } catch (error) {
      console.error('Failed to authenticate with backend:', error);
      throw new Error('Failed to connect to trading backend');
    }
  }

  // Execute transaction using Dynamic wallet
  public async executeTransaction(transaction: any): Promise<string> {
    try {
      const signer = await this.dynamicClient.wallets.getSigner();
      const signature = await signer.signAndSendTransaction(transaction);
      return signature;
    } catch (error) {
      console.error('Failed to execute transaction:', error);
      throw new Error('Transaction failed');
    }
  }

  // Logout
  public async logout(): Promise<void> {
    try {
      // Logout from Dynamic
      await this.dynamicClient.auth.logout();

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

  // Get current wallet signer
  public async getSigner() {
    return this.dynamicClient.wallets.getSigner();
  }

  // Check authentication status
  public async isAuthenticated(): Promise<boolean> {
    try {
      return await this.dynamicClient.auth.isAuthenticated();
    } catch (error) {
      return false;
    }
  }

  // Get current wallet address
  public async getCurrentWallet(): Promise<string | null> {
    try {
      const wallets = await this.dynamicClient.wallets.getWallets();
      const solanaWallet = wallets.find((w: any) => w.chain === 'solana');
      return solanaWallet?.address || null;
    } catch (error) {
      console.error('Failed to get current wallet:', error);
      return null;
    }
  }
  
  // Get Dynamic client (for advanced use cases)
  public getDynamicClient() {
    return this.dynamicClient;
  }
}

// Singleton instance
let authService: AuthService | null = null;

export const initializeAuthService = (config: AuthConfig): AuthService => {
  authService = new AuthService(config);
  return authService;
};

export const getAuthService = (): AuthService => {
  if (!authService) {
    throw new Error('AuthService not initialized. Call initializeAuthService first.');
  }
  return authService;
}; 