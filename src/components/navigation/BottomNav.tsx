import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../../contexts/UserContext';
import { Home, HomeSelected, Plus, PlusSelected, Profile as ProfileIcon } from '../../../assets';
import { colors } from '@/theme/colors';

interface BottomNavProps {
  activeTab?: 'home' | 'referral' | 'profile' | null;
}

export default function BottomNav({ activeTab = 'home' }: BottomNavProps) {
  const router = useRouter();
  const { profileImage } = useUser();

  const handleHomePress = () => {
    if (activeTab !== 'home') {
      router.replace('/(home)');
    }
  };

  const handleProfilePress = () => {
    if (activeTab !== 'profile') {
      router.replace('/(profile)');
    }
  };

  const handleReferralPress = () => {
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
        <Image source={activeTab === 'referral' ? PlusSelected : Plus} style={styles.navIcon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={handleProfilePress}>
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            style={[styles.profileImage, activeTab === 'profile' && styles.activeProfileImage]}
          />
        ) : (
          <Image
            source={ProfileIcon}
            style={[styles.navIcon, activeTab === 'profile' && styles.activeIcon]}
          />
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
    paddingBottom: 20,
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
