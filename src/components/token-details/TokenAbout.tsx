import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../../theme';

interface TokenAboutProps {
  description: string;
}

export default function TokenAbout({ description }: TokenAboutProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ABOUT</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.primaryBold,
    marginBottom: 12,
    color: colors.neutral[500],
  },
  description: {
    fontSize: 16,
    fontFamily: fonts.primaryMedium,
    color: colors.text.primary,
  },
}); 