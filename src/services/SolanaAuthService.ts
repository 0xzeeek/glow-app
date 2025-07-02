/**
 * Solana Authentication Helper Service
 * 
 * This service handles the authentication flow with the Solana Trading Backend.
 * It works in conjunction with Dynamic SDK which manages the actual wallet.
 * 
 * Flow:
 * 1. Dynamic SDK handles phone OTP and creates embedded wallet
 * 2. This service gets nonce from backend
 * 3. Dynamic SDK signs the nonce
 * 4. This service establishes authenticated WebSocket connection
 */

import bs58 from 'bs58';
import { getApiClient } from './ApiClient';
import { getWebSocketManager } from './WebSocketManager';
import { userStore } from '../stores/userStore';
import { tradingStore } from '../stores/tradingStore';

interface SolanaWallet {
  publicKey: { toString: () => string };
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}

export class SolanaAuthService {
  static async getNonce(walletAddress: string): Promise<string> {
    const apiClient = getApiClient();
    const response = await apiClient.getNonce(walletAddress);
    return response.nonce;
  }

  static async authenticateWithWallet(wallet: SolanaWallet): Promise<void> {
    try {
      const walletAddress = wallet.publicKey.toString();
      
      // 1. Get nonce from backend
      const nonce = await this.getNonce(walletAddress);
      
      // 2. Sign the nonce
      const message = new TextEncoder().encode(nonce);
      const signature = await wallet.signMessage(message);
      const signatureBase58 = bs58.encode(signature);
      
      // 3. Connect WebSocket with auth params
      const wsManager = getWebSocketManager();
      wsManager.connect({
        wallet: walletAddress,
        signature: signatureBase58,
        nonce: nonce,
      });
      
      // 4. Update user store
      userStore.setState({
        isAuthenticated: true,
        wallet: walletAddress,
      });
      
      // 5. Subscribe to user's balance updates
      wsManager.subscribeToBalance(walletAddress);
      
      // 6. Subscribe to watchlist prices
      const watchlist = tradingStore.getState().watchlist;
      watchlist.forEach(token => {
        wsManager.subscribeToPrice(token);
      });
      
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Failed to authenticate with wallet');
    }
  }
  
  static async logout(): Promise<void> {
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
    tradingStore.setState({
      prices: new Map(),
      balances: new Map(),
      tradeFeed: [],
    });
  }
}

// For Dynamic SDK integration - this bridges Dynamic wallet to Solana auth
export async function authenticateWithDynamicWallet(dynamicClient: any): Promise<void> {
  try {
    // Get the wallet from Dynamic
    const wallets = await dynamicClient.wallets.getWallets();
    const solanaWallet = wallets.find((w: any) => w.chain === 'solana');
    
    if (!solanaWallet) {
      throw new Error('No Solana wallet found');
    }
    
    // Create a wallet adapter that matches our interface
    const walletAdapter: SolanaWallet = {
      publicKey: { toString: () => solanaWallet.address },
      signMessage: async (message: Uint8Array) => {
        const signer = await dynamicClient.wallets.getSigner();
        const messageStr = new TextDecoder().decode(message);
        const signature = await signer.signMessage(messageStr);
        // Convert the signature to Uint8Array if needed
        return bs58.decode(signature);
      }
    };
    
    // Authenticate with the backend
    await SolanaAuthService.authenticateWithWallet(walletAdapter);
  } catch (error) {
    console.error('Failed to authenticate with Dynamic wallet:', error);
    throw error;
  }
} 