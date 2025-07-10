import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

interface TokenChartProps {
  chartData: {
    timestamp: number;
    price: number;
  }[];
}

const timeframes = ['LIVE', '4H', '1D', '1W', '1M', 'MAX'];

export default function TokenChart({ chartData }: TokenChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  
  // Generate path for the chart
  const chartWidth = screenWidth - 32;
  const chartHeight = 200;
  const padding = 20;
  
  const prices = chartData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  
  const points = chartData.map((data, index) => {
    const x = (index / (chartData.length - 1)) * (chartWidth - padding * 2) + padding;
    const y = chartHeight - padding - ((data.price - minPrice) / priceRange) * (chartHeight - padding * 2);
    return { x, y };
  });
  
  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  
  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Grid lines */}
          {[0, 1, 2, 3].map((i) => (
            <Line
              key={i}
              x1={padding}
              y1={padding + (i * (chartHeight - padding * 2)) / 3}
              x2={chartWidth - padding}
              y2={padding + (i * (chartHeight - padding * 2)) / 3}
              stroke="#F0F0F0"
              strokeWidth="1"
            />
          ))}
          
          {/* Chart line */}
          <Path
            d={pathData}
            fill="none"
            stroke="#00C853"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
  },
  chartContainer: {
    height: 200,
    marginBottom: 16,
  },
  timeframeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  timeframeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  timeframeButtonActive: {
    backgroundColor: '#E0E0E0',
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  timeframeTextActive: {
    color: '#000000',
  },
}); 