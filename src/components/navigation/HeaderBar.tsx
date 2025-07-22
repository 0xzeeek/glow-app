import { PlusWallet, Swirl, Glow, DepositWallet } from 'assets';
import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { fonts } from '../../theme/typography';
import { useUser } from '../../contexts';
import { useCountingAnimation } from '../../hooks';
import { colors } from '@/theme/colors';
import Animated, { 
  useAnimatedStyle,
  SharedValue,
  withSpring,
  withTiming,
  useDerivedValue,
  useSharedValue,
  withSequence,
  Easing,
  useAnimatedReaction,
  runOnJS
} from 'react-native-reanimated';

interface HeaderBarProps {
  scrollY?: SharedValue<number>;
}

export interface HeaderBarRef {
  animateSwirl: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const HeaderBar = forwardRef<HeaderBarRef, HeaderBarProps>(({ scrollY }, ref) => {
  const router = useRouter();
  const { totalUsdValue } = useUser();;
  
  // Use the counting animation hook
  const { displayValue, bounceScale } = useCountingAnimation(totalUsdValue);
  
  // Rotation value for swirl spin
  const swirlRotation = useSharedValue(0);
  
  // Store the actual width of the cash amount text
  const cashTextWidth = useSharedValue(60); // Default estimate
  const buttonX = useSharedValue(0); // Store button's X position
  const measurementsReady = useSharedValue(0); // Track if measurements are complete
  
  const handleDepositPress = () => {
    router.push('/(profile)');
  };
  
  // Track target rotation separately for additive animation
  const targetRotation = useSharedValue(0);
  
  // Haptic feedback function
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  // Monitor rotation and trigger haptics at intervals
  // Also check if we're still animating by comparing current vs target
  useAnimatedReaction(
    () => ({
      segment: Math.floor(swirlRotation.value / 45),
      isAnimating: Math.abs(targetRotation.value - swirlRotation.value) > 1
    }),
    (current, previous) => {
      if (previous && current.segment !== previous.segment && current.isAnimating) {
        runOnJS(triggerHaptic)();
      }
    }
  );
  
  // Handle swirl tap
  const handleSwirlPress = () => {
    // Add 6 more rotations to the target
    // This makes the animation additive - each tap adds more spin!
    targetRotation.value += 360 * 6;
    
    // Initial haptic on tap
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    swirlRotation.value = withTiming(
      targetRotation.value,
      { 
        duration: 2000, // Reduced from 3000 for more responsive feel
        easing: Easing.out(Easing.exp) // Exponential easing for natural deceleration
      }
    );
  };
  
  // Expose the swirl animation through ref
  useImperativeHandle(ref, () => ({
    animateSwirl: handleSwirlPress
  }), []);
  
  // Measure the cash text width
  const onCashTextLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    cashTextWidth.value = width;
    measurementsReady.value = 1;
  };
  
  // Measure button position
  const onButtonLayout = (event: any) => {
    const { x } = event.nativeEvent.layout;
    buttonX.value = x;
  };
  
  // Derive a binary collapsed state from scroll position
  const isCollapsed = useDerivedValue(() => {
    if (!scrollY) return 0;
    return scrollY.value > 5 ? 1 : 0;
  });
  
  // Calculate center position dynamically
  const PADDING = 20;
  const SWIRL_WIDTH = 50;
  const GAP = 4; // Reduced gap for tighter spacing
  
  // Animated styles for header container
  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      height: withSpring(isCollapsed.value ? 60 : 80, {
        damping: 15,
        stiffness: 150,
      }),
    };
  });
  
  // Animated styles for glow image (fade out)
  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isCollapsed.value ? 0 : 1, { duration: 200 }),
      transform: [{ 
        scale: withSpring(isCollapsed.value ? 0.8 : 1, {
          damping: 15,
          stiffness: 150,
        })
      }],
    };
  });
  
  // Animated styles for swirl (move to center + rotation)
  const animatedSwirlStyle = useAnimatedStyle(() => {
    const screenCenter = screenWidth / 2;
    
    if (totalUsdValue > 0) {
      // With cash: position swirl so it and cash text are centered together
      const totalWidth = SWIRL_WIDTH + GAP + cashTextWidth.value;
      const startX = (screenWidth - totalWidth) / 2;
      const swirlTranslateX = startX - PADDING;
      
      return {
        transform: [
          { 
            translateX: withSpring(isCollapsed.value ? swirlTranslateX : 0, {
              damping: 15,
              stiffness: 150,
            })
          },
          { 
            scale: withSpring(isCollapsed.value ? 0.8 : 1, {
              damping: 15,
              stiffness: 150,
            })
          },
          {
            rotate: `${swirlRotation.value}deg`
          }
        ],
      };
    } else {
      // Without cash: center the swirl
      const swirlToCenter = screenCenter - PADDING - (SWIRL_WIDTH / 2);
      
      return {
        transform: [
          { 
            translateX: withSpring(isCollapsed.value ? swirlToCenter : 0, {
              damping: 15,
              stiffness: 150,
            })
          },
          { 
            scale: withSpring(isCollapsed.value ? 0.8 : 1, {
              damping: 15,
              stiffness: 150,
            })
          },
          {
            rotate: `${swirlRotation.value}deg`
          }
        ],
      };
    }
  });
  
  // Animated styles for cash button/deposit button (move to center)
  const animatedButtonStyle = useAnimatedStyle(() => {
    const baseScale = bounceScale.value;
    
    if (!isCollapsed.value || !measurementsReady.value) {
      return {
        transform: [{ scale: baseScale }],
      };
    }
    
    // Calculate where we want swirl and text to be centered as a group
    const swirlWidth = SWIRL_WIDTH * 0.8; // Swirl is scaled to 0.8 when collapsed
    const totalContentWidth = swirlWidth + GAP + cashTextWidth.value;
    
    // Center position of the entire group
    const groupCenterX = screenWidth / 2;
    const groupStartX = groupCenterX - (totalContentWidth / 2);
    
    // Where we want the text to start (after swirl and gap)
    const textTargetX = groupStartX + swirlWidth + GAP;
    
    // Current text position within button (icon + padding before text)
    const textOffsetInButton = 32;
    const currentTextX = buttonX.value + textOffsetInButton;
    
    // How much to move the button (negative = left)
    const translateX = textTargetX - currentTextX;
    
    return {
      transform: [
        { 
          translateX: withSpring(translateX, {
            damping: 15,
            stiffness: 150,
          })
        },
        { 
          scale: withSpring(baseScale * 0.9, {
            damping: 15,
            stiffness: 150,
          })
        }
      ],
    };
  });
  
  // Animated styles for deposit button (hide when collapsed)
  const animatedDepositButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isCollapsed.value ? 0 : 1, { duration: 200 }),
      transform: [
        { 
          scale: withSpring(isCollapsed.value ? 0.8 : 1, {
            damping: 15,
            stiffness: 150,
          })
        }
      ],
    };
  });
  
  // Animated styles for the cash button itself (border fade)
  const animatedCashButtonStyle = useAnimatedStyle(() => {
    return {
      borderColor: withTiming(isCollapsed.value ? 'transparent' : colors.neutral[300], { duration: 200 }),
    };
  });
  
  // Animated styles for wallet icon
  const animatedWalletIconStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isCollapsed.value ? 0 : 1, { duration: 200 }),
    };
  });
  
  // Animated styles for chevron icon
  const animatedChevronStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isCollapsed.value ? 0 : 1, { duration: 200 }),
    };
  });
  
  // Animated container style
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      paddingVertical: withSpring(isCollapsed.value ? 8 : 16, {
        damping: 15,
        stiffness: 150,
      }),
    };
  });

  // Animated styles for logo container
  const animatedLogoContainerStyle = useAnimatedStyle(() => {
    
    return {
      gap: 8, // Base gap is now 8px, scales down to 4px
    };
  });

  // Remove this animation as it's causing conflicts
  // Animated styles for cash button container (adjust position for scaled logos)
  /* const animatedCashContainerStyle = useAnimatedStyle(() => {
    // When logos scale down, we need less space on the right
    const logoScale = interpolate(
      cashTextWidth.value,
      [80, 150],
      [1, 0.7],
      Extrapolate.CLAMP
    );
    
    // Adjust right margin based on logo scale to prevent button being too far right
    const marginAdjustment = (1 - logoScale) * 40; // Up to 12px adjustment
    
    return {
      marginRight: -marginAdjustment, // Negative margin to pull button left
    };
  }); */

  if (totalUsdValue > 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.container, animatedContainerStyle, animatedHeaderStyle]}>
          <Animated.View style={[styles.logoContainer]}>
            <TouchableOpacity onPress={() => handleSwirlPress()} activeOpacity={0.8}>
              <Animated.Image source={Swirl} style={[styles.swirl, animatedSwirlStyle]} />
            </TouchableOpacity>
            <Animated.Image source={Glow} style={[styles.glow, animatedGlowStyle]} />
          </Animated.View>
          <Animated.View style={[styles.cashButtonWrapper, animatedButtonStyle]} onLayout={onButtonLayout}>
            <TouchableOpacity style={styles.cashButtonTouchable} onPress={handleDepositPress}>
              <Animated.View style={[styles.cashButton, animatedCashButtonStyle]}>
                <Animated.Image source={DepositWallet} style={[styles.walletIcon, animatedWalletIconStyle]} />
                <Text style={styles.cashAmount} onLayout={onCashTextLayout}>${displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                <Animated.View style={animatedChevronStyle}>
                  <Ionicons name="chevron-forward" size={16} color="#000" />
                </Animated.View>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, animatedContainerStyle, animatedHeaderStyle]}>
        <Animated.View style={[styles.logoContainer]}>
          <TouchableOpacity onPress={() => handleSwirlPress()} activeOpacity={0.8}>
            <Animated.Image source={Swirl} style={[styles.swirl, animatedSwirlStyle]} />
          </TouchableOpacity>
          <Animated.Image source={Glow} style={[styles.glow, animatedGlowStyle]} />
        </Animated.View>
        <Animated.View style={[animatedDepositButtonStyle]}>
          <TouchableOpacity style={styles.depositButton} onPress={handleDepositPress}>
            <Animated.Image source={PlusWallet} style={[styles.depositButtonIcon, animatedWalletIconStyle]} />
            <Text style={styles.depositButtonText}>DEPOSIT</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
});

export default HeaderBar;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background.primary,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background.primary,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Reduced from 12 to 8 for tighter default spacing
  },
  swirl: {
    width: 50,
    height: 40,
  },
  glow: {
    width: 127,
    height: 21,
  },
  logoText: {
    fontSize: 26,
    color: colors.text.primary,
    letterSpacing: 1,
  },
  depositButton: {
    backgroundColor: colors.background.secondary,
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
    color: colors.text.secondary,
    fontSize: 14,
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
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  cashButtonWrapper: {
    // Wrapper for animation transforms
  },
  cashButtonTouchable: {
    // TouchableOpacity wrapper for the cash button
  },
}); 