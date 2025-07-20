import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import BottomNav from '../../src/components/navigation/BottomNav';
import { ProfileSettings, ProfileExplore, ProfileDepositWhite, ProfileDeposit, ProfileCash, ProfileShare } from '../../assets';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { useUser } from '../../src/contexts/UserContext';
import { useCountingAnimation, useHoldingsPriceUpdates } from '../../src/hooks';
import { Button } from '../../src/components/shared/Button';
import DepositModal from '../../src/components/shared/DepositModal';
import CashOutModal from '../../src/components/shared/CashOutModal';
import { Profile } from '../../assets';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

export default function ProfileScreen() {
  const { 
    image, 
    username, 
    totalUsdValue,
    usdcBalance,
    tokenHoldings,
    walletAddress
  } = useUser();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showCashOutModal, setShowCashOutModal] = useState(false);
  const router = useRouter();

  // Subscribe to live price updates for all holdings
  useHoldingsPriceUpdates({
    walletAddress,
    tokenHoldings,
  });

  console.log('tokenHoldings', tokenHoldings);

  // Use totalUsdValue from wallet holdings
  const totalValue = totalUsdValue;
  // Use the counting animation hook for the total value
  const { displayValue, bounceScale } = useCountingAnimation(totalValue, {
    duration: 1000,      // Slightly slower for bigger numbers
    enableBounce: true
  });
  
  // Filter out USDC from token holdings
  const nonUsdcTokens = tokenHoldings.filter(token => token.symbol !== 'USDC');
  const hasTokens = nonUsdcTokens.length > 0;
  const hasCash = usdcBalance > 0;

  // Animated style for the balance amount
  const animatedBalanceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounceScale.value }],
  }));

  const handleDeposit = () => {
    setShowDepositModal(true);
  };

  const handleExplore = () => {
    router.replace('/(home)');
  };

  const handleCashOut = () => {
    if (hasCash) {
      setShowCashOutModal(true);
    }
  };

  const handleShareToken = (tokenName: string, gains: number) => {
    console.log(`Share ${tokenName} with ${gains}% gains`);
    // TODO: Implement share functionality
  };

  const handleTokenPress = (tokenId: string) => {
    router.push(`/(token)/${tokenId}`);
  };

  const handleSettings = () => {
    router.push('/(settings)');
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.gradientBackground}>
          {/* Settings Icon */}
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
            <Image source={ProfileSettings} style={styles.settingsIcon} />
          </TouchableOpacity>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageWrapper}>
              <Image 
                source={{ uri: image || Profile }} 
                style={styles.profileImage} 
              />
            </View>
            <Text style={styles.username}>{username || ''}</Text>
          </View>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <Animated.Text style={[styles.balanceAmount, animatedBalanceStyle]}>
            ${displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Animated.Text>
          <Text style={styles.buyingPowerText}>BUYING POWER ${Math.floor(usdcBalance)}</Text>

          <View style={styles.buttonRow}>
            <Button
              title="DEPOSIT"
              onPress={handleDeposit}
              variant={hasCash ? "filled" : "secondary"}
              icon={hasCash ? ProfileDeposit : ProfileDepositWhite}
              style={styles.actionButton}
            />
            <Button
              title="CASH OUT"
              onPress={handleCashOut}
              variant={"filled"}
              icon={ProfileCash}
              disabled={!hasCash}
              style={styles.actionButton}
            />
          </View>
        </View>

        {/* Holdings Section */}
        <View style={styles.holdingsSection}>
          {hasTokens ? (
            <>
              <Text style={styles.holdingsTitle}>HOLDINGS</Text>
              {nonUsdcTokens.map((token) => (
                <TouchableOpacity 
                  key={token.address}
                  style={styles.tokenRow}
                  onPress={() => handleTokenPress(token.address)}
                  activeOpacity={0.7}
                >
                  <View style={styles.tokenImageContainer}>
                    <Image source={{ uri: token.image }} style={styles.tokenImage} />
                  </View>
                  <View style={styles.tokenInfo}>
                    <Text style={styles.tokenName}>{token.name}</Text>
                    <Text style={styles.tokenBalance}>{token.balance.toFixed(2)} {token.symbol}</Text>
                  </View>
                  <View style={styles.tokenValueSection}>
                    <Text style={styles.tokenValue}>${token.value.toFixed(2)}</Text>
                    {token.pnlPercentage !== undefined && (
                      <Text style={[
                        styles.tokenPnl,
                        token.pnlPercentage >= 0 ? styles.positiveChange : styles.negativeChange
                      ]}>
                        {token.pnlPercentage >= 0 ? '▲' : '▼'} {Math.abs(token.pnlPercentage).toFixed(2)}%
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity 
                    style={styles.shareButton}
                    onPress={() => handleShareToken(token.name, 0)}
                  >
                    <Image source={ProfileShare} style={styles.shareIcon} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={styles.noHoldingsContainer}>
              <Text style={styles.noHoldingsTitle}>No Holdings Yet</Text>
              <Text style={styles.noHoldingsText}>Holdings you own will show up here</Text>

              <Button
                title="EXPLORE"
                onPress={handleExplore}
                variant="filled"
                icon={ProfileExplore}
                style={styles.exploreButton}
              />
            </View>
          )}
        </View>

        {/* Bottom spacing for nav */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <BottomNav activeTab="profile" />
      </View>

      <DepositModal
        visible={showDepositModal}
        onClose={() => setShowDepositModal(false)}
      />
      
      <CashOutModal
        visible={showCashOutModal}
        onClose={() => setShowCashOutModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  gradientBackground: {
    height: 320,
    paddingTop: 60,
    alignItems: 'center',
    // TOOD: move this to colors
    backgroundColor: '#4B79A1',
  },
  settingsButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    width: 24,
    height: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 30,
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.background.primary,
    marginBottom: 16,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 100,
  },
  username: {
    fontSize: 30,
    fontFamily: fonts.primaryBold,
    color: colors.text.secondary,
    marginBottom: 20,
  },
  balanceSection: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'flex-start',
    marginTop: -50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: colors.neutral[1000],
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  balanceAmount: {
    fontSize: 46,
    fontFamily: fonts.secondaryMedium,
    color: colors.text.primary,
    marginBottom: 8,
  },
  buyingPowerText: {
    fontSize: 14,
    fontFamily: fonts.primaryMedium,
    color: colors.neutral[500],
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  actionButton: {
    width: '50%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  holdingsSection: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  holdingsTitle: {
    fontSize: 14,
    fontFamily: fonts.primaryMedium,
    color: colors.neutral[500],
    letterSpacing: 1,
    marginBottom: 20,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  tokenImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  tokenImageText: {
    fontSize: 20,
    fontFamily: fonts.primaryBold,
    color: colors.text.primary,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontFamily: fonts.primaryMedium,
    color: colors.text.primary,
    marginBottom: 4,
  },
  tokenBalance: {
    fontSize: 14,
    fontFamily: fonts.secondary,
    color: colors.neutral[500],
  },
  tokenValueSection: {
    alignItems: 'flex-end',
    marginRight: 16,
  },
  tokenValue: {
    fontSize: 16,
    fontFamily: fonts.primaryMedium,
    color: colors.text.primary,
    marginBottom: 4,
  },
  tokenPnl: {
    fontSize: 14,
    fontFamily: fonts.secondary,
    color: colors.neutral[500],
  },
  tokenChange: {
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
    padding: 8,
  },
  shareIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
  },
  noHoldingsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noHoldingsTitle: {
    fontSize: 24,
    fontFamily: fonts.primaryMedium,
    color: colors.text.primary,
    marginBottom: 8,
  },
  noHoldingsText: {
    fontSize: 16,
    fontFamily: fonts.secondary,
    color: colors.neutral[500],
    marginBottom: 32,
  },
  exploreButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: 'auto',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
  },
});
