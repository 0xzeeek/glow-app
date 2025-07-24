import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useUser } from '../../contexts/UserContext';
import { Home, HomeSelected, Spiral, SpiralSelected, Profile, ProfileSelected } from '../../../assets';
import { colors } from '@/theme/colors';

interface BottomNavProps {
  activeTab?: 'home' | 'referral' | 'profile' | null;
  onHomePress?: () => void;
}

export default function BottomNav({ activeTab = 'home', onHomePress }: BottomNavProps) {
  const router = useRouter();
  const { image } = useUser();

  const handleHomePress = () => {
    // Add heavy haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (activeTab !== 'home') {
      router.replace('/(home)');
    } else if (onHomePress) {
      // If already on home screen and callback provided, scroll to top
      onHomePress();
    }
  };

  const handleProfilePress = () => {
    // Add heavy haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (activeTab !== 'profile') {
      router.replace('/(profile)');
    }
  };

  const handleReferralPress = () => {
    // Add heavy haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (activeTab !== 'referral') {
      router.replace('/(referral)');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navItem} onPress={handleHomePress}>
        <Image source={activeTab === 'home' ? HomeSelected : Home} style={styles.navIcon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={handleReferralPress}>
        <Image source={activeTab === 'referral' ? SpiralSelected : Spiral} style={styles.navIcon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={handleProfilePress}>
        {image && typeof image !== 'number' ? (
          <Image
            source={{ uri: image }}
            style={[styles.profileImage, activeTab === 'profile' && styles.activeProfileImage]}
          />
        ) : (
          activeTab === 'profile' ? (
          <Image
            source={ProfileSelected}
            style={styles.navIcon}
          />
          ) : (
            <Image
              source={Profile}
              style={styles.navIcon}
            />
          )
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    paddingVertical: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  activeIcon: {
    opacity: 1,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 50,
  },
  activeProfileImage: {
    borderWidth: 2,
    borderColor: colors.text.primary,
    borderRadius: 50,
  },
});
