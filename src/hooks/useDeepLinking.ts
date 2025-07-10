import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useDeepLinking() {
  const router = useRouter();

  useEffect(() => {
    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle deep links when app is already open
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = async (url: string) => {
    console.log('Handling deep link:', url);

    if (!url) return;

    try {
      const urlObj = new URL(url);
      const { pathname, searchParams } = urlObj;

      // Handle authentication success callback
      if (pathname === '//auth-success') {
        const authData = {
          jwt: searchParams.get('jwt'),
          refreshToken: searchParams.get('refreshToken'),
          publicKey: searchParams.get('publicKey') || searchParams.get('walletAddress'),
          email: searchParams.get('email'),
          userId: searchParams.get('userId'),
        };

        const error = searchParams.get('error');

        if (error) {
          console.error('Authentication error from deep link:', error);
          // Handle error appropriately
          return;
        }

        // Store authentication data
        if (authData.jwt) {
          await AsyncStorage.setItem('crossmint_jwt', authData.jwt);
        }
        if (authData.refreshToken) {
          await AsyncStorage.setItem('crossmint_refresh_token', authData.refreshToken);
        }
        if (authData.publicKey) {
          await AsyncStorage.setItem('wallet_address', authData.publicKey);
        }
        if (authData.email) {
          await AsyncStorage.setItem('user_email', authData.email);
        }
        if (authData.userId) {
          await AsyncStorage.setItem('crossmint_user_id', authData.userId);
        }

        // Mark as authenticated
        await AsyncStorage.setItem('hasCompletedOnboarding', 'true');

        // Navigate to home
        router.replace('/(home)');
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  };

  return null;
} 