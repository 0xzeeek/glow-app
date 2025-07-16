import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { Button } from '@/components/shared/Button';
import { colors, fonts } from '@/theme';
import { ReferralCircle, ReferralQuestion } from '../../assets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ReferralScreen() {

  const handleLearnMore = () => {
    console.log('Learn more pressed');
  };

  const handleInviteFriends = () => {
    console.log('Invite friends pressed');
  };

  return (
    <>
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
          <Image source={ReferralCircle} style={styles.circleImage} />
        </View>
      </ScrollView>

      <View style={styles.inviteButtonContainer}>
        <Button
          title="INVITE FRIENDS"
          onPress={handleInviteFriends}
          variant="secondary"
          style={styles.inviteButton}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    marginTop: -20,
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  rewardsCard: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
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
  inviteButtonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '90%',
    alignSelf: 'center',
  },
  inviteButton: {
    width: '100%',
  },
});
