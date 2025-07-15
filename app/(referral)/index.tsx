import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { Button } from '@/components/shared/Button';
import { useUser } from '@/contexts/UserContext';
import { colors, fonts } from '@/theme';
import { BackgroundReferral, ReferralProfile, ReferralQuestion } from '../../assets';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ReferralScreen() {
  const { profileImage } = useUser();

  const handleLearnMore = () => {
    console.log('Learn more pressed');
  };

  const handleInviteFriends = () => {
    console.log('Invite friends pressed');
  };

  return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Lifetime Rewards Card */}
        <View style={styles.rewardsCard}>
          <Text style={styles.rewardsLabel}>LIFETIME REWARDS</Text>
          <Text style={styles.rewardsAmount}>$0</Text>
        </View>

        {/* Title and Description */}
        <Text style={styles.title}>Invite friends, Make Money</Text>
        <Text style={styles.description}>
          The more your friends (and their friends trade), the more you all make
        </Text>

        {/* Learn More Button */}
        <Button
          title="LEARN MORE"
          onPress={handleLearnMore}
          variant="primary"
          icon={ReferralQuestion}
          style={styles.learnMoreButton}
        />

        <View style={styles.circleImageContainer}>
          <Image source={BackgroundReferral} style={styles.circleImage} />
        </View>

        {/* Circular Referral Visualization */}
        <View style={styles.circularContainer}>
          {/* Outer Ring - 3rd tier */}
          <View style={styles.outerRing}>
            <View style={[styles.badge, styles.badge3rd]}>
              <View style={styles.badgeInner}>
                <Text style={styles.badgeNumber}>0</Text>
                <Image source={ReferralProfile} style={styles.badgeIcon} />
                <Text style={styles.badgePercentage}>5%</Text>
              </View>
            </View>
            <Text style={styles.ringLabel3rd}>3rd</Text>
          </View>

          {/* Middle Ring - 2nd tier */}
          <View style={styles.middleRing}>
            <View style={[styles.badge, styles.badge2nd]}>
              <View style={styles.badgeInner}>
                <Text style={styles.badgeNumber}>0</Text>
                <Image source={ReferralProfile} style={styles.badgeIcon} />
                <Text style={styles.badgePercentage}>10%</Text>
              </View>
            </View>
            <Text style={styles.ringLabel2nd}>2nd</Text>
          </View>

          {/* Inner Ring - 1st tier */}
          <View style={styles.innerRing}>
            <View style={[styles.badge, styles.badge1st]}>
              <View style={styles.badgeInner}>
                <Text style={styles.badgeNumber}>0</Text>
                <Image source={ReferralProfile} style={styles.badgeIcon} />
                <Text style={styles.badgePercentage}>25%</Text>
              </View>
            </View>
            <Text style={styles.ringLabel1st}>1st referrals</Text>
          </View>

          {/* Center - User Avatar */}
          <View style={styles.centerCircle}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.userAvatar} />
            ) : (
              <View style={styles.placeholderAvatar} />
            )}
            <Text style={styles.youText}>You</Text>
          </View>
        </View>

        {/* Invite Friends Button */}
        <Button
          title="INVITE FRIENDS"
          onPress={handleInviteFriends}
          variant="primary"
          style={styles.inviteButton}
        />
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  rewardsCard: {
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 40,
    alignItems: 'flex-start',
    marginBottom: 30,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  rewardsLabel: {
    fontFamily: fonts.primaryBold,
    fontSize: 14,
    color: colors.neutral[500],
    marginBottom: 8,
  },
  rewardsAmount: {
    fontFamily: fonts.secondaryMedium,
    fontSize: 46,
    color: colors.text.primary,
  },
  title: {
    fontFamily: fonts.primaryMedium,
    fontSize: 24,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontFamily: fonts.primary,
    fontSize: 16,
    color: colors.neutral[500],
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    lineHeight: 22,
  },
  learnMoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  circleImageContainer: {
    position: 'absolute',
    zIndex: -100,
    top: 300,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  circularContainer: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.85,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  outerRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleRing: {
    position: 'absolute',
    width: '70%',
    height: '70%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    position: 'absolute',
    width: '45%',
    height: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCircle: {
    width: '25%',
    height: '25%',
    backgroundColor: '#FFFFFF',
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: '75%',
    height: '75%',
    borderRadius: 1000,
    marginBottom: 5,
  },
  placeholderAvatar: {
    width: '75%',
    height: '75%',
    borderRadius: 1000,
    backgroundColor: colors.neutral[200],
    marginBottom: 5,
  },
  youText: {
    fontFamily: fonts.primary,
    fontSize: 12,
    color: colors.text.primary,
  },
  badge: {
    position: 'absolute',
    backgroundColor: colors.background.primary,
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeNumber: {
    fontFamily: fonts.primaryMedium,
    fontSize: 14,
    color: colors.text.primary,
  },
  badgeIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  badgePercentage: {
    fontFamily: fonts.primaryBold,
    fontSize: 16,
    color: '#00C896',
  },
  badge3rd: {
    top: '30%',
    left: -10,
  },
  badge2nd: {
    top: '25%',
    left: -10,
  },
  badge1st: {
    top: '15%',
    left: -10,
  },
  ringLabel3rd: {
    position: 'absolute',
    bottom: '30%',
    right: 20,
    fontFamily: fonts.primary,
    fontSize: 12,
    color: colors.text.secondary,
  },
  ringLabel2nd: {
    position: 'absolute',
    bottom: '25%',
    right: 15,
    fontFamily: fonts.primary,
    fontSize: 12,
    color: colors.text.secondary,
  },
  ringLabel1st: {
    position: 'absolute',
    bottom: '15%',
    right: 10,
    fontFamily: fonts.primary,
    fontSize: 12,
    color: colors.text.secondary,
  },
  inviteButton: {
    width: '100%',
  },
});
