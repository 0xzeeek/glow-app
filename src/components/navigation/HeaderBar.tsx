import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default function HeaderBar() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>@</Text>
          <Text style={styles.logoText}>GLOW</Text>
        </View>
        <TouchableOpacity style={styles.depositButton}>
          <Text style={styles.plusIcon}>+</Text>
          <Text style={styles.depositButtonText}>DEPOSIT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 4,
    transform: [{ scaleX: -1 }],
  },
  logoText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 1,
  },
  depositButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  plusIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 6,
    fontWeight: 'bold',
  },
  depositButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
}); 