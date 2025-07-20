import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Token } from '@/types';
import { colors } from '@/theme/colors';
import { CHART_COLORS } from '@/utils/constants';
import { formatPercentage } from '@/utils';

const ITEM_WIDTH = 80; // Width of each mover item including margin

interface TopMoversProps {
  data: (Token & { change24h: number })[];
}

export default function TopMovers({ data }: TopMoversProps) {
  const router = useRouter();
  const [tokenOrder, setTokenOrder] = useState<string[]>([]);
  const animatedValuesRef = useRef<Map<string, { animatedValue: Animated.ValueXY; opacityValue: Animated.Value }>>(new Map());
  const previousOrderRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    // Sort data by actual percentage change (highest gains first)
    const sortedData = [...data].sort((a, b) => b.change24h - a.change24h);
    const previousPositions = previousOrderRef.current;
    const newPositions = new Map<string, number>();

    // Update positions map
    sortedData.forEach((token, index) => {
      newPositions.set(token.address, index);
    });

    // Get or create animated values for each token
    sortedData.forEach((token, newIndex) => {
      const existingAnimValues = animatedValuesRef.current.get(token.address);
      const oldIndex = previousPositions.get(token.address);
      
      if (existingAnimValues) {
        if (oldIndex !== undefined && oldIndex !== newIndex) {
          // Animate position change
          Animated.parallel([
            Animated.spring(existingAnimValues.animatedValue.x, {
              toValue: newIndex * ITEM_WIDTH,
              tension: 60,
              friction: 10,
              useNativeDriver: true,
            }),
            // Slight vertical bounce for visual interest
            Animated.sequence([
              Animated.timing(existingAnimValues.animatedValue.y, {
                toValue: -10,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.spring(existingAnimValues.animatedValue.y, {
                toValue: 0,
                tension: 40,
                friction: 6,
                useNativeDriver: true,
              }),
            ]),
          ]).start();
        }
      } else {
        // New token - create animated values and fade in
        const animatedValue = new Animated.ValueXY({
          x: newIndex * ITEM_WIDTH,
          y: 0,
        });
        const opacityValue = new Animated.Value(0);
        
        animatedValuesRef.current.set(token.address, { animatedValue, opacityValue });
        
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });
    
    // Handle removed tokens (fade out)
    animatedValuesRef.current.forEach((animValues, address) => {
      if (!sortedData.find(t => t.address === address)) {
        Animated.timing(animValues.opacityValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          // Clean up after fade out animation completes
          animatedValuesRef.current.delete(address);
        });
      }
    });

    // Update state with sorted order
    setTokenOrder(sortedData.map(t => t.address));
    
    // Update previous positions
    previousOrderRef.current = newPositions;
  }, [data]);

  const renderItem = (address: string) => {
    const token = data.find(t => t.address === address);
    const animValues = animatedValuesRef.current.get(address);
    
    if (!token || !animValues) return null;
    
    const isPositive = token.change24h >= 0;
    const arrow = isPositive ? '▲' : '▼';
    const changeColor = isPositive ? CHART_COLORS.POSITIVE : CHART_COLORS.NEGATIVE;

    return (
      <Animated.View
        key={address}
        style={[
          styles.animatedContainer,
          {
            opacity: animValues.opacityValue,
            transform: [
              { translateX: animValues.animatedValue.x },
              { translateY: animValues.animatedValue.y },
            ],
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.moverItem}
          onPress={() => router.push(`/(token)/${token.address}`)}
          activeOpacity={0.7}
        >
          <View style={styles.avatarContainer}>
            <Image source={{ uri: token.image }} fadeDuration={0} style={styles.profileImage} />
          </View>
          <Text 
            style={[styles.changeText, { color: changeColor }]}
          >
            {arrow} {formatPercentage(Math.abs(token.change24h))}%
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const contentWidth = tokenOrder.length * ITEM_WIDTH;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { width: contentWidth }]}
        scrollEventThrottle={16}
      >
        <View style={styles.contentContainer}>
          {tokenOrder.map(renderItem)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  contentContainer: {
    height: 80,
    position: 'relative',
  },
  animatedContainer: {
    position: 'absolute',
    width: ITEM_WIDTH,
    height: '100%',
  },
  moverItem: {
    alignItems: 'center',
    width: ITEM_WIDTH, // Adjusted to give some padding but use most of the container width
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 100,
    borderColor: colors.neutral[300],
    borderWidth: 1,
    marginBottom: 8,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 28,
  },
  changeText: {
    fontSize: 13,
    textAlign: 'center',
    minWidth: 60, // Ensure enough width for arrow + percentage
  },
}); 