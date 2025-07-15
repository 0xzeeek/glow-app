import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '../shared/Button';
import BuyModal from '../shared/BuyModal';

interface FloatingBuyButtonProps {
  tokenName: string;
  tokenImage: string;
  tokenId: string;
  tokenPrice: number;
}

export default function FloatingBuyButton({ tokenName, tokenImage, tokenId, tokenPrice }: FloatingBuyButtonProps) {
  const [showBuyModal, setShowBuyModal] = useState(false);
  
  return (
    <>
      <View style={styles.container}>
        <Button 
          title="BUY NOW" 
          onPress={() => setShowBuyModal(true)}
          variant="secondary"
          style={styles.button}
        />
      </View>
      
      <BuyModal
        visible={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        tokenName={tokenName}
        tokenImage={tokenImage}
        tokenId={tokenId}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
}); 