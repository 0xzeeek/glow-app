import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  ViewStyle,
  TextStyle,
  ImageStyle,
  Alert,
  Linking,
  AppState,
  AppStateStatus,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { colors, fonts } from '../../src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkNotificationPermissions = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(status === 'granted');
    setLoading(false);
  }, []);

  // Check permissions when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkNotificationPermissions();
    }, [checkNotificationPermissions])
  );

  // Also check when app comes to foreground (returning from settings)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkNotificationPermissions();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkNotificationPermissions]);

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        // If permission denied, show alert to go to settings
        Alert.alert(
          'Notifications Permission',
          'Please enable notifications in your device settings to receive updates.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
      setNotificationsEnabled(true);
    } else {
      // Show alert to disable in settings
      Alert.alert(
        'Disable Notifications',
        'To disable notifications, please turn them off in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NOTIFICATIONS</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Single Notification Toggle */}
      <View style={styles.settingItem}>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>ALL NOTIFICATIONS</Text>
          <Text style={styles.settingDescription}>No hot coins and breaking news</Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={handleToggleNotifications}
          trackColor={{ false: colors.neutral[400], true: colors.green.black }}
          thumbColor={colors.neutral[0]}
          ios_backgroundColor={colors.neutral[400]}
          disabled={loading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    transform: [{ rotate: '180deg' }],
  },
  headerTitle: {
    fontFamily: fonts.primaryBold,
    fontSize: 16,
    color: colors.text.neutral,
    letterSpacing: 1,
  },
  headerSpacer: {
    width: 36,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontFamily: fonts.primaryBold,
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontFamily: fonts.primary,
    fontSize: 14,
    color: colors.text.neutral,
    lineHeight: 18,
  },
}); 