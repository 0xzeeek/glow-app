import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface TokenStatsProps {
  marketCap: string;
  topHolders: {
    position: number;
    avatar: string;
  }[];
}

export default function TokenStats({ marketCap, topHolders }: TokenStatsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statBlock}>
        <Text style={styles.label}>MARKET CAP</Text>
        <Text style={styles.value}>{marketCap}</Text>
      </View>
      
      <View style={styles.statBlock}>
        <Text style={styles.label}>TOP HOLDERS</Text>
        <View style={styles.holdersContainer}>
          {topHolders.map((holder, index) => (
            <View key={holder.position} style={styles.holderWrapper}>
              <Image source={{ uri: holder.avatar }} style={styles.holderAvatar} />
              <View style={[styles.positionBadge, index === 0 && styles.firstPlace]}>
                <Text style={styles.positionText}>{holder.position}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  holdersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  holderWrapper: {
    position: 'relative',
  },
  holderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  positionBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#666666',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  firstPlace: {
    backgroundColor: '#FFD700',
  },
  positionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
}); 