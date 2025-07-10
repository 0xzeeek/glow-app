import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth, useCrossmintAuth } from '@crossmint/client-sdk-react-native-ui';
import { theme } from '../../src/theme';

export default function VerifyScreen() {
  const router = useRouter();
  const { crossmintAuth } = useCrossmintAuth();
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [emailId, setEmailId] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // Get email and emailId from previous screen
    const loadData = async () => {
      const storedEmail = await AsyncStorage.getItem('onboarding_email');
      const storedEmailId = await AsyncStorage.getItem('crossmint_email_id');
      
      if (storedEmail) {
        setEmail(storedEmail);
      }
      if (storedEmailId) {
        setEmailId(storedEmailId);
      }

      if (crossmintAuth) {
        const result = await crossmintAuth.confirmEmailOtp(email, emailId, otp);
        console.log('result', result);
      }
      
      console.log('Loaded email:', storedEmail, 'emailId:', storedEmailId);
    };
    
    loadData();
  }, []);

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit verification code');
      return;
    }

    router.push('/(home)');
    return;
    setLoading(true);
    try {
      // get email id and email token from async storage
      const email = await AsyncStorage.getItem('onboarding_email');
      const emailId = await AsyncStorage.getItem('emailId');
      const emailToken = await AsyncStorage.getItem('emailToken');
      console.log('email', email);
      console.log('emailId', emailId);
      console.log('emailToken', emailToken);
      if (crossmintAuth && emailId && email) {
        // verify the otp
        const result = await crossmintAuth.confirmEmailOtp(email, emailId, otp);
        console.log('result', result);

        
      }
    } catch (error: any) {
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  // const handleResend = async () => {
  //   setResending(true);
  //   try {
      
  //     if (authAny && typeof authAny.sendEmailOtp === 'function') {
  //       console.log('Resending OTP to email:', email);
  //       const result = await authAny.sendEmailOtp(email);
  //       console.log('Resend result:', result);
        
  //       // Update emailId if returned
  //       if (result && result.emailId) {
  //         setEmailId(result.emailId);
  //         await AsyncStorage.setItem('crossmint_email_id', result.emailId);
  //       }
        
  //       Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
  //     } else {
  //       Alert.alert('Error', 'Unable to resend code. Please try again later.');
  //     }
  //   } catch (error: any) {
  //     console.error('Resend error:', error);
  //     Alert.alert('Error', 'Failed to resend code. Please try again.');
  //   } finally {
  //     setResending(false);
  //   }
  // };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Verify Icon */}
        <View style={styles.iconContainer}>
          <Image 
            source={require('../../assets/images/onboarding/verify.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          We sent a code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <TextInput
          style={styles.input}
          placeholder="000000"
          placeholderTextColor="#666"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          editable={!loading}
        />

        {/* <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResend}
          disabled={loading || resending}
        >
          <Text style={styles.resendText}>
            {resending ? 'Sending...' : "Didn't receive a code? Resend"}
          </Text>
        </TouchableOpacity> */}

        <View style={styles.spacer} />

        <TouchableOpacity
          style={[
            styles.button,
            (!otp || loading) && styles.buttonDisabled
          ]}
          onPress={handleVerify}
          disabled={!otp || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>VERIFY</Text>
          )}
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
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
  email: {
    color: '#FFF',
    fontWeight: '500',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 28,
    paddingHorizontal: 24,
    fontSize: 24,
    color: '#FFF',
    backgroundColor: 'transparent',
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    textAlign: 'center',
    letterSpacing: 8,
  },
  resendButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'underline',
  },
  spacer: {
    flex: 1,
  },
  button: {
    height: 56,
    backgroundColor: theme.colors.primary[500],
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
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