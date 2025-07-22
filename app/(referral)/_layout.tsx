import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import BottomNav from '@/components/navigation/BottomNav';
import { colors } from '@/theme';

export default function ReferralLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </View>
      <View style={styles.bottomNavContainer}>
        <BottomNav activeTab="referral" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
  },
}); 