import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function TokenDetailScreen() {
  const { id } = useLocalSearchParams();
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Token Detail Screen - To Be Implemented</Text>
      <Text style={styles.subtext}>Token ID: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  subtext: {
    color: '#B3B3B3',
    fontSize: 14,
    marginTop: 8,
  },
}); 