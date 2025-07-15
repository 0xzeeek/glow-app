import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SocialX, SocialInstagram, SocialYoutube } from '../../../assets';
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
      case 'twitter':
        return SocialX;
      case 'instagram':
        return SocialInstagram;
      case 'youtube':
        return SocialYoutube;
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SOCIALS</Text>
      <View style={styles.socialList}>
        {socialLinks.map((social) => {
          const icon = getSocialIcon(social.platform);
          return (
            <TouchableOpacity key={social.platform} style={styles.socialRow}>
              <View style={styles.leftSection}>
                {icon && <Image source={icon} style={styles.socialIcon} />}
                <Text style={styles.platform}>{social.platform}</Text>
              </View>
              <View style={styles.rightSection}>
                <Text style={styles.handle}>{social.handle}</Text>
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