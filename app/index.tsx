import React from 'react';
import { Redirect } from 'expo-router';

import { usePrivy } from '@privy-io/expo';

export default function Index() {
  const { isReady, user } = usePrivy();
  
  // If onboarding is not complete, show onboarding
  // (User will be authenticated during onboarding process)
  if (isReady && !user) {
    return <Redirect href="/(onboarding)" />;
  }

  if (isReady && user) {
    return <Redirect href="/(home)" />;
  }

  return null;
} 