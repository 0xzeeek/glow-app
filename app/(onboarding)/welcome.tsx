import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OnboardingLogo, BackgroundOnbordingIntro } from '../../assets';
import { Button } from '../../src/components/shared/Button';
import { colors, theme } from '../../src/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  const handleLetsGo = () => {
    // Navigate to next onboarding screen
    router.push('/(onboarding)/notifications');
  };

  const handleTermsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Open terms of use
    console.log('Open Terms of Use');
  };

  const handlePrivacyPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Open privacy policy
    console.log('Open Privacy Policy');
  };

  return (
    <>
      <Image source={BackgroundOnbordingIntro} style={styles.backgroundImage} resizeMode="cover" />

      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={OnboardingLogo} style={styles.logoImage} resizeMode="contain" />
        </View>

        {/* Title */}
        <Text style={styles.title}>The new way to trade culture</Text>

        {/* Button */}
        <View style={styles.bottomContainer}>
          <Button title="LET'S GO" onPress={handleLetsGo} />

          {/* Terms and Privacy */}
          <View style={styles.legalContainer}>
            <Text style={styles.legalText}>
              By continuing, you agree to our{' '}
              <Text style={styles.legalLink} onPress={handleTermsPress}>
                Terms of Use
              </Text>{' '}
              and{'\n'}have read and agreed to our{' '}
              <Text style={styles.legalLink} onPress={handlePrivacyPress}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  logoContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -175 }, { translateY: -25 }],
    alignItems: 'center',
  },
  logoImage: {
    width: 350,
    height: 70,
  },
  title: {
    fontFamily: theme.fonts.primary,
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.22,
    width: SCREEN_WIDTH,
    paddingHorizontal: 40,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  legalContainer: {
    paddingTop: 20,
  },
  legalText: {
    fontFamily: 'SFPro-Regular',
    fontSize: 12,
    color: colors.text.neutral,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: colors.text.secondary,
    textDecorationLine: 'underline',
  },
});
