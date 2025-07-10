// Polyfills
import 'react-native-url-polyfill/auto';

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import NetInfo from '@react-native-community/netinfo';
import {
  CrossmintProvider,
  CrossmintAuthProvider,
  CrossmintWalletProvider
} from "@crossmint/client-sdk-react-native-ui";

import { 
  createQueryClient,
  initializeApiClient,
  initializeErrorHandler,
  getWebSocketManager,
  getOfflineManager,
} from '../src/services';
import { uiStore } from '../src/stores/uiStore';
import { userStore } from '../src/stores/userStore';
import { fonts } from '../assets';
import { useDeepLinking } from '../src/hooks/useDeepLinking';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = createQueryClient();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  
  // Initialize deep linking
  useDeepLinking();

  useEffect(() => {
    async function prepare() {
      try {

        // Load fonts
        await Font.loadAsync(fonts);

        // Initialize services
        initializeApiClient({
          baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.glow.club',
        });

        initializeErrorHandler({
          sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
          enableInDev: false,
        });

        // Initialize WebSocket manager
        const wsManager = getWebSocketManager({
          url: process.env.EXPO_PUBLIC_WS_URL || 'wss://ws.glow.club',
          useCloudflare: process.env.EXPO_PUBLIC_USE_CLOUDFLARE === 'true',
        });
        
        // Setup WebSocket event listeners
        wsManager.on('connected', () => {
          console.log('WebSocket connected');
          uiStore.getState().setOnline(true);
        });
        
        wsManager.on('disconnected', (reason) => {
          console.log('WebSocket disconnected:', reason);
        });
        
        wsManager.on('error', (error) => {
          console.error('WebSocket error:', error);
        });

        // Initialize offline manager  
        getOfflineManager();

        // Setup network monitoring
        const unsubscribe = NetInfo.addEventListener(state => {
          const isConnected = state.isConnected ?? false;
          uiStore.getState().setOnline(isConnected);
          
          // Reconnect WebSocket when network comes back
          if (isConnected && !wsManager.isConnected()) {
            const authState = userStore.getState();
            if (authState.isAuthenticated && authState.wallet) {
              // Reconnect with existing auth
              // Note: In production, you'd need to refresh the nonce
              console.log('Network restored, reconnecting WebSocket...');
            }
          }
        });

        // Cleanup expired cache items
        const offlineManager = getOfflineManager();
        await offlineManager.clearExpiredItems();

        setIsReady(true);

        return () => {
          unsubscribe();
        };
      } catch (e) {
        console.warn(e);
        setIsReady(true);
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <CrossmintProvider apiKey={process.env.EXPO_PUBLIC_CROSSMINT_API_KEY || ''}>
      <CrossmintAuthProvider>
        <CrossmintWalletProvider
          createOnLogin={{
            chain: "solana",
            signer: { type: "email" }
          }}
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerStyle: {
                    backgroundColor: '#0A0A0A',
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: '600',
                  },
                  contentStyle: {
                    backgroundColor: '#0A0A0A',
                  },
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
                <Stack.Screen 
                  name="(home)" 
                  options={{ 
                    headerShown: false,
                    animation: 'slide_from_left',
                  }} 
                />
                <Stack.Screen name="(token)" options={{ headerShown: false }} />
                <Stack.Screen 
                  name="(profile)" 
                  options={{ 
                    headerShown: false,
                    animation: 'slide_from_right',
                  }} 
                />
                <Stack.Screen name="+not-found" />
              </Stack>
            </QueryClientProvider>
          </GestureHandlerRootView>
        </CrossmintWalletProvider>
      </CrossmintAuthProvider>
    </CrossmintProvider>
  );
}
