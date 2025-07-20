import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

interface PurchaseSuccessProps {
  tokenName: string;
  tokenImage: string;
  percentageGain: number;
  purchaseDate?: Date;
  onShareGains: () => void;
  onClose: () => void;
}

export default function PurchaseSuccess({
  tokenName,
  tokenImage,
  percentageGain,
  purchaseDate = new Date(),
  onShareGains,
  onClose,
}: PurchaseSuccessProps) {
  const formatDate = (date: Date) => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={28} color="#666" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.profileContainer}>
            <Image source={{ uri: tokenImage }} style={styles.profileImage} />
          </View>
          
          <Text style={styles.tokenName}>{tokenName}</Text>
          
          <Text style={[styles.percentage, percentageGain >= 0 ? styles.positiveGain : styles.negativeGain]}>
            {percentageGain >= 0 ? '+' : ''}{percentageGain.toFixed(2)}%
          </Text>
          
          <Text style={styles.sinceText}>SINCE {formatDate(purchaseDate)}</Text>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={onShareGains}>
          <Text style={styles.shareButtonText}>SHARE GAINS</Text>
          <Ionicons name="share-outline" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  profileContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 3,
    // TODO: update this color
    borderColor: '#00FF88',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  tokenName: {
    fontSize: 24,
    color: colors.text.secondary,
    marginBottom: 20,
    fontFamily: fonts.primary,
  },
  percentage: {
    fontSize: 60,
    marginBottom: 10,
    fontFamily: 'DGMTypeset-Regular',
  },
  positiveGain: {
    // TODO: update this color
    color: '#00FF88',
  },
  negativeGain: {
    // TODO: update this color
    color: '#FF3366',
  },
  sinceText: {
    fontSize: 14,
    color: '#666',
    letterSpacing: 1,
    fontFamily: fonts.primary,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    justifyContent: 'space-between',
  },
  shareButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    letterSpacing: 1,
    fontFamily: fonts.primary,
  },
}); 