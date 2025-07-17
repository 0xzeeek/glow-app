import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Token } from '@/types';
import { colors } from '@/theme/colors';
import { CHART_COLORS } from '@/utils/constants';

interface TopMoversProps {
  data: Token[];
}

export default function TopMovers({ data }: TopMoversProps) {
  const router = useRouter();
  // Sort data from highest to lowest percentage change
  const sortedData = [...data].sort((a, b) => b.change24h - a.change24h);
  
  const renderItem = ({ item }: { item: Token }) => {
    const isPositive = item.change24h >= 0;
    const arrow = isPositive ? '▲' : '▼';
    const changeColor = isPositive ? CHART_COLORS.POSITIVE : CHART_COLORS.NEGATIVE;

    return (
      <TouchableOpacity 
        style={styles.moverItem}
        onPress={() => router.push(`/(token)/${item.address}`)}
      >
        <View style={styles.avatarContainer} >
          <Image source={{ uri: item.image }} style={styles.profileImage} />
        </View>
        <Text style={[styles.changeText, { color: changeColor }]}>
          {arrow} {Math.abs(item.change24h)}%
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={sortedData}
        keyExtractor={(item) => item.address}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  moverItem: {
    alignItems: 'center',
    marginRight: 20,
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
    fontWeight: '600',
  },
}); 