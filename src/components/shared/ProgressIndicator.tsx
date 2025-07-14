import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
  style?: any;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  totalSteps,
  currentStep,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentStep - 1 && styles.activeDot,
            index < totalSteps - 1 && styles.dotWithMargin,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 1,
    borderRadius: 4,
    backgroundColor: colors.neutral[800],
  },
  activeDot: {
    backgroundColor: colors.neutral[0],
    width: 8,
  },
  dotWithMargin: {
    marginRight: 4,
  },
}); 