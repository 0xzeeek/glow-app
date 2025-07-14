import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { FeaturedTokenData } from '../../data/mockTokens';
import BuyModal from '../shared/BuyModal';
import { Button } from '../shared/Button';
import { fonts } from 'src/theme/typography';
import { TokenLive } from 'assets';

interface FeaturedTokenProps {
  token: FeaturedTokenData;
}

export default function FeaturedToken({ token }: FeaturedTokenProps) {
  const router = useRouter();
  const [showBuyModal, setShowBuyModal] = useState(false);
  
  const handleBuyPress = () => {
    setShowBuyModal(true);
  };
  
  const handleTokenPress = () => {
    router.push(`/(token)/${token.id}`);
  };
  
  return (
    <>
      <ImageBackground 
        source={{ uri: 'https://picsum.photos/800/400?grayscale&blur=2' }} 
        style={styles.bannerContainer}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.contentWrapper}>
            <TouchableOpacity style={styles.topSection} onPress={handleTokenPress} activeOpacity={0.8}>
              <View style={styles.profileWrapper}>
                <Image source={{ uri: token.image }} style={styles.profileImage} />
              </View>

              <View style={styles.nameSection}>
                  <Image source={TokenLive} style={styles.liveIcon} />
                <Text style={styles.tokenName}>VisualBleed</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.bottomSection}>
              <TouchableOpacity style={styles.marketCapSection} onPress={handleTokenPress} activeOpacity={0.8}>
                <Text style={styles.marketCapLabel}>MARKET CAP</Text>
                <Text style={styles.marketCapValue}>{token.marketCap}</Text>
              </TouchableOpacity>
              
              <Button title="BUY NOW" onPress={handleBuyPress} style={styles.buyButton} />
            </View>
          </View>
        </View>
      </ImageBackground>
      
      <BuyModal
        visible={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        tokenName={token.name}
        tokenImage={token.image}
        tokenId={token.id}
        tokenPrice={token.price}
      />
    </>
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
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  liveIcon: {
    width: 58,
    height: 20,
  },
  tokenName: {
    fontSize: 30,
    fontWeight: '300',
    color: '#FFFFFF',
    fontFamily: fonts.primary,
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
    fontFamily: fonts.primary,
  },
  marketCapValue: {
    fontSize: 15,
    fontWeight: '300',
    color: '#FFFFFF',
    fontFamily: fonts.secondary,
  },
  buyButton: {
    width: 200,
    height: 50,
    paddingVertical: 10,
  },
});
