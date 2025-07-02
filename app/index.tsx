import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { userStore, selectIsAuthenticated } from '../src/stores/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const isAuthenticated = userStore(selectIsAuthenticated);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  
  useEffect(() => {
    checkOnboardingStatus();
    // TODO: remove this after testing
    AsyncStorage.clear();
  }, []);
  
  const checkOnboardingStatus = async () => {
    try {
      const onboarded = await AsyncStorage.getItem('hasCompletedOnboarding');
      setHasCompletedOnboarding(onboarded === 'true');
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      setHasCompletedOnboarding(false);
    }
  };
  
  // Wait for onboarding check
  if (hasCompletedOnboarding === null) {
    return null; // Or a splash screen
  }
  
  // First time user - show onboarding
  if (!hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }
  
  // Onboarding complete - check auth
  if (isAuthenticated) {
    return <Redirect href="/(home)" />;
  }
  
  // Onboarding complete but not authenticated
  return <Redirect href="/(auth)" />;
} 