import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SocialX, SocialInstagram, SocialYoutube, SocialTiktok, SocialKick, SocialTwitch, SocialWeb } from '../../../assets';
import { colors, fonts } from '../../theme';

interface TokenSocialsProps {
  socialLinks: {
    platform: string;
    handle: string;
    icon: string;
  }[];
}

export default function TokenSocials({ socialLinks }: TokenSocialsProps) {
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
  
  const formatDisplayHandle = (platform: string, handle: string) => {
    if (platform.toLowerCase() === 'website') {
      // Remove http:// or https:// from website URLs for display
      return handle.replace(/^https?:\/\//, '');
    }
    return handle;
  };
  
  const handleSocialPress = async (platform: string, handle: string) => {
    const url = getSocialUrl(platform, handle);
    if (url) {
      try {
        await Linking.openURL(url);
      } catch (error) {
        console.error('Failed to open URL:', error);
      }
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SOCIALS</Text>
      <View style={styles.socialList}>
        {socialLinks.map((social) => {
          const icon = getSocialIcon(social.platform);
          const displayHandle = formatDisplayHandle(social.platform, social.handle);
          
          return (
            <TouchableOpacity 
              key={social.platform} 
              style={styles.socialRow}
              onPress={() => handleSocialPress(social.platform, social.handle)}
            >
              <View style={styles.leftSection}>
                {icon && <Image source={icon} style={styles.socialIcon} />}
                <Text style={styles.platform}>{social.platform}</Text>
              </View>
              <View style={styles.rightSection}>
                <Text style={styles.handle}>{displayHandle}</Text>
                <Ionicons name="chevron-forward" size={10} color={colors.text.primary} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.primaryBold,
    color: colors.neutral[500],
    marginBottom: 16,
  },
  socialList: {
    gap: 14,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  socialIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  platform: {
    fontSize: 14,
    fontFamily: fonts.primaryMedium,
    color: colors.neutral[500],
  },
  handle: {
    fontSize: 16,
    fontFamily: fonts.secondary,
    color: colors.text.primary,
  },
}); 