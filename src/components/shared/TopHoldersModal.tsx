import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { TopHolder } from '@/types';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import {
  CloseModal,
  Crown,
  TopHolder as TopHolderIcon,
  UserPlaceholder,
  Token1,
  Token2,
  Token3,
} from '../../../assets';

const { height: screenHeight } = Dimensions.get('window');

interface TopHoldersModalProps {
  visible: boolean;
  onClose: () => void;
  topHolders: TopHolder[];
  tokenSymbol?: string;
}

export default function TopHoldersModal({
  visible,
  onClose,
  topHolders,
  tokenSymbol,
}: TopHoldersModalProps) {
  // Animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(screenHeight)).current;
  
  // Position icons for top 3
  const positionIcons = [Token1, Token2, Token3];
  
  // Format wallet address to show first 4 and last 4 characters
  const formatWallet = (wallet: string) => {
    if (!wallet) return '';
    if (wallet.length <= 8) return wallet;
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
  };

  // Format percentage display
  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(3)}%`;
  };

  // Handle animations when modal opens/closes
  useEffect(() => {
    if (visible) {
      // Reset values
      overlayOpacity.setValue(0);
      contentTranslateY.setValue(screenHeight);

      // Animate in
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(contentTranslateY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    // Animate out
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
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={handleClose}
    >
      {/* Overlay with fade animation */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Content with slide animation */}
      <Animated.View
        style={[
          styles.modalContent,
          {
            transform: [{ translateY: contentTranslateY }],
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.title}>TOP HOLDERS</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Image source={CloseModal} style={styles.closeIcon} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {topHolders.map((holder, index) => (
              <View key={`${holder.wallet}-${index}`} style={styles.holderRow}>
                <View style={styles.leftSection}>
                  <View style={styles.positionContainer}>
                    {index === 0 && <Image source={Crown} style={styles.crownIcon} />}
                    {index < 3 ? (
                      <Image source={positionIcons[index]} style={styles.positionIcon} />
                    ) : (
                      <Text style={styles.position}>{holder.position}</Text>
                    )}
                  </View>

                  <View style={styles.avatarContainer}>
                    <Image
                      source={
                        holder.image
                          ? { uri: holder.image }
                          : holder.wallet
                            ? TopHolderIcon
                            : UserPlaceholder
                      }
                      style={styles.avatar}
                    />
                  </View>
                  <Text style={styles.walletAddress}>
                    {holder.username || formatWallet(holder.wallet)}
                  </Text>
                </View>

                <Text style={styles.percentage}>{formatPercentage(holder.percentage)}</Text>
              </View>
            ))}

            {topHolders.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No holders data available</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
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
    height: screenHeight * 0.9,
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    position: 'relative',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.primaryBold,
    color: colors.green.black,
    letterSpacing: 0.5,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  closeIcon: {
    width: 44,
    height: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  holderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  positionContainer: {
    position: 'relative',
    width: 30,
    alignItems: 'flex-start',
  },
  crownIcon: {
    position: 'absolute',
    left: 90,
    top: -15,
    width: 12,
    height: 9,
  },
  position: {
    fontSize: 16,
    fontFamily: fonts.secondaryMedium,
    color: colors.neutral[500],
  },
  positionIcon: {
    width: 12,
    height: 15,
  },
  topThreePosition: {
    color: colors.green.black,
    fontFamily: fonts.primaryBold,
  },
  avatarContainer:{
    width: 49,
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.background.primary,
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  walletAddress: {
    fontSize: 16,
    fontFamily: fonts.secondary,
    color: colors.text.secondary,
  },
  percentage: {
    fontSize: 16,
    fontFamily: fonts.secondaryMedium,
    color: colors.text.secondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.secondary,
    color: colors.neutral[500],
  },
}); 
