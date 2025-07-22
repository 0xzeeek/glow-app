import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button } from '../shared/Button';
import BuyModal from '../shared/BuyModal';
import { colors } from '@/theme/colors';

interface FloatingBuyButtonProps {
  tokenName: string;
  tokenImage: string;
  tokenAddress: string;
  tokenPrice: number;
}

export default function FloatingBuyButton({ tokenName, tokenImage, tokenAddress, tokenPrice }: FloatingBuyButtonProps) {
  const [showBuyModal, setShowBuyModal] = useState(false);
  
  return (
    <>
      <View style={styles.container}>
        <Button 
          title="BUY NOW" 
          onPress={() => setShowBuyModal(true)}
          variant="secondary"
          style={styles.button}
          hapticType="heavy"
        />
      </View>
      
      <BuyModal
        visible={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        tokenName={tokenName}
        tokenImage={tokenImage}
        tokenAddress={tokenAddress}
        tokenPrice={tokenPrice}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
  },
  button: {
    shadowColor: colors.background.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
}); 