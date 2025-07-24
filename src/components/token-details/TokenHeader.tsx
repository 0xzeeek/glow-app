import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TokenEye,
  TokenEyeWhite,
  TokenShare,
  SocialX,
  SocialInstagram,
  SocialYoutube,
  SocialTiktok,
  SocialKick,
  SocialTwitch,
  SocialWeb,
} from '../../../assets';
import { colors, fonts } from '../../theme';
import { useWatchlistContext } from '../../contexts';
import { formatPercentage } from '@/utils';

interface TokenHeaderProps {
  name: string;
  price: string;
  priceChange: number;
  profileImage: string;
  backgroundVideo?: string;
  address: string;
  socialLinks?: {
    platform: string;
    handle: string;
    icon: string;
  }[];
}

export default function TokenHeader({
  name,
  price,
  priceChange,
  profileImage,
  backgroundVideo,
  address,
  socialLinks = [],
}: TokenHeaderProps) {
  const router = useRouter();
  const { isInWatchlist, toggleWatchlist } = useWatchlistContext();
  const isPositive = priceChange >= 0;
  const isWatched = isInWatchlist(address);

  const handleWatchlistToggle = async () => {
    // Add medium haptic feedback for watchlist toggle
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await toggleWatchlist(address);
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'x':
        return SocialX;
      case 'instagram':
        return SocialInstagram;
      case 'youtube':
        return SocialYoutube;
      case 'tiktok':
        return SocialTiktok;
      case 'kick':
        return SocialKick;
      case 'twitch':
        return SocialTwitch;
      case 'website':
        return SocialWeb;
      default:
        return null;
    }
  };

  const getSocialUrl = (platform: string, handle: string) => {
    switch (platform.toLowerCase()) {
      case 'x':
        return `https://x.com/${handle}`;
      case 'instagram':
        return `https://instagram.com/${handle}`;
      case 'youtube':
        return `https://youtube.com/@${handle}`;
      case 'tiktok':
        return `https://tiktok.com/@${handle}`;
      case 'kick':
        return `https://kick.com/${handle}`;
      case 'twitch':
        return `https://twitch.tv/${handle}`;
      case 'website':
        // For websites, the handle should already be a full URL
        return handle.startsWith('http') ? handle : `https://${handle}`;
      default:
        return null;
    }
  };

  const handleSocialPress = async (platform: string, handle: string) => {
    // Add light haptic feedback for social links
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = getSocialUrl(platform, handle);
    if (url) {
      try {
        await Linking.openURL(url);
      } catch (error) {
        console.error('Failed to open URL:', error);
      }
    }
  };

  // Get only the first 3 social links
  const topSocialLinks = socialLinks.slice(0, 3);

  return (
    <View style={styles.container}>
      {backgroundVideo && (
        <Video
          source={{ uri: backgroundVideo }}
          style={styles.backgroundVideo}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
        />
      )}
      <LinearGradient
        colors={['#2A4E68', '#002845']}
        style={styles.gradientOverlay}
      />
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => {
                // Add heavy haptic feedback
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                router.back();
              }}
              style={styles.iconButton}
            >
              <Ionicons name="chevron-back" size={24} color={colors.neutral[0]} />
            </TouchableOpacity>

            <View style={styles.rightSection}>
              <View style={styles.topIcons}>
                <TouchableOpacity style={styles.iconButton} onPress={handleWatchlistToggle}>
                  <Image source={isWatched ? TokenEyeWhite : TokenEye} style={[styles.icon]} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => {
                    // Add medium haptic feedback for share action
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    // TODO: Implement share functionality
                  }}
                >
                  <Image source={TokenShare} style={styles.icon} />
                </TouchableOpacity>
              </View>

              <View style={styles.socialIcons}>
                {topSocialLinks.map(social => {
                  const icon = getSocialIcon(social.platform);
                  if (!icon) return null;

                  return (
                    <TouchableOpacity
                      key={social.platform}
                      style={styles.socialButton}
                      onPress={() => handleSocialPress(social.platform, social.handle)}
                    >
                      <Image source={icon} style={styles.socialIcon} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.tokenInfo}>
            <View style={styles.profileImageContainer}>
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            </View>
            <View style={styles.tokenNameContainer}>
              <Text style={styles.tokenName}>{name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{price}</Text>
                <Text
                  style={[
                    styles.priceChange,
                    { color: isPositive ? colors.green.white : colors.red.white },
                  ]}
                >
                  {isPositive ? '▲' : '▼'} {formatPercentage(Math.abs(priceChange))}%
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 450,
    width: '100%',
    position: 'relative',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  overlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  topIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  socialIcons: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 12,
  },
  iconButton: {
    padding: 8,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  tokenInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -160,
    paddingHorizontal: 24,
  },
  profileImageContainer: {
    width: 114,
    height: 114,
    borderRadius: 57,
    borderColor: colors.green.black,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  tokenNameContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: 12,
  },
  tokenName: {
    fontSize: 18,
    fontFamily: fonts.primaryBold,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  priceRow: {
    alignItems: 'flex-start',
    gap: 8,
  },
  price: {
    fontSize: 30,
    fontFamily: fonts.secondaryMedium,
    color: colors.text.secondary,
  },
  priceChange: {
    fontSize: 14,
    fontFamily: fonts.secondaryMedium,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: colors.text.secondary,
  },
});
