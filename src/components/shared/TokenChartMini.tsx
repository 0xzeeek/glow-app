import React, { useEffect, useRef, useMemo } from 'react';
import { StyleSheet, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface TokenChartMiniProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  /** Pre-calculated SVG path data to bypass all calculations */
  normalizedPath?: string;
}

const TokenChartMini = React.memo(({ 
  data, 
  color = '#00C853', 
  width = 60, 
  height = 30,
  normalizedPath
}: TokenChartMiniProps) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // Smooth transition when data changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [data, normalizedPath, fadeAnim]);
  
  // Use pre-normalized path if provided, otherwise calculate it
  const pathData = useMemo(() => {
    // If normalized path is provided, use it directly
    if (normalizedPath) {
      return normalizedPath;
    }
    
    // Otherwise, calculate the path (existing optimization)
    if (!data || data.length === 0) {
      return '';
    }
    
    // Calculate min/max in a single pass for better performance
    let min = data[0];
    let max = data[0];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i] < min) min = data[i];
      if (data[i] > max) max = data[i];
    }
    
    const range = max - min || 1;
    
    // Build path data directly without intermediate points array
    const pathParts: string[] = [];
    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((data[i] - min) / range) * height;
      pathParts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    
    return pathParts.join(' ');
  }, [data, width, height, normalizedPath]);
  
  return (
    <Animated.View style={[styles.container, { width, height, opacity: fadeAnim }]}>
      <Svg width={width} height={height}>
        <Path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );
});

TokenChartMini.displayName = 'TokenChartMini';

export default TokenChartMini;

// Export utility function to pre-normalize chart data
export function normalizeChartData(data: number[], width: number, height: number): string {
  if (!data || data.length === 0) return '';
  
  let min = data[0];
  let max = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i] < min) min = data[i];
    if (data[i] > max) max = data[i];
  }
  
  const range = max - min || 1;
  
  const pathParts: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((data[i] - min) / range) * height;
    pathParts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  
  return pathParts.join(' ');
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 