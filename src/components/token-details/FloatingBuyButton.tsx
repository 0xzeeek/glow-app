import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
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
      <TouchableOpacity style={styles.button} onPress={() => setShowBuyModal(true)}>
        <Text style={styles.buttonText}>BUY NOW</Text>
      </TouchableOpacity>
      
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
  button: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: '#000000',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
}); 