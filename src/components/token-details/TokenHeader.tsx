import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.rightIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="eye-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="share-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.tokenInfo}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
            <Text style={styles.tokenName}>{name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{price}</Text>
              <View style={[styles.changeContainer, { backgroundColor: isPositive ? '#00C85333' : '#FF336633' }]}>
                <Text style={[styles.priceChange, { color: isPositive ? '#00C853' : '#FF3366' }]}>
                  {isPositive ? '▲' : '▼'} {Math.abs(priceChange)}%
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-twitter" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-youtube" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-instagram" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 340,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 58, 138, 0.7)',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  rightIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
  },
  tokenInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginBottom: 12,
  },
  tokenName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  changeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  priceChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  socialIcons: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    flexDirection: 'column',
    gap: 8,
  },
  socialButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 