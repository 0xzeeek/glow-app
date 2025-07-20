import React from 'react';
import MoneyModal from './MoneyModal';
import { useUser } from '../../contexts';

interface CashOutModalProps {
  visible: boolean;
  onClose: () => void;
  onBackgroundScale?: (scale: any) => void;
}

export default function CashOutModal({
  visible,
  onClose,
  onBackgroundScale,
}: CashOutModalProps) {
  const { usdcBalance, refetchHoldings } = useUser();

  const handleCashOutComplete = async (amount: number): Promise<boolean> => {
    // Validate amount
    if (amount > usdcBalance) {
      return false;
    }

    // TODO: Implement actual cash out logic here
    // For now, just refetch holdings and return true
    console.log(`Cashing out $${amount}`);
    await refetchHoldings();
    return true;
  };

  return (
    <MoneyModal
      visible={visible}
      onClose={onClose}
      mode="cash-out"
      onBackgroundScale={onBackgroundScale}
      onComplete={handleCashOutComplete}
    />
  );
}
