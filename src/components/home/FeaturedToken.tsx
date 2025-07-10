import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { FeaturedTokenData } from '../../data/mockTokens';

interface FeaturedTokenProps {
  token: FeaturedTokenData;
}

export default function FeaturedToken({ token }: FeaturedTokenProps) {
  const router = useRouter();
  
  const handleBuyPress = () => {
    router.push(`/(token)/${token.id}`);
  };
  
  return (
    <ImageBackground 
      source={{ uri: 'https://picsum.photos/800/400?grayscale&blur=2' }} 
      style={styles.bannerContainer}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.contentWrapper}>
          <View style={styles.topSection}>
            <View style={styles.profileWrapper}>
              <Image source={{ uri: token.image }} style={styles.profileImage} />
            </View>

            <View style={styles.nameSection}>
              <View style={styles.liveContainer}>
                <Text style={styles.liveText}>LIVE</Text>
                <Text style={styles.liveDot}>•</Text>
              </View>
              <Text style={styles.tokenName}>VisualBleed</Text>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.marketCapSection}>
              <Text style={styles.marketCapLabel}>MARKET CAP</Text>
              <Text style={styles.marketCapValue}>{token.marketCap}</Text>
            </View>
            
            <TouchableOpacity style={styles.buyButton} onPress={handleBuyPress}>
              <Text style={styles.buyButtonText}>BUY NOW</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 58, 138, 0.8)',
    justifyContent: 'center',
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  topSection: {
    flex: 1,
    height: '50%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileWrapper: {
    width: 100,
    height: 100,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#00FF88',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  nameSection: {
    flex: 1,
    paddingLeft: 0,
    paddingRight: 0,
    marginLeft: 10,
    alignItems: 'flex-start',
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00FF88',
    fontFamily: 'DGMTypeset-Regular',
  },
  liveDot: {
    color: '#00FF88',
    fontSize: 22,
    lineHeight: 15,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  tokenName: {
    fontSize: 30,
    fontWeight: '300',
    color: '#FFFFFF',
    fontFamily: 'DGMTypeset-Regular',
  },
  bottomSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  marketCapSection: {
    width: 100,
    marginTop: 10,
    alignItems: 'center',
  },
  marketCapLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00FF88',
    marginBottom: 8,
    fontFamily: 'DGMTypeset-Regular',
  },
  marketCapValue: {
    fontSize: 15,
    fontWeight: '300',
    color: '#FFFFFF',
    fontFamily: 'DGMTypeset-Regular',
  },
  buyButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    width: 200,
    height: "100%",
    borderRadius: 50,
  },
  buyButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'DGMTypeset-Regular',
  },
});
