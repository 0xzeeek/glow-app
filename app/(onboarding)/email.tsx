import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableOpacity,
  Pressable,
  Image,
  Keyboard,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../src/theme';
import { fonts } from '../../src/theme/typography';
import { ProgressIndicator } from '../../src/components/shared/ProgressIndicator';
import { BackgroundOnbordingMain, OnboardingEmail } from 'assets';
import { Button } from 'src/components/shared/Button';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function EmailScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const imageTranslateY = useState(new Animated.Value(0))[0];
  const contentTranslateY = useState(new Animated.Value(0))[0];

  const handleTermsPress = () => {
    // Open terms of use
    console.log('Open Terms of Use');
  };

  const handlePrivacyPress = () => {
    // Open privacy policy
    console.log('Open Privacy Policy');
  };

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardVisible(true);
        Animated.parallel([
          Animated.timing(imageTranslateY, {
            toValue: -300, // Move image up and out of view
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(contentTranslateY, {
            toValue: -120, // Move content up
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        Animated.parallel([
          Animated.timing(imageTranslateY, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(contentTranslateY, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const isValidEmail = (email: string) => {
    const at = email.indexOf('@');
    const dot = email.lastIndexOf('.');
    return at > 0 && dot > at + 1 && dot < email.length - 1;
  };

  const canContinue = isValidEmail(email) && agreed && !loading;

  const handleLogin = async () => {
    if (!canContinue) return;
    setLoading(true);
    try {
      await AsyncStorage.setItem('onboarding_email', email);
      router.push('/(onboarding)/verify');
    } catch (error: any) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={BackgroundOnbordingMain} style={styles.backgroundImage} resizeMode="cover" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.content}>
          <Animated.View 
            style={[
              styles.imageWrapper,
              { transform: [{ translateY: imageTranslateY }] }
            ]}
          >
            <Image source={OnboardingEmail} style={styles.onboardingEmail} />
          </Animated.View>
          <Animated.View 
            style={[
              styles.formContainer,
              { transform: [{ translateY: contentTranslateY }] }
            ]}
          >
            <View style={styles.titleContainer}>
              <Text style={styles.title}>What's your email?</Text>
              <Text style={styles.subtitle}>
                We'll use it to sign you in. It stays private{'\n'}and we'll never send spam.
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="you@email.com"
              placeholderTextColor={colors.text.neutral}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />
            <View style={styles.checkboxRow}>
              <Pressable
                style={[styles.checkbox, agreed && styles.checkboxChecked]}
                onPress={() => setAgreed(prev => !prev)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreed }}
              >
                {agreed && <View style={styles.checkboxInner} />}
              </Pressable>
              <Text style={styles.checkboxLabel}>
                I agree to the <Text style={styles.link} onPress={handleTermsPress}>Terms of Use</Text> and{' '}
                <Text style={styles.link} onPress={handlePrivacyPress}>Privacy Policy</Text>
              </Text>
            </View>
          </Animated.View>
        </View>
        <View style={styles.bottomContainer}>
          <View style={styles.progressWrapper}>
            <ProgressIndicator totalSteps={3} currentStep={2} />
          </View>
          <Button title="Next" onPress={handleLogin} disabled={!canContinue}/>
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
    paddingTop: 60,
  },
  imageWrapper: {
    marginTop: 20,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingEmail: {
    width: 263,
    height: 263,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  titleContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    marginBottom: 24,
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
    opacity: 0.7,
    lineHeight: 26,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    letterSpacing: 0,
    color: colors.text.secondary,
    backgroundColor: 'transparent',
    marginBottom: 28,
    fontFamily: fonts.primary,
    width: SCREEN_WIDTH - 48,
    alignSelf: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    width: SCREEN_WIDTH - 48,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: colors.text.neutral,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: colors.text.secondary,
    borderColor: colors.text.primary,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 1,
  },
  checkboxLabel: {
    fontFamily: fonts.primary,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    opacity: 0.5,
    flexShrink: 1,
  },
  link: {
    fontFamily: fonts.primary,
    color: colors.text.secondary,
    textDecorationLine: 'underline',
    opacity: 1,
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
