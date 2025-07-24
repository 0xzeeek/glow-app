import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { useUser } from '../../src/contexts/UserContext';
import SignOutModal from '../../src/components/shared/SignOutModal';
import { 
  SettingsSprial,
  SettingsNotifications,
  SettingsRate,
  SettingsLegal,
  SettingsSignOut,
  SocialX,
  SocialInstagram,
  SettingsProfile
} from '../../assets';

export default function SettingsScreen() {
  const router = useRouter();
  const { username, image, signOut } = useUser();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(settings)/edit-profile');
  };

  const handleNotifications = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(settings)/notifications');
  };

  const handleRateGlow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Open app store for rating
    if (Platform.OS === 'ios') {
      Linking.openURL('itms-apps://itunes.apple.com/app/id1234567890?action=write-review'); // Replace with actual App Store ID
    } else {
      Linking.openURL('market://details?id=com.yourcompany.glow'); // Replace with actual package name
    }
  };

  const handleLegalPrivacy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(settings)/legal-privacy');
  };

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowSignOutModal(true);
  };

  const handleConfirmSignOut = () => {
    signOut();
    setShowSignOutModal(false);
    // Navigate to onboarding/login screen
    router.replace('/(onboarding)');
  };

  const handleCancelSignOut = () => {
    setShowSignOutModal(false);
  };

  const handleSocialPress = (platform: 'twitter' | 'instagram') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log(`${platform} pressed`);
    // TODO: Open social media links
  };

  const menuItems = [
    {
      icon: SettingsNotifications,
      title: 'NOTIFICATION',
      onPress: handleNotifications,
    },
    {
      icon: SettingsRate,
      title: 'RATE GLOW',
      onPress: handleRateGlow,
    },
    {
      icon: SettingsLegal,
      title: 'LEGAL & PRIVACY',
      onPress: handleLegalPrivacy,
    },
    {
      icon: SettingsSignOut,
      title: 'SIGN OUT',
      onPress: handleSignOut,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <TouchableOpacity style={styles.profileSection} onPress={handleEditProfile}>
          <View style={styles.profileLeft}>
            {image && typeof image !== 'number' ? (
              <Image source={{ uri: image }} style={styles.profileImage} />
            ) : (
              <Image source={SettingsProfile} style={styles.profileImage} />
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{username || ''}</Text>
              <Text style={styles.profileSubtitle}>edit profile</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.neutral[400]} />
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.menuItem} 
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <Image source={item.icon} style={styles.menuIcon} />
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.neutral[400]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Add bottom padding to ensure content doesn't go under footer */}
        <View style={{ height: 250 }} />
      </ScrollView>

      {/* Footer - Outside ScrollView */}
      <View style={styles.footer}>
        <Image source={SettingsSprial} style={styles.spiralLogo} />
        <Text style={styles.footerText}>Follow The Glow / v1.6.2</Text>
        
        <View style={styles.socialLinks}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialPress('twitter')}
          >
            <Image source={SocialX} style={styles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleSocialPress('instagram')}
          >
            <Image source={SocialInstagram} style={styles.socialIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <SignOutModal
        visible={showSignOutModal}
        onSignOut={handleConfirmSignOut}
        onCancel={handleCancelSignOut}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: fonts.primaryMedium,
    color: colors.neutral[500],
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: colors.background.primary,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  profileInfo: {
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontFamily: fonts.primaryMedium,
    color: colors.text.primary,
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 14,
    fontFamily: fonts.secondary,
    color: colors.neutral[500],
  },
  menuSection: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.background.primary,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: fonts.primaryMedium,
    color: colors.text.primary,
    marginLeft: 24,
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 40,
    paddingBottom: 60,
    backgroundColor: colors.background.primary,
  },
  spiralLogo: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 14,
    fontFamily: fonts.primary,
    color: colors.neutral[500],
    marginBottom: 32,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 24,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
}); 