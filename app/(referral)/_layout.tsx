import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import BottomNav from '@/components/navigation/BottomNav';
import { colors } from '@/theme';

export default function ReferralLayout() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </View>
      <BottomNav activeTab="referral" />
    </SafeAreaView>
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
}); 