import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { FeaturedTokenData } from '../../data/mockTokens';
import BuyModal from '../shared/BuyModal';
import { Button } from '../shared/Button';
import { fonts } from 'src/theme/typography';
import { TokenLive } from 'assets';
import { colors } from '@/theme/colors';

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
    router.push(`/(token)/${token.address}`);
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
        tokenAddress={token.address}
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
    width: 114,
    height: 114,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 57,
    borderWidth: 2,
    borderColor: colors.green.black,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    fontFamily: fonts.primaryMedium,
    color: colors.text.secondary,
  },
  bottomSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingLeft: 10,
  },
  marketCapSection: {
    width: 100,
    marginTop: 10,
    alignItems: 'center',
  },
  marketCapLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: colors.green.black,
    fontFamily: fonts.primaryBold,
  },
  marketCapValue: {
    fontSize: 18,
    fontFamily: fonts.secondaryMedium,
    color: colors.text.secondary,
  },
  buyButton: {
    width: 200,
    height: 50,
    paddingVertical: 10,
  },
});
