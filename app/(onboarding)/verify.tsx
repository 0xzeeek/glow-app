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
import { colors } from '../../src/theme';
import { fonts } from '../../src/theme/typography';
import { ProgressIndicator } from '../../src/components/shared/ProgressIndicator';
import { BackgroundOnbordingMain } from '../../assets';
import { Button } from '../../src/components/shared/Button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function VerifyScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

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
      // TODO: Implement actual verification logic
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      router.replace('/(home)');
    } catch (error: any) {
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    // TODO: Implement resend logic
    console.log('Resend code');
  };

  return (
    <View style={styles.container}>
      <Image source={BackgroundOnbordingMain} style={styles.backgroundImage} resizeMode="cover" />
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

          <TouchableOpacity onPress={handleResend} disabled={loading}>
            <Text style={styles.resendText}>
              Didn't receive a code? <Text style={styles.resendLink}>Resend</Text>
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