// Polyfills
import 'react-native-url-polyfill/auto';

import { useEffect, useState } from 'react';
import { Stack, useSegments } from 'expo-router';
import { View, StyleSheet } from 'react-native';
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
  getLiveWebSocketManager,
  getPriceSocket,
} from '../src/services';
import { uiStore } from '../src/stores/uiStore';
import { fonts } from '../assets';
import { AppProviders, useNavigation } from '../src/contexts';
import { colors } from '@/theme/colors';
import { PrivyProvider } from '@privy-io/expo';
import ErrorBoundary from '../src/components/shared/ErrorBoundary';
import BottomNav from '../src/components/navigation/BottomNav';
// import { useCaptureReferralCode } from '../src/hooks';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = createQueryClient();

// Helper to determine if bottom nav should be shown
function shouldShowBottomNav(segments: string[]): boolean {
  const firstSegment = segments[0];
  // Show bottom nav for home, referral, profile, and token screens
  return firstSegment === '(home)' || firstSegment === '(referral)' || firstSegment === '(profile)' || firstSegment === '(token)';
}

// Helper to get active tab
function getActiveTab(segments: string[]): 'home' | 'referral' | 'profile' | null {
  const firstSegment = segments[0];
  if (firstSegment === '(home)') return 'home';
  if (firstSegment === '(referral)') return 'referral';
  if (firstSegment === '(profile)') return 'profile';
  return null;
}

// Separate component for the main app content to use hooks
function AppContent() {
  const segments = useSegments();
  const { homeScrollToTopRef } = useNavigation();
  const showBottomNav = shouldShowBottomNav(segments);
  const activeTab = getActiveTab(segments);

  const handleHomePress = () => {
    // Call the scroll-to-top function if it's registered
    if (homeScrollToTopRef.current) {
      homeScrollToTopRef.current();
    }
  };

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          contentStyle: styles.stackContent,
        }}
      >
        <Stack.Screen
          name="(onboarding)"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: {
              backgroundColor: colors.background.secondary,
            },
          }}
        />
        <Stack.Screen
          name="(home)"
          options={{
            headerShown: false,
            animation: 'none',
          }}
        />
        <Stack.Screen
          name="(referral)"
          options={{ headerShown: false, animation: 'none' }}
        />
        <Stack.Screen 
          name="(token)" 
          options={{ 
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen
          name="(profile)"
          options={{
            headerShown: false,
            animation: 'none',
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
      {showBottomNav && (
        <BottomNav activeTab={activeTab} onHomePress={activeTab === 'home' ? handleHomePress : undefined} />
      )}
    </View>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  // TODO: when switch to eas build, remove this comment
  // Capture referral code from deep links
  // useCaptureReferralCode();

  useEffect(() => {
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

        // Initialize WebSocket managers - they'll auto-connect when needed
        getLiveWebSocketManager({
          url: process.env.EXPO_PUBLIC_LIVE_WS_URL || '',
          heartbeatInterval: 60000, // Ping every 60 seconds
        });

        getPriceSocket(process.env.EXPO_PUBLIC_PRICE_WS_URL || '');

        // Monitor network status for UI state
        NetInfo.addEventListener(state => {
          uiStore.getState().setOnline(state.isConnected ?? false);
        });

        setIsReady(true);
      } catch (e) {
        console.warn(e);
        setIsReady(true);
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID;
  const PRIVY_CLIENT_ID = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID;

  return (
    <PrivyProvider appId={PRIVY_APP_ID || ''} clientId={PRIVY_CLIENT_ID || ''}
    config={{
      embedded: {
          solana: {
              createOnLogin: 'users-without-wallets',
          },
      },
  }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <AppProviders>
              <StatusBar style="light" />
              <AppContent />
            </AppProviders>
          </ErrorBoundary>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </PrivyProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  stackContent: {
    flex: 1,
  },
});
