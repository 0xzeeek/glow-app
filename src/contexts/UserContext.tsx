import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { usePrivy, useEmbeddedSolanaWallet } from '@privy-io/expo';
import { useUserBalance } from '../hooks';

interface OwnedToken {
  tokenId: string;
  tokenName: string;
  tokenImage: string;
  purchasePrice: number;
  currentPrice: number;
  quantity: number;
  purchaseDate: Date;
  gains: number;
  gainsPercentage: number;
}

interface Transaction {
  id: string;
  tokenId: string;
  tokenName: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  quantity: number;
  fee: number;
  timestamp: Date;
}

interface UserContextType {
  // User profile
  userName: string;
  userEmail: string;
  profileImage: string | null;
  memberSince: Date;
  setUserName: (name: string) => void;
  setUserEmail: (email: string) => void;
  setProfileImage: (image: string | null) => void;
  
  // User balance
  cashBalance: number;
  setCashBalance: (balance: number) => void;
  isLoadingBalance: boolean;
  balanceError: Error | null;
  refreshBalance: () => Promise<void>;
  
  // Wallet
  walletAddress: string | null;
  
  // Portfolio
  portfolio: OwnedToken[];
  
  // Transactions
  transactions: Transaction[];
  
  // Actions
  purchaseToken: (tokenId: string, tokenName: string, tokenImage: string, amount: number, price: number) => Promise<boolean>;
  sellToken: (tokenId: string, quantity: number, price: number) => Promise<boolean>;
  getTokenHoldings: (tokenId: string) => OwnedToken | undefined;
  getTotalPortfolioValue: () => number;
  getTotalGains: () => number;
  signOut: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  // Privy integration
  const { user } = usePrivy();
  const { wallets } = useEmbeddedSolanaWallet();
  
  // User profile state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [memberSince] = useState(new Date());
  
  // Wallet state
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  // Portfolio state
  const [portfolio, setPortfolio] = useState<OwnedToken[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Use TanStack Query for USDC balance
  const { 
    balance: usdcBalance, 
    isLoading: isLoadingBalance, 
    error: balanceError, 
    refreshBalance 
  } = useUserBalance(walletAddress);

  // Extract wallet address from Privy wallets
  useEffect(() => {
    if (wallets && wallets.length > 0) {
      // Get the first Solana wallet
      const primaryWallet = wallets[0];
      setWalletAddress(primaryWallet.address);
    }
  }, [wallets]);

  // Extract user info from Privy user
  useEffect(() => {
    if (user) {
      // Set user email if available
      // The exact structure of the user object may vary based on login method
      // We'll try to extract email from common fields
      let userEmail = '';
      
      // Check for email in common Privy user fields
      if (user && typeof user === 'object') {
        // Handle different possible email field locations
        const possibleEmail = (user as any).email?.address || 
                             (user as any).email || 
                             (user as any).google?.email || 
                             (user as any).apple?.email || 
                             '';
        if (possibleEmail && typeof possibleEmail === 'string') {
          userEmail = possibleEmail;
        }
      }
      
      if (userEmail) {
        setUserEmail(userEmail);
        // Set username from email
        const emailUsername = userEmail.split('@')[0];
        setUserName(emailUsername);
      } else if (walletAddress) {
        // Use shortened wallet address as username
        setUserName(`${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`);
      }
    }
  }, [user, walletAddress]);

  const purchaseToken = useCallback(async (
    tokenId: string,
    tokenName: string,
    tokenImage: string,
    amount: number,
    price: number
  ): Promise<boolean> => {
    try {
      const fee = amount * 0.05; // 5% fee
      const totalCost = amount + fee;
      
      if (totalCost > usdcBalance) {
        console.error('Insufficient balance');
        return false;
      }
      
      const quantity = amount / price;
      
      // Create transaction
      const transaction: Transaction = {
        id: Date.now().toString(),
        tokenId,
        tokenName,
        type: 'buy',
        amount,
        price,
        quantity,
        fee,
        timestamp: new Date(),
      };
      
      // Note: In a real app, you would make an API call here to execute the purchase
      // For now, we'll just update the local state
      
      // Update portfolio
      setPortfolio(prev => {
        const existingToken = prev.find(t => t.tokenId === tokenId);
        
        if (existingToken) {
          // Update existing holding
          const newQuantity = existingToken.quantity + quantity;
          const newAveragePrice = 
            (existingToken.purchasePrice * existingToken.quantity + amount) / newQuantity;
          
          return prev.map(token =>
            token.tokenId === tokenId
              ? {
                  ...token,
                  quantity: newQuantity,
                  purchasePrice: newAveragePrice,
                }
              : token
          );
        } else {
          // Add new holding
          const newToken: OwnedToken = {
            tokenId,
            tokenName,
            tokenImage,
            purchasePrice: price,
            currentPrice: price,
            quantity,
            purchaseDate: new Date(),
            gains: 0,
            gainsPercentage: 0,
          };
          
          return [...prev, newToken];
        }
      });
      
      // Add transaction
      setTransactions(prev => [...prev, transaction]);
      
      // Refresh balance after transaction
      await refreshBalance();
      
      return true;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  }, [usdcBalance, refreshBalance]);

  const sellToken = useCallback(async (
    tokenId: string,
    quantity: number,
    price: number
  ): Promise<boolean> => {
    try {
      const holding = portfolio.find(t => t.tokenId === tokenId);
      
      if (!holding || holding.quantity < quantity) {
        console.error('Insufficient token balance');
        return false;
      }
      
      const amount = quantity * price;
      const fee = amount * 0.05; // 5% fee
      const netAmount = amount - fee;
      
      // Create transaction
      const transaction: Transaction = {
        id: Date.now().toString(),
        tokenId,
        tokenName: holding.tokenName,
        type: 'sell',
        amount,
        price,
        quantity,
        fee,
        timestamp: new Date(),
      };
      
      // Note: In a real app, you would make an API call here to execute the sale
      // For now, we'll just update the local state
      
      // Update portfolio
      setPortfolio(prev => {
        return prev.map(token => {
          if (token.tokenId === tokenId) {
            const newQuantity = token.quantity - quantity;
            if (newQuantity <= 0) {
              return null; // Remove from portfolio
            }
            return { ...token, quantity: newQuantity };
          }
          return token;
        }).filter(Boolean) as OwnedToken[];
      });
      
      // Add transaction
      setTransactions(prev => [...prev, transaction]);
      
      // Refresh balance after transaction
      await refreshBalance();
      
      return true;
    } catch (error) {
      console.error('Sale failed:', error);
      return false;
    }
  }, [portfolio, refreshBalance]);

  const getTokenHoldings = useCallback((tokenId: string): OwnedToken | undefined => {
    return portfolio.find(t => t.tokenId === tokenId);
  }, [portfolio]);

  const getTotalPortfolioValue = useCallback((): number => {
    return portfolio.reduce((total, token) => {
      return total + (token.currentPrice * token.quantity);
    }, usdcBalance);
  }, [portfolio, usdcBalance]);

  const getTotalGains = useCallback((): number => {
    return portfolio.reduce((total, token) => {
      const currentValue = token.currentPrice * token.quantity;
      const purchaseValue = token.purchasePrice * token.quantity;
      return total + (currentValue - purchaseValue);
    }, 0);
  }, [portfolio]);

  const signOut = useCallback(() => {
    // Reset all user data
    setUserName('');
    setUserEmail('');
    setProfileImage(null);
    setPortfolio([]);
    setTransactions([]);
    setWalletAddress(null);
    
    // Note: Actual sign out from Privy should be handled at the app level
    console.log('User context cleared');
  }, []);

  // Update token prices and gains (in a real app, this would come from an API)
  const updateTokenPrices = useCallback(() => {
    setPortfolio(prev => prev.map(token => {
      // Simulate price changes
      const priceChange = (Math.random() - 0.5) * 0.1; // ±5% change
      const newPrice = token.currentPrice * (1 + priceChange);
      const gains = (newPrice - token.purchasePrice) * token.quantity;
      const gainsPercentage = ((newPrice - token.purchasePrice) / token.purchasePrice) * 100;
      
      return {
        ...token,
        currentPrice: newPrice,
        gains,
        gainsPercentage,
      };
    }));
  }, []);

  const value: UserContextType = {
    // User profile
    userName,
    userEmail,
    profileImage,
    memberSince,
    setUserName,
    setUserEmail,
    setProfileImage,
    
    // Balance
    cashBalance: usdcBalance,
    setCashBalance: () => {
      // This is now managed by TanStack Query
      console.warn('setCashBalance is deprecated. Balance is managed by TanStack Query.');
    },
    isLoadingBalance,
    balanceError,
    refreshBalance,
    
    // Wallet
    walletAddress,
    
    // Portfolio & transactions
    portfolio,
    transactions,
    purchaseToken,
    sellToken,
    getTokenHoldings,
    getTotalPortfolioValue,
    getTotalGains,
    signOut,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 