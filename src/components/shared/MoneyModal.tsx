import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  PanResponder,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PurchaseSuccess from './PurchaseSuccess';
import { useUser } from '../../contexts';
import {
  BackgroundOnbordingMain,
  CloseModal,
  DepositAppleButton,
  DepositDebitButton,
  DepositCryptoButton,
  DepositAppleIcon,
  DepositDebitIcon,
  DepositCryptoIcon,
  DepositDelete,
  DepositSwipe,
} from '../../../assets';
import { fonts } from '../../theme/typography';
import { colors } from '../../theme/colors';

type ModalMode = 'buy' | 'deposit' | 'cash-out';
type PaymentMethod = 'apple' | 'debit' | 'crypto';

interface MoneyModalProps {
  visible: boolean;
  onClose: () => void;
  mode: ModalMode;
  onBackgroundScale?: (scale: Animated.Value) => void;
  // Buy mode specific props
  tokenName?: string;
  tokenImage?: string;
  tokenAddress?: string;
  tokenPrice?: number;
  // Callback for when transaction completes
  onComplete?: (amount: number) => Promise<boolean> | boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const QUICK_AMOUNTS = {
  buy: ['30', '40', '50', '100'],
  deposit: ['50', '100', '250', '500'],
  'cash-out': ['25%', '50%', '75%', '100%'],
};

const DEFAULT_AMOUNTS = {
  buy: '100',
  deposit: '100',
  'cash-out': '0', // Will be calculated based on balance
};

const TITLES = {
  buy: 'BUY',
  deposit: 'DEPOSIT',
  'cash-out': 'CASH OUT',
};

const BALANCE_LABELS = {
  buy: 'Cash',
  deposit: 'Current Balance',
  'cash-out': 'Available Balance',
};

const SUCCESS_TITLES = {
  buy: 'PURCHASE SUCCESSFUL',
  deposit: 'DEPOSIT SUCCESSFUL',
  'cash-out': 'CASH OUT SUCCESSFUL',
};

const SUCCESS_SUBTITLES = {
  buy: 'Added to your portfolio',
  deposit: 'Added to your balance',
  'cash-out': 'Withdrawn from your balance',
};

const DEFAULT_PAYMENT_METHODS: Record<ModalMode, PaymentMethod> = {
  buy: 'apple',
  deposit: 'apple',
  'cash-out': 'debit',
};

export default function MoneyModal({
  visible,
  onClose,
  mode,
  onBackgroundScale,
  tokenName,
  tokenImage,
  tokenAddress,
  tokenPrice,
  onComplete,
}: MoneyModalProps) {
  const { usdcBalance, refetchHoldings } = useUser();
  
  // Calculate default amount for cash-out mode
  const getDefaultAmount = () => {
    if (mode === 'cash-out') {
      return Math.floor(usdcBalance * 0.25).toString();
    }
    return DEFAULT_AMOUNTS[mode];
  };

  const [amount, setAmount] = useState(getDefaultAmount());
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(
    DEFAULT_PAYMENT_METHODS[mode]
  );
  const swipeAnimation = useRef(new Animated.Value(0)).current;
  const [showSuccess, setShowSuccess] = useState(false);

  // Animation values for modal
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(screenHeight)).current;
  const backgroundScale = useRef(new Animated.Value(1)).current;

  // Animation values for payment methods modal
  const paymentOverlayOpacity = useRef(new Animated.Value(0)).current;
  const paymentContentTranslateY = useRef(new Animated.Value(300)).current;

  // Handle modal open/close animations
  React.useEffect(() => {
    if (visible) {
      // Reset animation values to ensure proper starting position
      overlayOpacity.setValue(0);
      contentTranslateY.setValue(screenHeight);

      // Fade in overlay
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Slide up content
      Animated.spring(contentTranslateY, { 
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();

      // Scale down background (optional native iOS effect)
      if (onBackgroundScale) {
        Animated.spring(backgroundScale, {
          toValue: 0.93,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }).start();
        onBackgroundScale(backgroundScale);
      }
    }
  }, [visible]);

  // Reset amount when balance changes (for cash-out mode)
  React.useEffect(() => {
    if (mode === 'cash-out' && !hasInteracted) {
      setAmount(getDefaultAmount());
    }
  }, [usdcBalance, mode, hasInteracted]);

  const handleNumberPress = (num: string) => {
    setHasInteracted(true);
    if (amount === '0' && num !== '.') {
      setAmount(num);
    } else if (num === '.' && !amount.includes('.')) {
      setAmount(amount + num);
    } else if (num !== '.') {
      // Limit to 2 decimal places
      const parts = amount.split('.');
      if (parts[1] && parts[1].length >= 2) return;
      setAmount(amount + num);
    }
  };

  const handleDelete = () => {
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount('0');
    }
  };

  const handleQuickAmount = (value: string) => {
    setHasInteracted(true);
    if (mode === 'cash-out' && value.includes('%')) {
      const percentage = parseFloat(value) / 100;
      setAmount(Math.floor(usdcBalance * percentage).toString());
    } else {
      setAmount(value);
    }
  };

  const numericAmount = parseFloat(amount) || 0;

  const handleShareGains = async () => {
    if (mode === 'buy' && tokenName) {
      try {
        const gains = 100; // TODO: Calculate actual gains
        await Share.share({
          message: `I just gained +${gains.toFixed(2)}% on ${tokenName}! 🚀`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const getPaymentButtonImage = () => {
    switch (selectedPaymentMethod) {
      case 'apple':
        return DepositAppleButton;
      case 'debit':
        return DepositDebitButton;
      case 'crypto':
        return DepositCryptoButton;
    }
  };

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setShowPaymentMethods(false);
  };

  const handleCloseModal = () => {
    // Animate out first
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      ...(onBackgroundScale
        ? [
            Animated.spring(backgroundScale, {
              toValue: 1,
              tension: 65,
              friction: 11,
              useNativeDriver: true,
            }),
          ]
        : []),
    ]).start(() => {
      // Reset state after animation completes
      setShowSuccess(false);
      setAmount(getDefaultAmount());
      setHasInteracted(false);
      setSelectedPaymentMethod(DEFAULT_PAYMENT_METHODS[mode]);
      setShowPaymentMethods(false);
      swipeAnimation.setValue(0);
      onClose();
    });
  };

  // Swipe handler
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx > 0) {
        const maxSwipe = screenWidth - 140;
        const swipeValue = Math.min(gestureState.dx, maxSwipe);
        swipeAnimation.setValue(swipeValue);
      }
    },
    onPanResponderRelease: async (_, gestureState) => {
      if (gestureState.dx > screenWidth * 0.5) {
        // Validate amount for cash-out
        if (mode === 'cash-out' && numericAmount > usdcBalance) {
          alert('Insufficient balance');
          Animated.spring(swipeAnimation, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
          return;
        }

        // Execute the transaction
        let success = true;
        if (onComplete) {
          success = await onComplete(numericAmount);
        } else {
          // Default behavior if no callback provided
          if (mode === 'deposit' || mode === 'cash-out') {
            await refetchHoldings();
          }
        }

        if (success) {
          setShowSuccess(true);
          
          // Auto close after 2 seconds for deposit/cash-out
          if (mode !== 'buy') {
            setTimeout(() => {
              handleCloseModal();
            }, 2000);
          }
        } else {
          // Handle failure
          alert(mode === 'buy' ? 'Purchase failed. Please check your balance.' : 'Transaction failed.');
          Animated.spring(swipeAnimation, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      } else {
        // Snap back if not swiped far enough
        Animated.spring(swipeAnimation, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  // Calculate tokens for buy mode
  const tokensReceived = mode === 'buy' && tokenPrice ? numericAmount / tokenPrice : 0;

  const renderSuccessContent = () => {
    if (mode === 'buy' && tokenName && tokenImage) {
      return (
        <PurchaseSuccess
          tokenName={tokenName}
          tokenImage={tokenImage}
          percentageGain={100} // TODO: Calculate actual gains
          onShareGains={handleShareGains}
          onClose={handleCloseModal}
        />
      );
    }

    return (
      <View style={styles.successContainer}>
        <View style={styles.successContent}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>{SUCCESS_TITLES[mode]}</Text>
          <Text style={styles.successAmount}>${numericAmount.toFixed(2)}</Text>
          <Text style={styles.successSubtitle}>{SUCCESS_SUBTITLES[mode]}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={handleCloseModal}
    >
      {/* Overlay with fade animation only */}
      <TouchableWithoutFeedback onPress={handleCloseModal}>
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Content with slide animation only */}
      <Animated.View
        style={[
          styles.modalContent,
          {
            transform: [{ translateY: contentTranslateY }],
          },
        ]}
      >
        {/* Background Image */}
        <Image source={BackgroundOnbordingMain} style={styles.backgroundImage} resizeMode="cover" />

        <SafeAreaView style={styles.safeArea}>
          {showSuccess ? (
            renderSuccessContent()
          ) : (
            <>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>{TITLES[mode]}</Text>
                <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                  <Image source={CloseModal} style={styles.closeButtonIcon} />
                </TouchableOpacity>
              </View>

              {/* Cash Balance */}
              <TouchableOpacity 
                style={styles.cashBalance}
                disabled={mode !== 'buy'}
              >
                <Text style={styles.cashText}>
                  {BALANCE_LABELS[mode]}: ${usdcBalance.toFixed(2)}
                </Text>
                {mode === 'buy' && <Ionicons name="chevron-down" size={16} color="#999" />}
              </TouchableOpacity>

              {/* Amount Display */}
              <View style={styles.amountSection}>
                <Text style={[styles.amountText, hasInteracted && styles.amountTextActive]}>
                  ${amount}
                </Text>
              </View>

              {/* Payment Method Button */}
              <TouchableOpacity
                style={styles.cashTypeButton}
                activeOpacity={0.8}
                onPress={() => setShowPaymentMethods(true)}
              >
                <Image source={getPaymentButtonImage()} style={styles.cashTypeButtonIcon} />
              </TouchableOpacity>

              {/* Quick Amounts */}
              <View style={styles.quickAmounts}>
                {QUICK_AMOUNTS[mode].map(value => (
                  <TouchableOpacity
                    key={value}
                    style={styles.quickAmountButton}
                    onPress={() => handleQuickAmount(value)}
                  >
                    <Text style={styles.quickAmountText}>
                      {value.includes('%') ? value : `$${value}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Number Pad */}
              <View style={styles.numberPad}>
                {[
                  ['1', '2', '3'],
                  ['4', '5', '6'],
                  ['7', '8', '9'],
                  ['.', '0', 'delete'],
                ].map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.numberRow}>
                    {row.map(key => (
                      <TouchableOpacity
                        key={key}
                        style={styles.numberButton}
                        onPress={() => {
                          if (key === 'delete') {
                            handleDelete();
                          } else {
                            handleNumberPress(key);
                          }
                        }}
                      >
                        {key === 'delete' ? (
                          <Image source={DepositDelete} style={styles.deleteIcon} />
                        ) : (
                          <Text style={styles.numberText}>{key}</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>

              {/* Swipe to Action */}
              <View style={styles.swipeContainer}>
                <View style={styles.swipeTrack}>
                  {/* Green progress background */}
                  <Animated.View
                    style={[
                      styles.swipeProgress,
                      {
                        width: swipeAnimation.interpolate({
                          inputRange: [0, screenWidth - 140],
                          outputRange: ['0%', '100%'],
                          extrapolate: 'clamp',
                        }),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.swipeButton,
                      {
                        transform: [{ translateX: swipeAnimation }],
                      },
                    ]}
                    {...panResponder.panHandlers}
                  >
                    <View style={styles.swipeButtonInner}>
                      <Image source={DepositSwipe} style={styles.swipeIcon} />
                    </View>
                  </Animated.View>
                  <Text style={styles.swipeText}>
                    SWIPE TO {mode === 'buy' ? 'BUY' : mode === 'deposit' ? 'DEPOSIT' : 'CASH OUT'}
                  </Text>
                </View>
              </View>
            </>
          )}
        </SafeAreaView>
      </Animated.View>

      {/* Payment Methods Modal */}
      <Modal
        visible={showPaymentMethods}
        animationType="none"
        transparent={true}
        onRequestClose={() => setShowPaymentMethods(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPaymentMethods(false)}>
          <Animated.View
            style={[
              styles.paymentModalOverlay,
              {
                opacity: paymentOverlayOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.paymentModalContent,
            {
              transform: [{ translateY: paymentContentTranslateY }],
            },
          ]}
        >
          <View style={styles.paymentModalHandle} />
          
          <Text style={styles.paymentModalTitle}>Payment Method</Text>

          <TouchableOpacity
            style={styles.paymentOption}
            onPress={() => handleSelectPaymentMethod('apple')}
          >
            <Image source={DepositAppleIcon} style={styles.paymentIcon} />
            <Text style={styles.paymentText}>Apple Pay</Text>
            {selectedPaymentMethod === 'apple' && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.paymentOption}
            onPress={() => handleSelectPaymentMethod('debit')}
          >
            <Image source={DepositDebitIcon} style={styles.paymentIcon} />
            <Text style={styles.paymentText}>Debit Card</Text>
            {selectedPaymentMethod === 'debit' && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.paymentOption}
            onPress={() => handleSelectPaymentMethod('crypto')}
          >
            <Image source={DepositCryptoIcon} style={styles.paymentIcon} />
            <Text style={styles.paymentText}>Crypto</Text>
            {selectedPaymentMethod === 'crypto' && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.92,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.primaryBold,
    color: colors.text.primary,
    letterSpacing: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    padding: 5,
  },
  closeButtonIcon: {
    width: 24,
    height: 24,
  },
  cashBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  cashText: {
    fontSize: 14,
    fontFamily: fonts.secondary,
    color: colors.text.secondary,
    marginRight: 4,
  },
  amountSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    marginVertical: 10,
  },
  amountText: {
    fontSize: 48,
    fontFamily: fonts.secondaryBold,
    color: colors.text.secondary,
  },
  amountTextActive: {
    color: colors.text.primary,
  },
  cashTypeButton: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  cashTypeButtonIcon: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  quickAmountButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
  },
  quickAmountText: {
    fontSize: 14,
    fontFamily: fonts.secondaryMedium,
    color: colors.text.primary,
  },
  numberPad: {
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  numberButton: {
    width: 80,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 24,
    fontFamily: fonts.secondary,
    color: colors.text.primary,
  },
  deleteIcon: {
    width: 24,
    height: 24,
    tintColor: colors.text.primary,
  },
  swipeContainer: {
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
  },
  swipeTrack: {
    height: 60,
    backgroundColor: colors.background.secondary,
    borderRadius: 30,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  swipeProgress: {
    position: 'absolute',
    height: '100%',
    backgroundColor: colors.green.black,
    borderRadius: 30,
  },
  swipeButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    left: 0,
  },
  swipeButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  swipeIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  swipeText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: fonts.primaryBold,
    color: colors.text.secondary,
    letterSpacing: 1,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successIcon: {
    fontSize: 80,
    color: colors.green.black,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: fonts.secondaryBold,
    color: colors.text.primary,
    marginBottom: 10,
    letterSpacing: 1,
  },
  successAmount: {
    fontSize: 36,
    fontFamily: fonts.secondaryBold,
    color: colors.text.primary,
    marginBottom: 5,
  },
  successSubtitle: {
    fontSize: 16,
    fontFamily: fonts.secondary,
    color: colors.text.secondary,
  },
  paymentModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  paymentModalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  paymentModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.neutral[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  paymentModalTitle: {
    fontSize: 18,
    fontFamily: fonts.primaryBold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  paymentText: {
    fontSize: 16,
    fontFamily: fonts.secondaryMedium,
    color: colors.text.primary,
    flex: 1,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.green.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontFamily: fonts.secondaryBold,
  },
}); 