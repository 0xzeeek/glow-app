import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { BackgroundOnbordingMain, OnboardingLightningBolt } from '../../assets';
import { Button } from '../../src/components/shared/Button';
import { ProgressIndicator } from '../../src/components/shared/ProgressIndicator';
import { colors } from '../../src/theme';
import { fonts } from '../../src/theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function NotificationsOnboardingScreen() {
  const router = useRouter();
  const appStateRef = useRef(AppState.currentState);
  const isWaitingForPermissionRef = useRef(false);

  const handleTermsPress = () => {
    // Open terms of use
    console.log('Open Terms of Use');
  };

  const handlePrivacyPress = () => {
    // Open privacy policy
    console.log('Open Privacy Policy');
  };

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isWaitingForPermissionRef.current
      ) {
        isWaitingForPermissionRef.current = false;
        const { status } = await Notifications.getPermissionsAsync();
        if (status === 'granted' && Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            // TODO: update this color
            lightColor: '#FF231F7C',
          });
        }
        router.push('/(onboarding)/email');
      }
      appStateRef.current = nextAppState;
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [router]);

  const handleEnableNotifications = async () => {
    try {
      if (!Device.isDevice) {
        Alert.alert(
          'Physical Device Required',
          'Push notifications only work on physical devices.',
          [
            {
              text: 'Continue',
              onPress: () => router.push('/(onboarding)/email'),
            },
          ]
        );
        return;
      }
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus === 'granted') {
        router.push('/(onboarding)/email');
        return;
      }
      isWaitingForPermissionRef.current = true;
      await Notifications.requestPermissionsAsync();
    } catch (error) {
      router.push('/(onboarding)/email');
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient image */}
      <Image source={BackgroundOnbordingMain} style={styles.backgroundImage} resizeMode="cover" />
      <View style={styles.content}>
        <View style={styles.imageWrapper}>
          <Image source={OnboardingLightningBolt} style={styles.lightningBolt} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Don’t Miss a Drop</Text>
          <Text style={styles.subtitle}>
            Glow launches, price moves, rewards{`\n`}all in real time.
          </Text>
        </View>
        <View style={styles.bottomContainer}>
          <View style={styles.progressWrapper}>
            <ProgressIndicator totalSteps={3} currentStep={1} style={styles.progressIndicator} />
          </View>
          <Button
            title="ENABLE NOTIFICATIONS"
            onPress={handleEnableNotifications}
          />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
  lightningBolt: {
    width: 183,
    height: 275,
  },
  titleContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    height: 150,
    width: SCREEN_WIDTH,
    transform: [{ translateX: -SCREEN_WIDTH / 2 }, { translateY: 0 }],
    alignItems: 'center',
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
    marginBottom: 36,
    lineHeight: 26,
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
  progressWrapper: {
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  progressIndicator: {
    height: 6,
    minHeight: 6,
    maxHeight: 6,
    marginBottom: 0,
    marginTop: 0,
    // Make dots skinnier
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
