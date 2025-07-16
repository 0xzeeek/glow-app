import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { usePrivy, useEmbeddedSolanaWallet } from '@privy-io/expo';
import { useUserBalance, useUserProfile, useWebSocketBalanceUpdates } from '../hooks';
import { getErrorHandler } from '../services/ErrorHandler';

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
  username: string;
  email: string;
  image: string | null;
  memberSince: Date;
  setUsername: (name: string) => void;
  setEmail: (email: string) => void;
  setImage: (image: string | null) => void;
  
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

  const { data: userProfile } = useUserProfile(wallets?.[0]?.address || null);

  useWebSocketBalanceUpdates(wallets?.[0]?.address || null);
  
  // User profile state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState(new Date());

  useEffect(() => {
    if (userProfile) {
      console.log('userProfile', userProfile);
      setUsername(userProfile.username);
      setEmail(userProfile.email);
      setImage(userProfile.image);
      setMemberSince(new Date(userProfile.createdAt));
    }
  }, [userProfile]);
  
  // Wallet state
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

    // Extract wallet address from Privy wallets
    useEffect(() => {
      if (wallets && wallets.length > 0) {
        // Get the first Solana wallet
        const primaryWallet = wallets[0];
        setWalletAddress(primaryWallet.address);
        
        // Set user context for error tracking
        const errorHandler = getErrorHandler();
        errorHandler.setUserContext(
          user?.id || primaryWallet.address,
          primaryWallet.address
        );
        
        // Add breadcrumb for wallet connection
        errorHandler.addBreadcrumb(
          'Wallet connected',
          'auth',
          { 
            walletAddress: primaryWallet.address,
            hasUserId: !!user?.id
          }
        );
      } else {
        // Clear user context when wallet disconnected
        getErrorHandler().clearUserContext();
      }
    }, [wallets, user]);
  
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

  // Subscribe to real-time balance updates via WebSocket
  // useWebSocketBalanceUpdates(walletAddress);



  const purchaseToken = useCallback(async (
    tokenId: string,
    tokenName: string,
    tokenImage: string,
    amount: number,
    price: number
  ): Promise<boolean> => {
    try {
      // Add breadcrumb for purchase attempt
      getErrorHandler().addBreadcrumb(
        'Token purchase initiated',
        'trading',
        { tokenId, tokenName, amount, price }
      );
      
      const fee = amount * 0.05; // 5% fee
      const totalCost = amount + fee;
      
      if (totalCost > usdcBalance) {
        const error = new Error(`Insufficient balance: required ${totalCost}, available ${usdcBalance}`);
        getErrorHandler().handleError(
          error,
          'TRADING' as any,
          'MEDIUM' as any,
          { 
            metadata: { 
              tokenId, 
              tokenName, 
              requiredAmount: totalCost, 
              availableBalance: usdcBalance 
            } 
          }
        );
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
      getErrorHandler().handleError(
        error,
        'TRADING' as any,
        'HIGH' as any,
        { 
          metadata: { 
            action: 'purchaseToken',
            tokenId, 
            tokenName, 
            amount, 
            price 
          } 
        }
      );
      return false;
    }
  }, [usdcBalance, refreshBalance]);

  const sellToken = useCallback(async (
    tokenId: string,
    quantity: number,
    price: number
  ): Promise<boolean> => {
    try {
      // Add breadcrumb for sell attempt
      getErrorHandler().addBreadcrumb(
        'Token sell initiated',
        'trading',
        { tokenId, quantity, price }
      );
      
      const holding = portfolio.find(t => t.tokenId === tokenId);
      
      if (!holding || holding.quantity < quantity) {
        const error = new Error(`Insufficient token balance: required ${quantity}, available ${holding?.quantity || 0}`);
        getErrorHandler().handleError(
          error,
          'TRADING' as any,
          'MEDIUM' as any,
          { 
            metadata: { 
              tokenId, 
              requiredQuantity: quantity, 
              availableQuantity: holding?.quantity || 0 
            } 
          }
        );
        console.error('Insufficient token balance');
        return false;
      }
      
      const amount = quantity * price;
      const fee = amount * 0.05; // 5% fee
      // const netAmount = amount - fee;
      
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
      
      // Add breadcrumb for successful sale
      getErrorHandler().addBreadcrumb(
        'Token sale completed',
        'trading',
        { 
          tokenId: transaction.tokenId, 
          tokenName: transaction.tokenName, 
          quantity: transaction.quantity, 
          netAmount: transaction.amount - transaction.fee,
          transactionId: transaction.id 
        }
      );
      
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
    // Add breadcrumb before clearing data
    getErrorHandler().addBreadcrumb(
      'User signing out',
      'auth',
      { walletAddress }
    );
    
    // Reset all user data
    setUsername('');
    setEmail('');
    setImage(null);
    setPortfolio([]);
    setTransactions([]);
    setWalletAddress(null);
    
    // Clear error handler user context
    getErrorHandler().clearUserContext();
    
    // Note: Actual sign out from Privy should be handled at the app level
    console.log('User context cleared');
  }, [walletAddress]);

  const value: UserContextType = {
    // User profile
    username,
    email,
    image,
    memberSince,
    setUsername,
    setEmail,
    setImage,
    
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