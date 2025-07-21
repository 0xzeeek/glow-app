import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Token1White, Token2White, Token3White, UserPlaceholder, TopHolder as TopHolderIcon } from '../../../assets';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { interpolateChartData } from '@/utils';
import { CHART_COLORS } from '@/utils/constants';
import { TopHolder } from '@/types';

const { width: screenWidth } = Dimensions.get('window');

interface TokenStatsChartProps {
  marketCap: string;
  topHolders: TopHolder[];
  chartData: {
    timestamp: number;
    price: number;
  }[];
  selectedRange?: '1h' | '1d' | '7d' | '30d' | 'all';
  onRangeChange?: (range: '1h' | '1d' | '7d' | '30d' | 'all') => void;
  isLoading?: boolean;
  availableRanges?: Record<'1h' | '1d' | '7d' | '30d' | 'all', boolean>;
  onPressHolders?: () => void;
}

const timeframes: Array<{ label: string; value: '1h' | '1d' | '7d' | '30d' | 'all' }> = [
  { label: '1H', value: '1h' },
  { label: '1D', value: '1d' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: 'ALL', value: 'all' },
];

export default function TokenStatsChart({ 
  marketCap, 
  topHolders, 
  chartData,
  selectedRange = '1d',
  onRangeChange,
  isLoading = false,
  availableRanges = { '1h': true, '1d': true, '7d': true, '30d': true, 'all': true },
  onPressHolders,
}: TokenStatsChartProps) {
  const handleTimeframeChange = (value: '1h' | '1d' | '7d' | '30d' | 'all') => {
    if (onRangeChange && availableRanges[value]) {
      onRangeChange(value);
    }
  };
  
  // Keep track of displayed data and transition state
  const [displayedData, setDisplayedData] = useState(() => 
    interpolateChartData(chartData, 200)
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionData, setTransitionData] = useState(displayedData);
  
  // Animation value for smooth transitions
  const animationValue = useRef(new Animated.Value(0)).current;
  
  // Update displayed data with smooth transition when new data arrives
  useEffect(() => {
    if (chartData.length > 0 && !isLoading) {
      const newData = interpolateChartData(chartData, 200);
      
      // Start transition
      setIsTransitioning(true);
      animationValue.setValue(0);
      
      // Create interpolated data points for smooth transition
      const startData = [...displayedData];
      const endData = [...newData];
      
      // Animate from 0 to 1
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }).start(() => {
        setDisplayedData(newData);
        setTransitionData(newData);
        setIsTransitioning(false);
      });
      
      // Update transition data during animation
      const listener = animationValue.addListener(({ value }) => {
        const interpolatedPoints = startData.map((startPoint, index) => {
          const endPoint = endData[index] || startPoint;
          return {
            timestamp: startPoint.timestamp,
            price: startPoint.price + (endPoint.price - startPoint.price) * value,
          };
        });
        setTransitionData(interpolatedPoints);
      });
      
      return () => {
        animationValue.removeListener(listener);
      };
    }
    return undefined;
  }, [chartData, isLoading]);
  
  // Get position badge images
  const positionIcons = [Token1White, Token2White, Token3White];
  
  // Generate path for the chart
  const chartWidth = screenWidth - 48;
  const chartHeight = 150;
  const padding = 10;
  
  // Use transition data when animating, otherwise use displayed data
  const dataToRender = isTransitioning ? transitionData : displayedData;
  
  const prices = dataToRender.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;
  
  const points = dataToRender.map((data, index) => {
    const x = (index / (dataToRender.length - 1)) * (chartWidth - padding * 2) + padding;
    const y = chartHeight - padding - ((data.price - minPrice) / priceRange) * (chartHeight - padding * 2);
    return { x, y };
  });
  
  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  
  // Determine chart color based on price change
  const firstPrice = dataToRender[0]?.price || 0;
  const lastPrice = dataToRender[dataToRender.length - 1]?.price || 0;
  const isPositive = lastPrice >= firstPrice;
  const chartColor = isPositive ? CHART_COLORS.POSITIVE : CHART_COLORS.NEGATIVE;
  
  // Always create 3 display slots, filling with real holders where available
  const displayHolders = Array.from({ length: 3 }, (_, index) => {
    const realHolder = topHolders[index];
    if (realHolder) {
      return realHolder;
    }
    // Return placeholder for empty positions
    return {
      position: index + 1,
      image: '',
      wallet: '',
      holdings: 0,
      percentage: 0,
    };
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.label}>MARKET CAP</Text>
          <Text style={styles.value}>{marketCap}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <TouchableOpacity 
          style={styles.holderBlock}
          onPress={onPressHolders}
          disabled={!onPressHolders}
          activeOpacity={0.7}
        >
          <Text style={styles.label}>TOP HOLDERS</Text>
          <View style={styles.holdersContainer}>
            {displayHolders.map((holder, index) => (
              <View key={holder.position} style={styles.holderWrapper}>
                <Image source={positionIcons[index]} style={styles.positionBadge} />
                <Image 
                  source={
                    holder.image 
                      ? { uri: holder.image } 
                      : holder.wallet 
                        ? TopHolderIcon  // Has wallet but no image = non-user holder
                        : UserPlaceholder  // Empty position
                  } 
                  style={styles.holderAvatar} 
                />
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Chart */}
      <View style={styles.chartContainer}>
        {dataToRender.length > 0 ? (
          <Svg width={chartWidth} height={chartHeight}>
            <Path
              d={pathData}
              fill="none"
              stroke={chartColor}
              strokeWidth="2"
            />
            {/* Add dots for latest price */}
            {points.length > 0 && (
              <Circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="4"
                fill={chartColor}
              />
            )}
          </Svg>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No data available</Text>
          </View>
        )}
      </View>
      
      <View style={styles.timeframeContainer}>
        {timeframes.map((timeframe) => (
          <TouchableOpacity
            key={timeframe.value}
            style={[
              styles.timeframeButton,
              selectedRange === timeframe.value && styles.timeframeButtonActive,
              !availableRanges[timeframe.value] && styles.timeframeButtonDisabled,
            ]}
            onPress={() => handleTimeframeChange(timeframe.value)}
            disabled={!availableRanges[timeframe.value]}
          >
            <Text
              style={[
                styles.timeframeText,
                selectedRange === timeframe.value && styles.timeframeTextActive,
                !availableRanges[timeframe.value] && styles.timeframeTextDisabled,
              ]}
            >
              {timeframe.label}
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
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    fontFamily: fonts.secondaryMedium,
    color: colors.neutral[500],
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeframeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.neutral[100],
    borderRadius: 20,
  },
  timeframeButtonActive: {
    backgroundColor: colors.text.primary,
  },
  timeframeButtonDisabled: {
    backgroundColor: colors.neutral[50],
    opacity: 0.5,
  },
  timeframeText: {
    fontSize: 13,
    color: colors.text.primary,
    fontFamily: fonts.primaryMedium,
  },
  timeframeTextActive: {
    color: colors.text.secondary,
  },
  timeframeTextDisabled: {
    color: colors.neutral[300],
  },
}); 