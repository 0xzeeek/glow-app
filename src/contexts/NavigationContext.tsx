import React, { createContext, useContext, useRef } from 'react';

interface NavigationContextType {
  homeScrollToTopRef: React.MutableRefObject<(() => void) | null>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const homeScrollToTopRef = useRef<(() => void) | null>(null);

  return (
    <NavigationContext.Provider value={{ homeScrollToTopRef }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
} 