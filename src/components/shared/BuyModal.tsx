import React from 'react';
import MoneyModal from './MoneyModal';

interface BuyModalProps {
  visible: boolean;
  onClose: () => void;
  tokenName: string;
  tokenImage: string;
  tokenAddress: string;
  tokenPrice: number;
  onBackgroundScale?: (scale: any) => void;
}

export default function BuyModal({
  visible,
  onClose,
  tokenName,
  tokenImage,
  tokenAddress,
  tokenPrice,
  onBackgroundScale,
}: BuyModalProps) {
  const handleBuyComplete = async (amount: number): Promise<boolean> => {
    // TODO: Implement actual buy logic here
    // For now, just return true to simulate success
    console.log(`Buying ${amount / tokenPrice} tokens of ${tokenName} for $${amount}`);
    return true;
  };

  return (
    <MoneyModal
      visible={visible}
      onClose={onClose}
      mode="buy"
      tokenName={tokenName}
      tokenImage={tokenImage}
      tokenAddress={tokenAddress}
      tokenPrice={tokenPrice}
      onBackgroundScale={onBackgroundScale}
      onComplete={handleBuyComplete}
    />
  );
}
