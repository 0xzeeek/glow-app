import { PlusWallet, Logo, DepositWallet } from 'assets';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../theme/typography';
import { useUser } from '../../contexts';
import { colors } from '@/theme/colors';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

export default function HeaderBar() {
  const router = useRouter();
  const { totalUsdValue } = useUser();
  
  // State for the displayed value during animation
  const [displayValue, setDisplayValue] = useState(totalUsdValue);
  const previousValueRef = useRef(totalUsdValue);
  
  // Animation values
  const bounceScale = useSharedValue(1);
  
  // Counter animation function
  const animateValue = (from: number, to: number, duration: number) => {
    const startTime = Date.now();
    const difference = to - from;
    
    const updateValue = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      
      const currentValue = from + (difference * easedProgress);
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        // Trigger bounce when animation completes
        bounceScale.value = withSequence(
          withSpring(1.12, { damping: 8, stiffness: 200 }),
          withSpring(1, { damping: 10, stiffness: 150 })
        );
      }
    };
    
    requestAnimationFrame(updateValue);
  };
  
  // Detect value changes
  useEffect(() => {
    if (totalUsdValue > previousValueRef.current && previousValueRef.current > 0) {
      // Animate the counter
      animateValue(previousValueRef.current, totalUsdValue, 800);
    } else if (totalUsdValue !== previousValueRef.current) {
      // For decreases or initial load, just update immediately
      setDisplayValue(totalUsdValue);
    }
    
    previousValueRef.current = totalUsdValue;
  }, [totalUsdValue, bounceScale]);
  
  const handleDepositPress = () => {
    router.push('/(profile)');
  };
  
  // Animated styles
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounceScale.value }],
  }));

  if (totalUsdValue > 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image source={Logo} style={styles.logo} />
          </View>
          <Animated.View style={[styles.cashButtonWrapper, animatedButtonStyle]}>
            <TouchableOpacity style={styles.cashButton} onPress={handleDepositPress}>
              <Image source={DepositWallet} style={styles.walletIcon} />
              <Text style={styles.cashAmount}>${displayValue.toFixed(2)}</Text>
              <Ionicons name="chevron-forward" size={16} color="#000" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={Logo} style={styles.logo} />
        </View>
        <TouchableOpacity style={styles.depositButton} onPress={handleDepositPress}>
          <Image source={PlusWallet} style={styles.depositButtonIcon} />
          <Text style={styles.depositButtonText}>DEPOSIT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 191,
    height: 40,
  },
  logoText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 1,
  },
  depositButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  depositButtonIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  depositButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cashButton: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletIcon: {
    width: 20,
    height: 20,
  },
  cashAmount: {
    fontSize: 18,
    fontFamily: fonts.secondaryMedium,
    color: '#000000',
    letterSpacing: -0.5,
  },
  cashButtonWrapper: {
    // Wrapper for animation transforms
  },
}); 