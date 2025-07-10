import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useCrossmintAuth } from '@crossmint/client-sdk-react-native-ui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../src/theme';

export default function EmailScreen() {
  const router = useRouter();
  const { crossmintAuth } = useCrossmintAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await AsyncStorage.setItem('onboarding_email', email);
      if (crossmintAuth) {  
        const result = await crossmintAuth.sendEmailOtp(email);
        // store email id and email token in async storage
        await AsyncStorage.setItem('emailId', result.emailId);
        router.push('/(onboarding)/verify');
      }
    } catch (error: any) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseWebview = () => {
    // Navigate to the webview authentication as a fallback
    router.push('/(onboarding)/crossmint-auth');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Email Icon */}
        <View style={styles.iconContainer}>
          <Image
            source={require('../../assets/images/onboarding/email.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Sign in with Email</Text>
        <Text style={styles.subtitle}>Enter your email to sign in or create an account</Text>

        <TextInput
          style={styles.input}
          placeholder="you@email.com"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoFocus
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Send Verification Code</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={handleUseWebview} disabled={loading}>
          <Text style={styles.linkText}>Use web authentication instead</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  icon: {
    width: 120,
    height: 90,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 28,
    paddingHorizontal: 24,
    fontSize: 18,
    color: '#FFF',
    backgroundColor: 'transparent',
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  button: {
    height: 56,
    backgroundColor: theme.colors.primary[500],
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'underline',
  },
  spacer: {
    flex: 1,
  },
  progressContainer: {
    paddingBottom: 20,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#222',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 1.5,
  },
});
