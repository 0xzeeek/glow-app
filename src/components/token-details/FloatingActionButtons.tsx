import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button } from '../shared/Button';
import BuyModal from '../shared/BuyModal';
import MoneyModal from '../shared/MoneyModal';
import { colors } from '@/theme/colors';

interface FloatingActionButtonsProps {
  tokenName: string;
  tokenImage: string;
  tokenAddress: string;
  tokenPrice: number;
  onSellComplete?: (amount: number) => Promise<boolean>;
}

export default function FloatingActionButtons({ 
  tokenName, 
  tokenImage, 
  tokenAddress, 
  tokenPrice,
  onSellComplete 
}: FloatingActionButtonsProps) {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  
  return (
    <>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Button 
            title="SELL" 
            onPress={() => setShowSellModal(true)}
            variant="secondary"
            style={styles.button}
            hapticType="heavy"
          />
          <Button 
            title="BUY" 
            onPress={() => setShowBuyModal(true)}
            variant="secondary"
            style={styles.button}
            hapticType="heavy"
          />
        </View>
      </View>
      
      <BuyModal
        visible={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        tokenName={tokenName}
        tokenImage={tokenImage}
        tokenAddress={tokenAddress}
        tokenPrice={tokenPrice}
      />
      
      <MoneyModal
        visible={showSellModal}
        onClose={() => setShowSellModal(false)}
        mode="cash-out"
        tokenName={tokenName}
        tokenImage={tokenImage}
        tokenAddress={tokenAddress}
        tokenPrice={tokenPrice}
        onComplete={onSellComplete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    right: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    shadowColor: colors.background.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  sellButton: {
    // The primary variant will use the theme's primary color
  },
  buyButton: {
    // The secondary variant will use the theme's secondary color
  },
}); 