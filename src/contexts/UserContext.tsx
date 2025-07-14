import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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
  setUserName: (name: string) => void;
  setUserEmail: (email: string) => void;
  setProfileImage: (image: string | null) => void;
  
  // User balance
  cashBalance: number;
  setCashBalance: (balance: number) => void;
  
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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  // User profile state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>("https://i.pravatar.cc/300?img=25");
  
  const [cashBalance, setCashBalance] = useState(100.81); // Starting balance
  const [portfolio, setPortfolio] = useState<OwnedToken[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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
      
      if (totalCost > cashBalance) {
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
      
      // Update balance
      setCashBalance(prev => prev - totalCost);
      
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
      
      return true;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  }, [cashBalance]);

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
      
      // Update balance
      setCashBalance(prev => prev + netAmount);
      
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
      
      return true;
    } catch (error) {
      console.error('Sale failed:', error);
      return false;
    }
  }, [portfolio]);

  const getTokenHoldings = useCallback((tokenId: string): OwnedToken | undefined => {
    return portfolio.find(t => t.tokenId === tokenId);
  }, [portfolio]);

  const getTotalPortfolioValue = useCallback((): number => {
    return portfolio.reduce((total, token) => {
      return total + (token.currentPrice * token.quantity);
    }, 0);
  }, [portfolio]);

  const getTotalGains = useCallback((): number => {
    return portfolio.reduce((total, token) => {
      const currentValue = token.currentPrice * token.quantity;
      const purchaseValue = token.purchasePrice * token.quantity;
      return total + (currentValue - purchaseValue);
    }, 0);
  }, [portfolio]);

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
    setUserName,
    setUserEmail,
    setProfileImage,
    
    // Balance
    cashBalance,
    setCashBalance,
    
    // Portfolio & transactions
    portfolio,
    transactions,
    purchaseToken,
    sellToken,
    getTokenHoldings,
    getTotalPortfolioValue,
    getTotalGains,
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