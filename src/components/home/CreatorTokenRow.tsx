import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import TokenChartMini from '../shared/TokenChartMini';
import { CreatorToken } from '../../data/mockTokens';
import { fonts } from 'src/theme/typography';
import { colors } from '@/theme/colors';

interface CreatorTokenRowProps {
  token: CreatorToken;
  onPress?: () => void;
}

export default function CreatorTokenRow({ token, onPress }: CreatorTokenRowProps) {
  const router = useRouter();
  const isPositive = token.changePercent >= 0;
  const changeColor = isPositive ? '#00C853' : '#FF3366';
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
      <View style={styles.avatarContainer}>
        <Image source={{ uri: token.avatar }} style={styles.avatar} />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.creatorName}>{token.creatorName}</Text>
        <Text style={styles.marketCap}>{token.marketCap}</Text>
      </View>

      <View style={styles.chartSection}>
        <TokenChartMini data={token.chartData} color={changeColor} width={50} height={24} />
      </View>

      <View style={styles.priceSection}>
        <Text style={styles.price}>{token.price}</Text>
        <Text style={[styles.changePercent, { color: changeColor }]}>
          {arrow} {Math.abs(token.changePercent)}%
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
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 100,
    borderColor: colors.neutral[300],
    borderWidth: 1,
    marginRight: 12,
  },
  avatar: {
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
