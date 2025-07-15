import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TokenEye, TokenShare, SocialXWhite, SocialYoutubeWhite, SocialInstagramWhite } from '../../../assets';
import { colors, fonts } from '../../theme';

interface TokenHeaderProps {
  name: string;
  price: string;
  priceChange: number;
  profileImage: string;
  backgroundImage: string;
}

export default function TokenHeader({ name, price, priceChange, profileImage, backgroundImage }: TokenHeaderProps) {
  const router = useRouter();
  const isPositive = priceChange >= 0;
  
  return (
    <ImageBackground source={{ uri: backgroundImage }} style={styles.container}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <Ionicons name="chevron-back" size={24} color={colors.neutral[0]} />
            </TouchableOpacity>
            
            <View style={styles.rightSection}>
              <View style={styles.topIcons}>
                <TouchableOpacity style={styles.iconButton}>
                  <Image source={TokenEye} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Image source={TokenShare} style={styles.icon} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.socialIcons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Image source={SocialXWhite} style={styles.socialIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Image source={SocialYoutubeWhite} style={styles.socialIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Image source={SocialInstagramWhite} style={styles.socialIcon} />
                </TouchableOpacity>
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
              <Text style={[styles.priceChange, { color: isPositive ? colors.green.white : '#FF3366' }]}>
                {isPositive ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
              </Text>
            </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 450,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 58, 138, 0.85)',
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
  profileImageContainer:{
    width: 114,
    height: 114,
    borderRadius: 57,
    borderColor: colors.background.primary,
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
    fontSize: 24,
    fontFamily: fonts.primaryBold,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
}); 