import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
  useMemo,
} from 'react';
import { usePrivy, useEmbeddedSolanaWallet } from '@privy-io/expo';
import {
  useUserProfile,
  useWebSocketBalanceUpdates,
  useWalletHoldings,
} from '../hooks';
import { getErrorHandler } from '../services/ErrorHandler';
import { WalletHoldings, TokenHolding } from '../types';

interface UserContextType {
  // User profile
  username: string;
  email: string;
  image: string | null;
  memberSince: Date;

  // Wallet Data
  walletHoldings: WalletHoldings | null;
  isLoadingHoldings: boolean;
  holdingsError: Error | null;

  // Wallet Values
  totalUsdValue: number;
  usdcBalance: number;
  tokenHoldings: TokenHolding[];

  // Wallet
  walletAddress: string | null;

  // Actions
  setUsername: (name: string) => void;
  setEmail: (email: string) => void;
  setImage: (image: string | null) => void;
  signOut: () => void;
  refetchHoldings: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  // Privy integration
  const { user, logout: privySignOut } = usePrivy();
  const { wallets } = useEmbeddedSolanaWallet();

  const { data: userProfile } = useUserProfile(wallets?.[0]?.address || null);

  useWebSocketBalanceUpdates(wallets?.[0]?.address || null);

  // User profile state
  const [username, setUsernameState] = useState('');
  const [email, setEmailState] = useState('');
  const [image, setImageState] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState(new Date());

  // Memoize setter functions
  const setUsername = useCallback((name: string) => setUsernameState(name), []);
  const setEmail = useCallback((email: string) => setEmailState(email), []);
  const setImage = useCallback((image: string | null) => setImageState(image), []);

  useEffect(() => {
    if (userProfile) {
      console.log('userProfile', userProfile);
      setUsernameState(userProfile.username);
      setEmailState(userProfile.email);
      setImageState(userProfile.image);
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
      // setWalletAddress(primaryWallet.address);
      setWalletAddress('8EDurUnRAKw5MEDiJtVeYBZS7h7kEVzvYwZpgUeuZAMd');

      // Set user context for error tracking
      const errorHandler = getErrorHandler();
      errorHandler.setUserContext(user?.id || primaryWallet.address, primaryWallet.address);

      // Add breadcrumb for wallet connection
      errorHandler.addBreadcrumb('Wallet connected', 'auth', {
        walletAddress: primaryWallet.address,
        hasUserId: !!user?.id,
      });
    } else {
      // Clear user context when wallet disconnected
      getErrorHandler().clearUserContext();
    }
  }, [wallets, user]);

  // Use TanStack Query for wallet holdings
  const {
    data: walletHoldings,
    isLoading: isLoadingHoldings,
    error: holdingsError,
    refetch: refetchHoldings,
  } = useWalletHoldings(walletAddress);

  useWebSocketBalanceUpdates(walletAddress);

  // Memoize refetch function
  const memoizedRefetchHoldings = useCallback(() => {
    refetchHoldings();
  }, [refetchHoldings]);

  const signOut = useCallback(async () => {
    // Add breadcrumb before clearing data
    getErrorHandler().addBreadcrumb('User signing out', 'auth', { walletAddress });

    // Reset all user data
    setUsernameState('');
    setEmailState('');
    setImageState(null);
    setWalletAddress(null);

    // Clear error handler user context
    getErrorHandler().clearUserContext();

    await privySignOut();
  }, [walletAddress, privySignOut]);

  // Memoize USDC balance calculation
  const usdcBalance = useMemo(() => {
    return walletHoldings?.tokens.find(t => t.symbol === 'USDC')?.balance || 0;
  }, [walletHoldings?.tokens]);

  // Memoize total USD value calculation
  const calculatedTotalUsdValue = useMemo(() => {
    return walletHoldings?.tokens.reduce((total, token) => {
      return total + (token.usdValue || 0);
    }, 0) || 0;
  }, [walletHoldings?.tokens]);

  // Memoize token holdings
  const tokenHoldings = useMemo(() => {
    return walletHoldings?.tokens || [];
  }, [walletHoldings?.tokens]);

  // Memoize the entire context value
  const value: UserContextType = useMemo(() => ({
    // User profile
    username,
    email,
    image,
    memberSince,

    // Wallet
    walletAddress,

    // Wallet Data
    walletHoldings: walletHoldings || null,
    isLoadingHoldings,
    holdingsError: holdingsError as Error | null,

    // Wallet values
    usdcBalance,
    totalUsdValue: calculatedTotalUsdValue,
    tokenHoldings,

    // Actions
    setUsername,
    setEmail,
    setImage,
    signOut,
    refetchHoldings: memoizedRefetchHoldings,
  }), [
    username,
    email,
    image,
    memberSince,
    walletAddress,
    walletHoldings,
    isLoadingHoldings,
    holdingsError,
    usdcBalance,
    calculatedTotalUsdValue,
    tokenHoldings,
    setUsername,
    setEmail,
    setImage,
    signOut,
    memoizedRefetchHoldings,
  ]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
