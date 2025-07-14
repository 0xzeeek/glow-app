import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { TopMover } from '../../data/mockTokens';
import { colors } from '@/theme/colors';

interface TopMoversProps {
  data: TopMover[];
}

export default function TopMovers({ data }: TopMoversProps) {
  const router = useRouter();
  // Sort data from highest to lowest percentage change
  const sortedData = [...data].sort((a, b) => b.changePercent - a.changePercent);
  
  const renderItem = ({ item }: { item: TopMover }) => {
    const isPositive = item.changePercent >= 0;
    const changeColor = isPositive ? '#00C853' : '#FF3366';
    const arrow = isPositive ? '▲' : '▼';
    
    return (
      <TouchableOpacity 
        style={styles.moverItem}
        onPress={() => router.push(`/(token)/${item.id}`)}
      >
        <View style={styles.avatarContainer} >
          <Image source={{ uri: item.image }} style={styles.profileImage} />
        </View>
        <Text style={[styles.changeText, { color: changeColor }]}>
          {arrow} {Math.abs(item.changePercent)}%
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
        keyExtractor={(item) => item.id}
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