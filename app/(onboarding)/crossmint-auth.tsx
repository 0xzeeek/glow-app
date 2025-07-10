import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCrossmintAuthService } from '../../src/services';
import { Ionicons } from '@expo/vector-icons';

export default function CrossmintAuthScreen() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  // Construct the Crossmint authentication URL
  const getCrossmintAuthUrl = () => {
    const apiKey = process.env.EXPO_PUBLIC_CROSSMINT_API_KEY;
    
    // Check if API key exists
    if (!apiKey) {
      console.error('No Crossmint API key found');
      Alert.alert(
        'Configuration Error',
        'Crossmint API key is missing. Please check your configuration.',
        [
          {
            text: 'Continue Demo',
            onPress: async () => {
              await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
              await AsyncStorage.setItem('isDemoMode', 'true');
              router.replace('/(home)');
            }
          }
        ]
      );
      return 'about:blank';
    }
    
    // Determine the environment based on the API key
    const isProduction = apiKey.startsWith('ck_production_');
    const baseUrl = isProduction 
      ? 'https://www.crossmint.com' 
      : 'https://staging.crossmint.com';
    
    // Crossmint signup/signin URL
    // Using the embed URL for better mobile experience
    const authUrl = `${baseUrl}/signin/auth`;
    
    // Build the authentication URL with parameters
    const params = new URLSearchParams({
      apiKey: apiKey,
      chain: 'solana',
      // Redirect URL - this should be your app's custom URL scheme
      callbackUrl: 'glow://auth-success',
      // Additional parameters for wallet creation
      createWallet: 'true',
      walletType: 'custodial-wallet',
    });

    const fullUrl = `${authUrl}?${params.toString()}`;
    console.log('Crossmint Auth URL:', fullUrl);
    return fullUrl;
  };

  // Handle successful authentication
  const handleAuthSuccess = async (authData: any) => {
    try {
      console.log('Authentication successful:', authData);
      
      // Extract authentication data
      const { jwt, refreshToken, publicKey, email, userId } = authData;
      
      // Store authentication data
      if (jwt) {
        await AsyncStorage.setItem('crossmint_jwt', jwt);
      }
      if (refreshToken) {
        await AsyncStorage.setItem('crossmint_refresh_token', refreshToken);
      }
      if (publicKey) {
        await AsyncStorage.setItem('wallet_address', publicKey);
      }
      if (email) {
        await AsyncStorage.setItem('user_email', email);
      }
      if (userId) {
        await AsyncStorage.setItem('crossmint_user_id', userId);
      }
      
      // Mark as authenticated
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      
      // Set up the auth service if needed
      const authService = getCrossmintAuthService();
      // You might need to initialize the auth service with the tokens
      
      // Navigate to home
      router.replace('/(home)');
    } catch (error) {
      console.error('Failed to save authentication data:', error);
      Alert.alert('Error', 'Failed to complete authentication. Please try again.');
    }
  };

  // Handle navigation state changes in the webview
  const handleNavigationStateChange = async (navState: any) => {
    const { url, canGoBack } = navState;
    console.log('WebView navigation:', url);
    setCanGoBack(canGoBack);

    // Check if this is our success callback URL
    if (url.startsWith('glow://auth-success')) {
      try {
        // Parse the callback URL
        const urlObj = new URL(url);
        const params = urlObj.searchParams;
        
        // Extract authentication data from URL parameters
        const authData = {
          jwt: params.get('jwt'),
          refreshToken: params.get('refreshToken'),
          publicKey: params.get('publicKey') || params.get('walletAddress'),
          email: params.get('email'),
          userId: params.get('userId'),
        };
        
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
          console.error('Authentication error:', error, errorDescription);
          Alert.alert(
            'Authentication Failed',
            errorDescription || 'There was an error during authentication.',
            [
              {
                text: 'Try Again',
                onPress: () => {
                  // Reload the webview
                  webViewRef.current?.reload();
                }
              },
              {
                text: 'Continue Demo',
                onPress: async () => {
                  await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
                  await AsyncStorage.setItem('isDemoMode', 'true');
                  router.replace('/(home)');
                }
              }
            ]
          );
          return;
        }

        // Handle successful authentication
        await handleAuthSuccess(authData);
      } catch (error) {
        console.error('Failed to parse callback URL:', error);
        Alert.alert('Error', 'Failed to complete authentication. Please try again.');
      }
    }
  };

  // Handle webview messages (for postMessage communication)
  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Received message from webview:', data);

      // Handle Crossmint postMessage events
      if (data.type === 'crossmint-auth-success') {
        await handleAuthSuccess(data.payload);
      } else if (data.type === 'crossmint-auth-error') {
        Alert.alert('Authentication Error', data.error || 'Authentication failed');
      } else if (data.type === 'crossmint-close') {
        // Handle close button from Crossmint UI
        router.back();
      }
    } catch (error) {
      // Not all messages will be JSON
      console.log('Non-JSON message or parsing error');
    }
  };

  // Inject JavaScript to capture Crossmint events
  const injectedJavaScript = `
    (function() {
      // Listen for postMessage events from Crossmint
      window.addEventListener('message', function(event) {
        // Forward Crossmint messages to React Native
        if (event.data && typeof event.data === 'object') {
          window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
        }
      });

      // Override window.close to send a message instead
      window.close = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'crossmint-close'
        }));
      };

      // Log that injection is complete
      console.log('Crossmint webview injection complete');
      
      true; // Required for injection to work
    })();
  `;

  // Handle back button
  const handleBack = () => {
    if (canGoBack) {
      webViewRef.current?.goBack();
    } else {
      // Show confirmation dialog
      Alert.alert(
        'Cancel Authentication?',
        'Are you sure you want to cancel the authentication process?',
        [
          { text: 'Continue', style: 'cancel' },
          {
            text: 'Cancel',
            style: 'destructive',
            onPress: () => router.back()
          }
        ]
      );
    }
  };

  // Handle errors in the webview
  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    Alert.alert(
      'Loading Error',
      'Failed to load authentication page. Please check your internet connection.',
      [
        { text: 'Retry', onPress: () => webViewRef.current?.reload() },
        {
          text: 'Continue Demo',
          onPress: async () => {
            await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
            await AsyncStorage.setItem('isDemoMode', 'true');
            router.replace('/(home)');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign In with Crossmint</Text>
        <View style={styles.headerSpacer} />
      </View>

      <WebView
        ref={webViewRef}
        source={{ uri: getCrossmintAuthUrl() }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={handleError}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFBE4D" />
          </View>
        )}
        // Allow JavaScript
        javaScriptEnabled={true}
        domStorageEnabled={true}
        // Handle deep links
        originWhitelist={['https://*', 'glow://*']}
        // Allow opening external links
        onShouldStartLoadWithRequest={(request) => {
          // Allow glow:// URLs to be handled by the app
          if (request.url.startsWith('glow://')) {
            handleNavigationStateChange({ url: request.url });
            return false;
          }
          return true;
        }}
        // iOS specific
        allowsInlineMediaPlayback={true}
        allowsBackForwardNavigationGestures={true}
        // Android specific
        mixedContentMode="compatibility"
        // Enable cookies for session management
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        // User agent to identify as mobile app
        userAgent={`Glow/1.0 (${Platform.OS}; Crossmint-WebView)`}
      />
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFBE4D" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40, // Same as back button to center title
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
}); 