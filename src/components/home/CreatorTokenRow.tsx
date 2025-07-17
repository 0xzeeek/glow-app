import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import TokenChartMini from '../shared/TokenChartMini';
import { Token } from '@/types';
import { fonts } from 'src/theme/typography';
import { colors } from '@/theme/colors';
import { formatMarketCap } from '@/utils';
import { CHART_COLORS } from '@/utils/constants';

interface CreatorTokenRowProps {
  token: Token;
  chartData?: number[];
  onPress?: () => void;
}

export default function CreatorTokenRow({ token, chartData, onPress }: CreatorTokenRowProps) {
  const router = useRouter();
  
  // Determine color based on chart data if available, otherwise fall back to change24h
  let isPositive = token.change24h >= 0;
  let changeColor = isPositive ? CHART_COLORS.POSITIVE : CHART_COLORS.NEGATIVE;
  
  if (chartData && chartData.length > 0) {
    const firstPrice = chartData[0];
    const lastPrice = chartData[chartData.length - 1];
    isPositive = lastPrice >= firstPrice;
    changeColor = isPositive ? CHART_COLORS.POSITIVE : CHART_COLORS.NEGATIVE;
  }
  
  const arrow = isPositive ? '▲' : '▼';

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(token)/${token.address}`);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: token.image }} style={styles.image} />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.creatorName}>{token.name}</Text>
        <Text style={styles.marketCap}>{formatMarketCap(token.marketCap)}</Text>
      </View>

      {chartData && chartData.length > 0 && (
        <View style={styles.chartSection}>
          <TokenChartMini data={chartData} color={changeColor} width={50} height={24} />
        </View>
      )}

      <View style={styles.priceSection}>
        <Text style={styles.price}>${token.price.toFixed(4)}</Text>
        <Text style={[styles.changePercent, { color: changeColor }]}>
          {arrow} {Math.abs(token.change24h)}%
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
    paddingVertical: 2,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 100,
    borderColor: colors.neutral[300],
    borderWidth: 1,
    marginRight: 12,
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  infoSection: {
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
    fontFamily: fonts.primary,
  },
  marketCap: {
    fontSize: 14,
    color: '#666666',
  },
  chartSection: {
    marginRight: 16,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  changePercent: {
    fontSize: 13,
    fontWeight: '500',
  },
});
