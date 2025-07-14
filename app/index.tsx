import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { userStore, selectIsAuthenticated } from '../src/stores/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const isAuthenticated = userStore(selectIsAuthenticated);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  
  useEffect(() => {
    checkOnboardingStatus();
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
  
  // If onboarding is not complete, show onboarding
  // (User will be authenticated during onboarding process)
  if (!hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }
  
  // Onboarding complete means user is authenticated, go to home
  return <Redirect href="/(home)" />;
} 