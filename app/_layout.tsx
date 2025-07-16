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
  createQueryClient,
  initializeApiClient,
  initializeErrorHandler,
  getWebSocketManager,
} from '../src/services';
import { uiStore } from '../src/stores/uiStore';
import { fonts } from '../assets';
import { AppProviders } from '../src/contexts';
import { colors } from '@/theme/colors';
import { PrivyProvider } from '@privy-io/expo';
import ErrorBoundary from '../src/components/shared/ErrorBoundary';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = createQueryClient();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync(fonts);

        // Initialize services
        initializeApiClient({
          baseURL: process.env.EXPO_PUBLIC_API_URL || '',
        });

        initializeErrorHandler({
          sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
          enableInDev: false,
        });

        // Initialize WebSocket manager (but don't connect yet)
        // Connection will be established during authentication
        getWebSocketManager({
          url: process.env.EXPO_PUBLIC_WS_URL || '',
          useCloudflare: process.env.EXPO_PUBLIC_USE_CLOUDFLARE === 'false',
        });

        // Setup network monitoring
        unsubscribe = NetInfo.addEventListener(state => {
          const isConnected = state.isConnected ?? false;
          uiStore.getState().setOnline(isConnected);
        });

        setIsReady(true);
      } catch (e) {
        console.warn(e);
        setIsReady(true);
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();

    return () => {
      unsubscribe?.();
    };
  }, []);

  if (!isReady) {
    return null;
  }

  const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID;
  const PRIVY_CLIENT_ID = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID;

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID || ''}
      clientId={PRIVY_CLIENT_ID || ''}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <AppProviders>
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerStyle: {
                    backgroundColor: colors.background.primary,
                  },
                  contentStyle: {
                    backgroundColor: colors.background.primary,
                  },
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="(home)"
                  options={{
                    headerShown: false,
                    animation: 'slide_from_left',
                  }}
                />
                <Stack.Screen
                  name="(referral)"
                  options={{ headerShown: false, animation: 'slide_from_bottom' }}
                />
                <Stack.Screen name="(token)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="(profile)"
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                  }}
                />
                <Stack.Screen
                  name="(settings)"
                  options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                  }}
                />
                <Stack.Screen name="+not-found" />
              </Stack>
            </AppProviders>
          </ErrorBoundary>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </PrivyProvider>
  );
}
