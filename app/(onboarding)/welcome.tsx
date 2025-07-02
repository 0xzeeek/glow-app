import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  GlowLogo, 
  StarLarge, 
  StarMedium, 
  StarSmall, 
  SparkleIcon 
} from '../../assets';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  const handleLetsGo = () => {
    // Navigate to next onboarding screen
    router.push('/(onboarding)/notifications');
  };

  const handleTermsPress = () => {
    // Open terms of use
    console.log('Open Terms of Use');
  };

  const handlePrivacyPress = () => {
    // Open privacy policy
    console.log('Open Privacy Policy');
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <GlowLogo width={180} height={50} />
      </View>

      {/* Stars Container */}
      <View style={styles.starsContainer}>
        {/* Small star (top left) */}
        <Image 
          source={StarSmall} 
          style={[styles.star, styles.starSmall]} 
          resizeMode="contain" 
        />
        
        {/* Medium star (top right) */}
        <Image 
          source={StarMedium} 
          style={[styles.star, styles.starMedium]} 
          resizeMode="contain" 
        />
        
        {/* Large star with smiley (center) */}
        <Image 
          source={StarLarge} 
          style={[styles.star, styles.starLarge]} 
          resizeMode="contain" 
        />
      </View>

      {/* Sparkle Icon */}
      <View style={styles.sparkleContainer}>
        <Image source={SparkleIcon} style={styles.sparkle} resizeMode="contain" />
      </View>

      {/* Title */}
      <Text style={styles.title}>The new way to trade culture</Text>

      {/* Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="LET'S GO"
          onPress={handleLetsGo}
          style={styles.button}
          textStyle={styles.buttonText}
        />
      </View>

      {/* Terms and Privacy */}
      <View style={styles.legalContainer}>
        <Text style={styles.legalText}>
          By continuing, you agree to our{' '}
          <Text style={styles.legalLink} onPress={handleTermsPress}>
            Terms of Use
          </Text>
          {' '}and{'\n'}have read and agreed to our{' '}
          <Text style={styles.legalLink} onPress={handlePrivacyPress}>
            Privacy Policy
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  logoContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  starsContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    top: 0,
    left: 0,
  },
  star: {
    position: 'absolute',
  },
  starSmall: {
    width: 70,
    height: 70,
    top: SCREEN_HEIGHT * 0.20,
    left: (SCREEN_WIDTH / 2) - 30,
  },
  starMedium: {
    width: 100,
    height: 100,
    top: SCREEN_HEIGHT * 0.25,
    right: SCREEN_WIDTH * 0.10,
  },
  starLarge: {
    width: 220,
    height: 220,
    top: (SCREEN_HEIGHT * 0.5) - 150,
    left: (SCREEN_WIDTH / 2) - 110,
  },
  sparkleContainer: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 0.5) + 130,
    width: SCREEN_WIDTH,
    alignItems: 'center',
  },
  sparkle: {
    width: 85,
    height: 85,
  },
  title: {
    fontFamily: 'DGMTypeset-Regular',
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center',
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.22,
    width: SCREEN_WIDTH,
    paddingHorizontal: 40,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.12,
    width: SCREEN_WIDTH,
    paddingHorizontal: 24,
  },
  button: {
    width: '100%',
  },
  buttonText: {
    fontFamily: 'DGMTypeset-Regular',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.neutral[1000],
  },
  legalContainer: {
    position: 'absolute',
    bottom: 60,
    width: SCREEN_WIDTH,
    paddingHorizontal: 40,
  },
  legalText: {
    fontFamily: 'SFPro-Regular',
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: colors.text.secondary,
    textDecorationLine: 'underline',
  },
}); 