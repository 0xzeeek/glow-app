import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import { Button } from '@/components/shared/Button';
import { colors, fonts } from '@/theme';
import {
  ReferralBackground,
  ReferralOne,
  ReferralTwo,
  ReferralThree,
  ReferralArrow,
} from '../../assets';
import { useUser } from '../../src/contexts/UserContext';
import { useUserProfile } from '../../src/hooks/useUserQueries';

export default function ReferralScreen() {
  const { feesEarned, walletAddress } = useUser();
  const { refetch: refetchUserProfile } = useUserProfile(walletAddress);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchUserProfile();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchUserProfile]);

  const handleInviteFriends = () => {
    console.log('Invite friends pressed');
  };

  const [referralCount, setReferralCount] = useState({
    one: 0,
    two: 0,
    three: 0,
  });

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  return (
    <ImageBackground source={ReferralBackground} style={styles.container} resizeMode="cover">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.neutral[500]]}
            tintColor={colors.neutral[500]}
          />
        }
      >
        {/* Lifetime Rewards Card */}
        <View style={styles.rewardsCard}>
          <Text style={styles.rewardsLabel}>LIFETIME REWARDS</Text>
          <Text style={styles.rewardsAmount}>{formatCurrency(feesEarned || 0)}</Text>
        </View>

        {/* Title and Description */}
        <Text style={styles.title}>Invite friends, Make Money</Text>
        <Text style={styles.description}>
          The more your friends (and their friends trade), the more you all make
        </Text>

        {/* Referral Structure */}
        <View style={styles.referralContainer}>
          <View style={styles.pillContainer}>
            <View style={[styles.countContainer, styles.one]}>
              <Text style={styles.countText}>{referralCount.one}</Text>
            </View>
            <Image source={ReferralOne} style={styles.percentagePillOne} />
            <Text style={styles.levelDescription}>of your friend's fees</Text>
          </View>
          <Image source={ReferralArrow} style={styles.arrow} />
          <View style={styles.pillContainer}>
            <View style={[styles.countContainer, styles.two]}>
              <Text style={styles.countText}>{referralCount.two}</Text>
            </View>
            <Image source={ReferralTwo} style={styles.percentagePillTwo} />
            <Text style={styles.levelDescription}>from their friends</Text>
          </View>
            <Image source={ReferralArrow} style={styles.arrow} />
            <View style={styles.pillContainer}>
              <View style={[styles.countContainer, styles.three]}>
                <Text style={styles.countText}>{referralCount.three}</Text>
              </View>
              <Image source={ReferralThree} style={styles.percentagePillThree} />
              <Text style={styles.levelDescription}>from their friend's friend</Text>
            </View>
        </View>

        {/* Bottom Text */}
        <Text style={styles.bottomText}>No limits. No catch. Just rewards.</Text>
      </ScrollView>

      <View style={styles.inviteButtonContainer}>
        <Button
          title="INVITE FRIENDS"
          onPress={handleInviteFriends}
          variant="primary"
          style={styles.inviteButton}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 120,
    alignItems: 'center',
  },
  rewardsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 22,
    alignItems: 'flex-start',
    marginBottom: 40,
    width: '100%',
  },
  rewardsLabel: {
    fontFamily: fonts.primaryBold,
    fontSize: 14,
    color: colors.green.black,
    marginBottom: 8,
    letterSpacing: 1,
  },
  rewardsAmount: {
    fontFamily: fonts.secondaryMedium,
    fontSize: 46,
    color: colors.text.secondary,
  },
  title: {
    fontFamily: fonts.primaryMedium,
    fontSize: 22,
    color: colors.green.black,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontFamily: fonts.primary,
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.6,
  },
  referralContainer: {
    alignItems: 'center',
    marginBottom: 50,
    gap: 10,
  },
  pillContainer: {
    position: 'relative',
    alignItems: 'center',
    gap: 10,
  },
  countContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 20,
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#666666',
    zIndex: 1,
  },
  one: {
    top: -8,
    left: 32,
  },
  two: {
    top: -8,
    left: 10,
  },
  three: {
    top: -8,
    left: 35,
  },
  countText: {
    fontFamily: fonts.secondaryMedium,
    fontSize: 12,
    color: colors.green.black,
  },
  arrow: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    paddingVertical: 6,
  },
  peopleIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  personIconOffset: {
    marginLeft: -6,
  },
  personIconOffset2: {
    marginLeft: -12,
  },
  percentagePillOne: {
    width: 96,
    height: 32,
    resizeMode: 'contain',
  },
  percentagePillTwo: {
    width: 122,
    height: 32,
    resizeMode: 'contain',
  },
  percentagePillThree: {
    width: 137,
    height: 32,
    resizeMode: 'contain',
  },
  levelDescription: {
    fontFamily: fonts.primary,
    fontSize: 16,
    color: colors.text.secondary,
    opacity: 0.6,
  },
  bottomText: {
    fontFamily: fonts.primaryMedium,
    fontSize: 22,
    color: colors.green.black,
    textAlign: 'center',
  },
  inviteButtonContainer: {
    position: 'absolute',
    bottom: 10,
    width: '90%',
    alignSelf: 'center',
  },
  inviteButton: {
    width: '100%',
  },
});
