import React, { ReactNode } from 'react';
import { UserProvider } from './UserContext';
import { TokenDataProvider } from './TokenDataContext';
import { WatchlistProvider } from './WatchlistContext';
import { NavigationProvider } from './NavigationContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <NavigationProvider>
      <TokenDataProvider>
        <UserProvider>
          <WatchlistProvider>
            {children}
          </WatchlistProvider>
        </UserProvider>
      </TokenDataProvider>
    </NavigationProvider>
  );
}

// Re-export hooks for convenience
export { UserProvider, useUser } from './UserContext';
export { TokenDataProvider, useTokenData } from './TokenDataContext';
export { WatchlistProvider, useWatchlistContext } from './WatchlistContext';
export { NavigationProvider, useNavigation } from './NavigationContext';