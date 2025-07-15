import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { Token1, Token2, Token3, ReferralProfile } from '../../../assets';
import { colors, fonts } from '../../theme';

const { width: screenWidth } = Dimensions.get('window');

interface TokenStatsChartProps {
  marketCap: string;
  topHolders: {
    position: number;
    avatar: string;
  }[];
  chartData: {
    timestamp: number;
    price: number;
  }[];
}

const timeframes = ['LIVE', '4H', '1D', '1W', '1M', 'MAX'];

export default function TokenStatsChart({ marketCap, topHolders, chartData }: TokenStatsChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  
  // Get position badge images
  const positionIcons = [Token1, Token2, Token3];
  
  // Generate path for the chart
  const chartWidth = screenWidth - 48;
  const chartHeight = 150;
  const padding = 10;
  
  const prices = chartData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  
  const points = chartData.map((data, index) => {
    const x = (index / (chartData.length - 1)) * (chartWidth - padding * 2) + padding;
    const y = chartHeight - padding - ((data.price - minPrice) / priceRange) * (chartHeight - padding * 2);
    return { x, y };
  });
  
  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  
  // Create placeholder holders if needed
  const displayHolders = topHolders.length > 0 
    ? topHolders.slice(0, 3)
    : [
        { position: 1, avatar: '' },
        { position: 2, avatar: '' },
        { position: 3, avatar: '' }
      ];
  
  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.label}>MARKET CAP</Text>
          <Text style={styles.value}>{marketCap}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.holderBlock}>
          <Text style={styles.label}>TOP HOLDERS</Text>
          <View style={styles.holdersContainer}>
            {displayHolders.map((holder, index) => (
              <View key={holder.position} style={styles.holderWrapper}>
                <Image source={positionIcons[index]} style={styles.positionBadge} />
                <Image 
                  source={holder.avatar ? { uri: holder.avatar } : ReferralProfile} 
                  style={styles.holderAvatar} 
                />
              </View>
            ))}
          </View>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Chart line */}
          <Path
            d={pathData}
            fill="none"
            stroke={colors.green.white}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Circle at the end of the chart */}
          {points.length > 0 && (
            <Circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="3"
              fill="white"
              stroke={colors.green.white}
              strokeWidth="2"
            />
          )}
        </Svg>
      </View>
      
      <View style={styles.timeframeContainer}>
        {timeframes.map((timeframe) => (
          <TouchableOpacity
            key={timeframe}
            style={[
              styles.timeframeButton,
              selectedTimeframe === timeframe && styles.timeframeButtonActive,
            ]}
            onPress={() => setSelectedTimeframe(timeframe)}
          >
            <Text
              style={[
                styles.timeframeText,
                selectedTimeframe === timeframe && styles.timeframeTextActive,
              ]}
            >
              {timeframe}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
  statsRow: {
    flexDirection: 'row',
    paddingBottom: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    marginLeft: -24,
    marginRight: -24,
    paddingLeft: 24,
    paddingRight: 24,
  },
  statBlock: {
    alignItems: 'center',
    width: '40%',
  },
  holderBlock: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 100,
    marginTop: -22,
    marginBottom: -12,
    backgroundColor: colors.neutral[200],
    marginHorizontal: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.primaryBold,
    color: colors.neutral[500],
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  value: {
    fontSize: 30,
    fontFamily: fonts.secondaryMedium,
    color: colors.text.primary,
  },
  holdersContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  holderWrapper: {
    position: 'relative',
  },
  holderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
  },
  positionBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 12,
    height: 15,
    zIndex: 1,
  },
  chartContainer: {
    height: 150,
    marginBottom: 16,
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeframeButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timeframeButtonActive: {
    backgroundColor: colors.neutral[200],
  },
  timeframeText: {
    fontSize: 11,
    fontFamily: fonts.secondaryMedium,
    color: colors.neutral[500],
  },
  timeframeTextActive: {
    color: colors.text.primary,
  },
}); 