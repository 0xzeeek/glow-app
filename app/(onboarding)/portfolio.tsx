import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../../src/components/shared/Button';
import { ProgressIndicator } from '../../src/components/shared/ProgressIndicator';

export default function PortfolioOnboardingScreen() {
  const router = useRouter();
  
  const handleCompleteOnboarding = async () => {
    try {
      // Mark onboarding as complete
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      
      // Navigate to auth screen
      router.replace('/(auth)');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.text}>Portfolio Onboarding - To Be Implemented</Text>
        <Text style={styles.subtext}>This is the third onboarding screen</Text>
        
        <ProgressIndicator 
          totalSteps={3} 
          currentStep={3} 
          style={styles.progressIndicator}
        />
        
        <View style={styles.buttonContainer}>
          <Button
            title="COMPLETE ONBOARDING"
            onPress={handleCompleteOnboarding}
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtext: {
    color: '#999999',
    fontSize: 16,
    marginBottom: 40,
  },
  progressIndicator: {
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 40,
  },
  button: {
    width: '100%',
  },
}); 