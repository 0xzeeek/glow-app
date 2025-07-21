import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { colors, fonts } from '../../theme';
import { TokenHolding as TokenHoldingType } from '../../types';
import { TokenShareWhite } from '../../../assets';
import { formatMarketCap } from '../../utils';

interface TokenHoldingProps {
  holding: TokenHoldingType;
  backgroundImage?: string;
  onSharePress?: () => void;
}

export default function TokenHolding({ holding, backgroundImage, onSharePress }: TokenHoldingProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MY HOLDINGS</Text>
      
      <View style={styles.holdingContainer}>
        <ImageBackground 
          source={{ uri: backgroundImage }} 
          style={styles.pillBackground}
          imageStyle={styles.backgroundImage}
        >
          <View style={styles.greenOverlay}>
            <View style={styles.contentRow}>
              {/* Left side - Token info */}
              <View style={styles.leftSection}>
                <View style={styles.tokenImageContainer}>
                  <Image source={{ uri: holding.image }} style={styles.tokenImage} />
                </View>
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenName}>{holding.name}</Text>
                  <Text style={styles.tokenMarketCap}>
                    ${formatMarketCap(holding.marketCap)}
                  </Text>
                </View>
              </View>

              {/* Right side - Value and PnL */}
              <View style={styles.rightSection}>
                <Text style={styles.tokenValue}>${holding.value.toFixed(2)}</Text>
                {holding.pnlPercentage !== undefined && (
                  <Text style={[
                    styles.tokenPnl,
                    holding.pnlPercentage >= 0 ? styles.positiveChange : styles.negativeChange
                  ]}>
                    {holding.pnlPercentage >= 0 ? '▲' : '▼'} {Math.abs(holding.pnlPercentage).toFixed(2)}%
                  </Text>
                )}
              </View>

              {/* Share button */}
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={onSharePress}
              >
                <Image source={TokenShareWhite} style={styles.shareIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.primaryBold,
    marginBottom: 12,
    color: colors.neutral[500],
  },
  holdingContainer: {
    borderRadius: 100,
    overflow: 'hidden',
    height: 80,
  },
  pillBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  backgroundImage: {
    borderRadius: 20,
  },
  greenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 98, 8, 0.85)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.green.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontFamily: fonts.primaryBold,
    color: colors.background.primary,
    marginBottom: 4,
  },
  tokenMarketCap: {
    fontSize: 14,
    fontFamily: fonts.secondaryMedium,
    color: colors.neutral[500],
  },
  rightSection: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  tokenValue: {
    fontSize: 16,
    fontFamily: fonts.secondaryBold,
    color: colors.background.primary,
    marginBottom: 4,
  },
  tokenPnl: {
    fontSize: 14,
    fontFamily: fonts.secondary,
  },
  positiveChange: {
    color: colors.green.black,
  },
  negativeChange: {
    color: colors.red.black,
  },
  shareButton: {
    marginRight: -2,
  },
  shareIcon: {
    width: 44,
    height: 44,
  },
}); 