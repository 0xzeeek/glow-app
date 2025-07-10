import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TokenInfoProps {
  marketCap: string;
  volume24h: string;
  holders: number;
  circulatingSupply: string;
  createdAt: string;
}

export default function TokenInfo({ marketCap, volume24h, holders, circulatingSupply, createdAt }: TokenInfoProps) {
  const formatHolders = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(0) + 'k';
    }
    return count.toString();
  };
  
  const infoItems = [
    { label: 'Market Cap', value: marketCap },
    { label: '24h Volume', value: volume24h },
    { label: 'Holders', value: formatHolders(holders) },
    { label: 'Circulating Supply', value: circulatingSupply },
    { label: 'Created', value: createdAt },
  ];
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TOKEN INFO</Text>
      {infoItems.map((item, index) => (
        <View key={item.label} style={[styles.infoRow, index === infoItems.length - 1 && styles.lastRow]}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
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
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 14,
    color: '#666666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
}); 