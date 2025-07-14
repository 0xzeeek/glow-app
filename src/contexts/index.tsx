import React, { ReactNode } from 'react';
import { UserProvider } from './UserContext';
import { TokenDataProvider } from './TokenDataContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <TokenDataProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </TokenDataProvider>
  );
}

// Re-export hooks for convenience
export { useUser } from './UserContext';
export { useTokenData } from './TokenDataContext'; 