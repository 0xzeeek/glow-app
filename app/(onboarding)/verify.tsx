import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';
import { fonts } from '../../src/theme/typography';
import { ProgressIndicator } from '../../src/components/shared/ProgressIndicator';
import { BackgroundOnbordingMain } from '../../assets';
import { Button } from '../../src/components/shared/Button';
import { useLoginWithEmail } from '@privy-io/expo';
import { getApiClient } from '../../src/services';
import { WalletAddress } from '../../src/types';
// import { getStoredReferral, clearStoredReferral } from '../../src/hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function VerifyScreen() {
  const router = useRouter();
  const { loginWithCode, sendCode } = useLoginWithEmail();
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    const loadEmail = async () => {
      const storedEmail = await AsyncStorage.getItem('onboarding_email');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    };
    loadEmail();
  }, []);

  useEffect(() => {
    // Dismiss keyboard when 6 digits are entered
    if (otp.length === 6) {
      Keyboard.dismiss();
    }
  }, [otp]);

  const handleOtpChange = (text: string) => {
    // Only allow numbers and limit to 6 digits
    const cleanedText = text.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(cleanedText);
  };

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      return;
    }

    setLoading(true);
    try {
      // const recievedReferralCode = await getStoredReferral();

      const privyUser = await loginWithCode({ code: otp, email });

      // Get wallet from the Privy user response
      const walletInfo = privyUser?.linked_accounts?.find(
        (account: any) => account.type === 'wallet' && account.walletClient === 'privy'
      );

      if (walletInfo && walletInfo.type === 'wallet' && email) {
        const walletAddress = walletInfo.address as WalletAddress;
        const apiClient = getApiClient();

        try {
          // Create or get existing user immediately
          const response = await apiClient.createUser(walletAddress, email);
          console.log('User ready:', response.user);
        } catch (error: any) {
          console.error('Failed to create/get user:', error);
          // Don't block onboarding for backend errors
        }
      }

      // Complete onboarding immediately
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      router.replace('/(home)');
    } catch (error: any) {
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    await sendCode({ email });
    setCodeSent(true);
    // Reset the "Code sent" message after 3 seconds
    setTimeout(() => {
      setCodeSent(false);
    }, 3000);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Image source={BackgroundOnbordingMain} style={styles.backgroundImage} resizeMode="cover" />

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="chevron-back" size={28} color={colors.text.secondary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Verify your email</Text>
            <Text style={styles.subtitle}>
              We sent a code to{'\n'}
              <Text style={styles.email}>{email || 'your email'}</Text>
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="000000"
            placeholderTextColor={colors.text.neutral}
            value={otp}
            onChangeText={handleOtpChange}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            editable={!loading}
          />

          <TouchableOpacity onPress={handleResend} disabled={loading || codeSent}>
            <Text style={styles.resendText}>
              {codeSent ? (
                'Code sent'
              ) : (
                <>
                  Didn't receive a code? <Text style={styles.resendLink}>Resend</Text>
                </>
              )}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomContainer}>
          <View style={styles.progressWrapper}>
            <ProgressIndicator totalSteps={3} currentStep={3} />
          </View>
          <Button
            title="Verify"
            onPress={handleVerify}
            disabled={!otp || otp.length < 6 || loading}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 200,
  },
  titleContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontFamily: fonts.primary,
    fontSize: 32,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: fonts.primary,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    lineHeight: 26,
  },
  email: {
    fontFamily: fonts.primary,
    color: colors.text.secondary,
    opacity: 0.8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    paddingHorizontal: 24,
    fontSize: 24,
    color: colors.text.secondary,
    backgroundColor: 'transparent',
    marginBottom: 24,
    fontFamily: fonts.primary,
    textAlign: 'center',
    letterSpacing: 8,
    width: SCREEN_WIDTH - 48,
  },
  verificationEmailText: {
    fontFamily: fonts.primary,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  resendText: {
    fontFamily: fonts.primary,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
  resendLink: {
    color: colors.text.secondary,
    textDecorationLine: 'underline',
  },
  bottomContainer: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    paddingBottom: 100,
    alignItems: 'center',
    width: '100%',
  },
  progressWrapper: {
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
});
