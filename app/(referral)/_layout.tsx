import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import BottomNav from '@/components/navigation/BottomNav';

export default function ReferralLayout() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </View>
      <BottomNav activeTab={null} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
}); 