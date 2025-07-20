import React from 'react';
import MoneyModal from './MoneyModal';
import { useUser } from '../../contexts';

interface DepositModalProps {
  visible: boolean;
  onClose: () => void;
  onBackgroundScale?: (scale: any) => void;
}

export default function DepositModal({
  visible,
  onClose,
  onBackgroundScale,
}: DepositModalProps) {
  const { refetchHoldings } = useUser();

  const handleDepositComplete = async (amount: number): Promise<boolean> => {
    // TODO: Implement actual deposit logic here
    // For now, just refetch holdings and return true
    console.log(`Depositing $${amount}`);
    await refetchHoldings();
    return true;
  };

  return (
    <MoneyModal
      visible={visible}
      onClose={onClose}
      mode="deposit"
      onBackgroundScale={onBackgroundScale}
      onComplete={handleDepositComplete}
    />
  );
} 