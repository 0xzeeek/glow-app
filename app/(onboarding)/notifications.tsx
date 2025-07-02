import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { LightningBolt } from '../../assets';
import { Button } from '../../src/components/Button';
import { ProgressIndicator } from '../../src/components/ProgressIndicator';
import { colors } from '../../src/theme';

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

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // Check if app is coming back to foreground after permission dialog
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isWaitingForPermissionRef.current
      ) {
        isWaitingForPermissionRef.current = false;
        
        // Check the permission status and navigate
        const { status } = await Notifications.getPermissionsAsync();
        console.log('Permission status after dialog:', status);
        
        // Configure Android notification channel if granted
        if (status === 'granted' && Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }
        
        // Navigate regardless of the user's choice
        router.push('/(onboarding)/portfolio');
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
              onPress: () => router.push('/(onboarding)/portfolio'),
            },
          ]
        );
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('Existing permission status:', existingStatus);

      if (existingStatus === 'granted') {
        // Permissions already granted, navigate immediately
        console.log('Permissions already granted, navigating...');
        router.push('/(onboarding)/portfolio');
        return;
      }

      // Set flag to indicate we're waiting for permission response
      isWaitingForPermissionRef.current = true;
      
      // Show the system permission dialog
      console.log('Requesting permissions...');
      await Notifications.requestPermissionsAsync();
      
      // Don't navigate here - let the app state change handler do it
      // The navigation will happen when the app returns to foreground
    } catch (error) {
      console.error('Error requesting notifications:', error);
      // Navigate anyway on error
      router.push('/(onboarding)/portfolio');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Lightning Bolt */}
      <View style={styles.imageContainer}>
        <Image 
          source={LightningBolt} 
          style={styles.lightningBolt} 
          resizeMode="contain" 
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Don't Miss a Drop</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Glow launches, price moves, rewards{'\n'}all in real time.
      </Text>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Progress Indicator */}
      <ProgressIndicator 
        totalSteps={3} 
        currentStep={2} 
        style={styles.progressIndicator}
      />

      {/* Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="ENABLE NOTIFICATIONS"
          onPress={handleEnableNotifications}
          style={styles.button}
          textStyle={styles.buttonText}
        />
      </View>

      {/* Bottom indicator */}
      <View style={styles.indicatorContainer}>
        <View style={styles.indicator} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  lightningBolt: {
    width: 260,
    height: 320,
  },
  title: {
    fontFamily: 'DGMTypeset-Regular',
    fontSize: 38,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'SFPro-Regular',
    fontSize: 18,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 26,
  },
  spacer: {
    flex: 0.5,
  },
  progressIndicator: {
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  button: {
    width: '100%',
  },
  buttonText: {
    fontFamily: 'SFPro-Bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  indicator: {
    width: 134,
    height: 5,
    backgroundColor: colors.neutral[0],
    borderRadius: 2.5,
  },
}); 