import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import TokenChartMini from '../shared/TokenChartMini';
import { Token } from '@/types';
import { fonts } from 'src/theme/typography';
import { colors } from '@/theme/colors';
import { formatMarketCap, formatPercentage, formatPrice } from '@/utils';
import { CHART_COLORS } from '@/utils/constants';

interface CreatorTokenRowProps {
  token: Token;
  chartData?: number[];
  change24h?: number;
  onPress?: () => void;
}

export default function CreatorTokenRow({ token, chartData, change24h, onPress }: CreatorTokenRowProps) {
  const router = useRouter();
  
  // Determine color based on chart data if available, otherwise fall back to change24h prop
  let isPositive = (change24h ?? 0) >= 0;
  let changeColor = isPositive ? CHART_COLORS.POSITIVE : CHART_COLORS.NEGATIVE;
  
  if (chartData && chartData.length > 0) {
    const firstPrice = chartData[0];
    const lastPrice = chartData[chartData.length - 1];
    isPositive = lastPrice >= firstPrice;
    changeColor = isPositive ? CHART_COLORS.POSITIVE : CHART_COLORS.NEGATIVE;
  }
  
  const arrow = isPositive ? '▲' : '▼';
  
  // Use calculated change or fall back to 0
  const displayChange = change24h ?? 0;

  const handlePress = () => {
    // Add medium haptic feedback for token row tap
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onPress) {
      onPress();
    } else {
      router.push(`/(token)/${token.address}`);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
        <Image source={{ uri: token.image }} fadeDuration={0} style={styles.image} />

      <View style={styles.infoSection}>
        <Text style={styles.creatorName}>{token.name}</Text>
        <Text style={styles.marketCap}>{formatMarketCap(token.marketCap || 0)}</Text>
      </View>

      {chartData && chartData.length > 0 && (
        <View style={styles.chartSection}>
          <TokenChartMini data={chartData} color={changeColor} width={50} height={24} />
        </View>
      )}

      <View style={styles.priceSection}>
        <Text style={styles.price}>${formatPrice(token.price)}</Text>
        
        <Text style={[styles.changePercent, { color: changeColor }]}>
          {arrow} {formatPercentage(Math.abs(displayChange))}%
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  infoSection: {
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 2,
    fontFamily: fonts.primary,
  },
  marketCap: {
    fontSize: 14,
    color: colors.neutral[500],
  },
  chartSection: {
    marginRight: 16,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 2,
  },
  changePercent: {
    fontSize: 13,
  },
});
