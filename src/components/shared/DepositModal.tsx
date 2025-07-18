import React, { useState } from 'react';
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
} from 'react-native';
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
  DepositSwipe
} from '../../../assets';
import { fonts } from '../../theme/typography';
import { colors } from '../../theme/colors';

interface DepositModalProps {
  visible: boolean;
  onClose: () => void;
  onBackgroundScale?: (scale: Animated.Value) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function DepositModal({
  visible,
  onClose,
  onBackgroundScale,
}: DepositModalProps) {
  const { usdcBalance, refetchHoldings } = useUser();
  const [amount, setAmount] = useState('100');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'apple' | 'debit' | 'crypto'>('apple');
  const [swipeAnimation] = useState(new Animated.Value(0));
  const [showSuccess, setShowSuccess] = useState(false);

  // Animation values for modal
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [contentTranslateY] = useState(new Animated.Value(screenHeight));
  const [backgroundScale] = useState(new Animated.Value(1));

  // Animation values for payment methods modal
  const [paymentOverlayOpacity] = useState(new Animated.Value(0));
  const [paymentContentTranslateY] = useState(new Animated.Value(300));

  // Handle modal open/close animations
  React.useEffect(() => {
    if (visible) {
      overlayOpacity.setValue(0);
      contentTranslateY.setValue(screenHeight);

      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Animated.spring(contentTranslateY, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();

      if (onBackgroundScale) {
        Animated.spring(backgroundScale, {
          toValue: 0.93,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }).start();
        onBackgroundScale(backgroundScale);
      }
    } else {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();

      Animated.timing(contentTranslateY, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start();

      if (onBackgroundScale) {
        Animated.spring(backgroundScale, {
          toValue: 1,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [visible, onBackgroundScale, overlayOpacity, contentTranslateY, backgroundScale]);

  // Handle payment modal animations
  React.useEffect(() => {
    if (showPaymentMethods) {
      paymentOverlayOpacity.setValue(0);
      paymentContentTranslateY.setValue(300);

      Animated.timing(paymentOverlayOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      Animated.spring(paymentContentTranslateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(paymentOverlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      Animated.timing(paymentContentTranslateY, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showPaymentMethods, paymentOverlayOpacity, paymentContentTranslateY]);

  const handleNumberPress = (num: string) => {
    if (num === '.' && amount.includes('.')) return;

    setHasInteracted(true);

    if (amount === '0' || amount === '100') {
      setAmount(num === '.' ? '0.' : num);
    } else {
      setAmount(amount + num);
    }
  };

  const handleDelete = () => {
    setHasInteracted(true);

    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount('0');
    }
  };

  const handleQuickAmount = (value: string) => {
    setHasInteracted(true);
    setAmount(value);
  };

  const numericAmount = parseFloat(amount) || 0;

  const getPaymentButtonImage = () => {
    switch (selectedPaymentMethod) {
      case 'apple':
        return DepositAppleButton;
      case 'debit':
        return DepositDebitButton;
      case 'crypto':
        return DepositCryptoButton;
      default:
        return DepositAppleButton;
    }
  };

  const handleSelectPaymentMethod = (method: 'apple' | 'debit' | 'crypto') => {
    setSelectedPaymentMethod(method);
    setShowPaymentMethods(false);
  };

  const handleCloseModal = () => {
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
      setShowSuccess(false);
      setAmount('100');
      setHasInteracted(false);
      setSelectedPaymentMethod('apple');
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
        // Complete the deposit
        // const depositAmount = parseFloat(amount) || 0;
        // TODO: if we refetch right away the balance will be wrong
        // TODO: figure out how to properly handle this
        refetchHoldings();
        setShowSuccess(true);

        // Auto close after 2 seconds
        setTimeout(() => {
          handleCloseModal();
        }, 2000);
      } else {
        // Snap back if not swiped far enough
        Animated.spring(swipeAnimation, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={handleCloseModal}
    >
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

      <Animated.View
        style={[
          styles.modalContent,
          {
            transform: [{ translateY: contentTranslateY }],
          },
        ]}
      >
        <Image
          source={BackgroundOnbordingMain}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        <SafeAreaView style={styles.safeArea}>
          {showSuccess ? (
            <View style={styles.successContainer}>
              <View style={styles.successContent}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successTitle}>DEPOSIT SUCCESSFUL</Text>
                <Text style={styles.successAmount}>${numericAmount.toFixed(2)}</Text>
                <Text style={styles.successSubtitle}>Added to your balance</Text>
              </View>
            </View>
          ) : (
            <>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>DEPOSIT</Text>
                <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                  <Image source={CloseModal} style={styles.closeButtonIcon} />
                </TouchableOpacity>
              </View>

              {/* Cash Balance */}
              <View style={styles.cashBalance}>
                <Text style={styles.cashText}>Current Balance: ${usdcBalance.toFixed(2)}</Text>
              </View>

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
                {['50', '100', '250', '500'].map(value => (
                  <TouchableOpacity
                    key={value}
                    style={styles.quickAmountButton}
                    onPress={() => handleQuickAmount(value)}
                  >
                    <Text style={styles.quickAmountText}>${value}</Text>
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

              {/* Swipe to Deposit */}
              <View style={styles.swipeContainer}>
                <View style={styles.swipeTrack}>
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
                    <Image source={DepositSwipe} style={styles.swipeIcon} />
                  </Animated.View>
                  <Text style={styles.swipeText}>SWIPE TO DEPOSIT</Text>
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
              styles.paymentMethodsOverlay,
              {
                opacity: paymentOverlayOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.paymentMethodsContent,
            {
              transform: [{ translateY: paymentContentTranslateY }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.paymentMethodItem}
            onPress={() => handleSelectPaymentMethod('apple')}
            activeOpacity={0.7}
          >
            <View style={styles.paymentMethodIcon}>
              <Image source={DepositAppleIcon} style={styles.paymentIcon} />
            </View>
            <Text style={styles.paymentMethodText}>APPLE PAY</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.paymentMethodItem}
            onPress={() => handleSelectPaymentMethod('debit')}
            activeOpacity={0.7}
          >
            <View style={styles.paymentMethodIcon}>
              <Image source={DepositDebitIcon} style={styles.paymentIcon} />
            </View>
            <Text style={styles.paymentMethodText}>DEBIT CARD</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.paymentMethodItem}
            onPress={() => handleSelectPaymentMethod('crypto')}
            activeOpacity={0.7}
          >
            <View style={styles.paymentMethodIcon}>
              <Image source={DepositCryptoIcon} style={styles.paymentIcon} />
            </View>
            <Text style={styles.paymentMethodText}>CRYPTO</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // TODO: update this color
    backgroundColor: '#0B0B0B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    overflow: 'hidden',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.primaryBold,
    color: colors.green.black,
    letterSpacing: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 24,
    padding: 4,
  },
  closeButtonIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashBalance: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 8,
  },
  cashText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontFamily: fonts.secondaryMedium,
  },
  amountSection: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  amountText: {
    fontSize: 64,
    fontFamily: fonts.secondary,
    color: colors.neutral[500],
    letterSpacing: -2,
  },
  amountTextActive: {
    color: colors.text.secondary,
  },
  cashTypeButton: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  cashTypeButtonIcon: {
    width: 140,
    height: 40,
    resizeMode: 'contain',
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    gap: 12,
  },
  quickAmountButton: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  quickAmountText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontFamily: fonts.secondaryMedium,
  },
  numberPad: {
    flex: 1,
    paddingHorizontal: 20,
    maxWidth: 320,
    alignSelf: 'center',
    width: '100%',
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  numberButton: {
    width: 88,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 28,
    color: colors.text.secondary,
    fontFamily: fonts.secondary,
  },
  deleteIcon: {
    width: 35,
    height: 24,
  },
  swipeContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
    marginTop: 'auto',
  },
  swipeTrack: {
    height: 56,
    backgroundColor: colors.neutral[100],
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  swipeButton: {
    position: 'absolute',
    left: 2,
    width: 60,
    height: 52,
    backgroundColor: colors.background.primary,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  swipeIcon: {
    width: 20,
    height: 20,
  },
  swipeText: {
    color: colors.neutral[500],
    fontSize: 14,
    fontFamily: fonts.primaryBold,
    letterSpacing: 2,
    position: 'relative',
    zIndex: 1,
  },
  swipeProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: colors.green.black,
    borderRadius: 28,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 80,
    color: colors.green.black,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: fonts.primaryBold,
    color: colors.text.secondary,
    letterSpacing: 2,
    marginBottom: 16,
  },
  successAmount: {
    fontSize: 48,
    fontFamily: fonts.primaryBold,
    color: colors.green.black,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    fontFamily: fonts.secondaryMedium,
    color: colors.neutral[500],
  },
  paymentMethodsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  paymentMethodsContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    width: '100%',
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    marginRight: 16,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  paymentMethodText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: fonts.primaryBold,
    letterSpacing: 1,
  },
}); 