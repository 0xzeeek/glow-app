import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
  },
}); 