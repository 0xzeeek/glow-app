import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { UserProfile } from '../types/solana-trading-backend';

interface UserState {
  // Authentication
  isAuthenticated: boolean;
  email: string | null;
  
  // Wallet
  wallet: string | null;
  
  // Profile
  profile: UserProfile | null;
  
  // Balance
  solBalance: number;
  usdcBalance: number;
  
  // Referral
  referralCode: string | null;
  referredBy: string | null;
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  updateBalances: (sol: number, usdc: number) => void;
  setReferralCode: (code: string) => void;
  reset: () => void;
}

const initialState = {
  isAuthenticated: false,
  email: null,
  wallet: null,
  profile: null,
  solBalance: 0,
  usdcBalance: 0,
  referralCode: null,
  referredBy: null,
};

export const userStore = create<UserState>()(
  subscribeWithSelector((set) => ({
    ...initialState,
    
    setProfile: (profile) => 
      set({ 
        profile,
        referredBy: profile.referredBy || null,
      }),
    
    updateBalances: (sol, usdc) => 
      set({ 
        solBalance: sol, 
        usdcBalance: usdc,
      }),
    
    setReferralCode: (code) => 
      set({ referralCode: code }),
    
    reset: () => set(initialState),
  }))
);

// Selectors
export const selectIsAuthenticated = (state: UserState) => state.isAuthenticated;
export const selectWallet = (state: UserState) => state.wallet;
export const selectProfile = (state: UserState) => state.profile;
export const selectBalances = (state: UserState) => ({
  sol: state.solBalance,
  usdc: state.usdcBalance,
}); 