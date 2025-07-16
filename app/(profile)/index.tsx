import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import BottomNav from '../../src/components/navigation/BottomNav';
import { ProfileSettings, ProfileExplore, ProfileDepositWhite, ProfileDeposit, ProfileCash, ProfileShare } from '../../assets';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { useUser } from '../../src/contexts/UserContext';
import { Button } from '../../src/components/shared/Button';
import DepositModal from '../../src/components/shared/DepositModal';
import CashOutModal from '../../src/components/shared/CashOutModal';
import { Profile } from '../../assets';

export default function ProfileScreen() {
  const { 
    image, 
    username, 
    cashBalance, 
    portfolio, 
    getTotalPortfolioValue 
  } = useUser();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showCashOutModal, setShowCashOutModal] = useState(false);
  const router = useRouter();

  const totalPortfolioValue = getTotalPortfolioValue() + cashBalance;
  const hasTokens = portfolio.length > 0;
  const hasCash = cashBalance > 0;

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
          <Text style={styles.balanceAmount}>${totalPortfolioValue.toFixed(2)}</Text>
          <Text style={styles.buyingPowerText}>BUYING POWER ${Math.floor(cashBalance)}</Text>

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
              {portfolio.map((token) => (
                <TouchableOpacity 
                  key={token.tokenId}
                  style={styles.tokenRow}
                  onPress={() => handleTokenPress(token.tokenId)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: token.tokenImage }} style={styles.tokenImage} />
                  <View style={styles.tokenInfo}>
                    <Text style={styles.tokenName}>{token.tokenName}</Text>
                    <Text style={styles.tokenMarketCap}>$35M</Text>
                  </View>
                  <View style={styles.tokenValueSection}>
                    <Text style={styles.tokenValue}>${(token.currentPrice * token.quantity).toFixed(3)}</Text>
                    <Text style={[
                      styles.tokenChange,
                      token.gainsPercentage >= 0 ? styles.positiveChange : styles.negativeChange
                    ]}>
                      {token.gainsPercentage >= 0 ? '▲' : '▼'} {Math.abs(token.gainsPercentage).toFixed(2)}%
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.shareButton}
                    onPress={() => handleShareToken(token.tokenName, token.gainsPercentage)}
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  tokenImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
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
  tokenMarketCap: {
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
  tokenChange: {
    fontSize: 14,
    fontFamily: fonts.secondary,
  },
  positiveChange: {
    color: colors.green.black,
  },
  negativeChange: {
    color: '#FF3B30',
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
