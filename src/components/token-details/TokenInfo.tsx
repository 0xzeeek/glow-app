import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../../theme';

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
    { label: 'Circulating supply', value: circulatingSupply },
    { label: 'Created', value: createdAt },
  ];
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TOKEN INFO</Text>
      <View style={styles.infoList}>
        {infoItems.map((item) => (
          <View key={item.label} style={styles.infoRow}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.primaryBold,
    color: colors.neutral[500],
    marginBottom: 16,
  },
  infoList: {
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontFamily: fonts.primaryMedium,
    color: colors.neutral[500],
  },
  value: {
    fontSize: 16,
    fontFamily: fonts.secondary,
    color: colors.text.primary,
  },
}); 