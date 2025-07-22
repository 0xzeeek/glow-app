import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, ScrollView } from 'react-native';
import { colors } from '@/theme/colors';

const { width: screenWidth } = Dimensions.get('window');

export default function TokenDetailsSkeleton() {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startShimmer = () => {
      shimmerAnimation.setValue(0);
      Animated.loop(
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    };
    startShimmer();
  }, [shimmerAnimation]);

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.5, 0.3],
  });

  const ShimmerPlaceholder = ({ style }: { style: any }) => (
    <Animated.View 
      style={[
        styles.shimmerContainer, 
        style,
        { opacity }
      ]} 
    />
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Token Header Skeleton */}
        <View style={styles.headerContainer}>
          <View style={styles.headerOverlay}>
            {/* Top bar with back button and icons */}
            <View style={styles.topBar}>
              <ShimmerPlaceholder style={styles.backButton} />
              <View style={styles.rightIcons}>
                <ShimmerPlaceholder style={styles.iconButton} />
                <ShimmerPlaceholder style={styles.iconButton} />
              </View>
            </View>
            
            {/* Token info section */}
            <View style={styles.tokenInfo}>
              <ShimmerPlaceholder style={styles.profileImage} />
              <View style={styles.tokenNameContainer}>
                <ShimmerPlaceholder style={styles.tokenName} />
                <View style={styles.priceRow}>
                  <ShimmerPlaceholder style={styles.price} />
                  <ShimmerPlaceholder style={styles.priceChange} />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Token Stats Chart Skeleton */}
          <View style={styles.statsChartContainer}>
            {/* Market Cap and Top Holders Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBlock}>
                <ShimmerPlaceholder style={styles.statLabel} />
                <ShimmerPlaceholder style={styles.statValue} />
              </View>
              
              <View style={styles.dividerVertical} />
              
              <View style={styles.holderBlock}>
                <ShimmerPlaceholder style={styles.statLabel} />
                <View style={styles.holdersContainer}>
                  <ShimmerPlaceholder style={styles.holderAvatar} />
                  <ShimmerPlaceholder style={styles.holderAvatar} />
                  <ShimmerPlaceholder style={styles.holderAvatar} />
                </View>
              </View>
            </View>
            
            {/* Chart */}
            <ShimmerPlaceholder style={styles.chart} />
            
            {/* Timeframe buttons */}
            <View style={styles.timeframeContainer}>
              <ShimmerPlaceholder style={styles.timeframeButton} />
              <ShimmerPlaceholder style={styles.timeframeButton} />
              <ShimmerPlaceholder style={styles.timeframeButton} />
              <ShimmerPlaceholder style={styles.timeframeButton} />
              <ShimmerPlaceholder style={styles.timeframeButton} />
            </View>
          </View>

          <View style={styles.divider} />

          {/* About Section */}
          <View style={styles.aboutSection}>
            <ShimmerPlaceholder style={styles.sectionTitle} />
            <ShimmerPlaceholder style={styles.descriptionLine} />
            <ShimmerPlaceholder style={styles.descriptionLine} />
            <ShimmerPlaceholder style={[styles.descriptionLine, { width: '85%' }]} />
          </View>

          {/* Token Info Section */}
          <View style={styles.infoSection}>
            <ShimmerPlaceholder style={styles.sectionTitle} />
            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <ShimmerPlaceholder style={styles.infoLabel} />
                <ShimmerPlaceholder style={styles.infoValue} />
              </View>
              <View style={styles.infoRow}>
                <ShimmerPlaceholder style={styles.infoLabel} />
                <ShimmerPlaceholder style={styles.infoValue} />
              </View>
              <View style={styles.infoRow}>
                <ShimmerPlaceholder style={styles.infoLabel} />
                <ShimmerPlaceholder style={styles.infoValue} />
              </View>
              <View style={styles.infoRow}>
                <ShimmerPlaceholder style={styles.infoLabel} />
                <ShimmerPlaceholder style={styles.infoValue} />
              </View>
              <View style={styles.infoRow}>
                <ShimmerPlaceholder style={styles.infoLabel} />
                <ShimmerPlaceholder style={styles.infoValue} />
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Socials Section */}
          <View style={styles.socialsSection}>
            <ShimmerPlaceholder style={styles.sectionTitle} />
            <View style={styles.socialsList}>
              <View style={styles.socialRow}>
                <View style={styles.socialLeft}>
                  <ShimmerPlaceholder style={styles.socialIcon} />
                  <ShimmerPlaceholder style={styles.socialPlatform} />
                </View>
                <ShimmerPlaceholder style={styles.socialHandle} />
              </View>
              <View style={styles.socialRow}>
                <View style={styles.socialLeft}>
                  <ShimmerPlaceholder style={styles.socialIcon} />
                  <ShimmerPlaceholder style={styles.socialPlatform} />
                </View>
                <ShimmerPlaceholder style={styles.socialHandle} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  shimmerContainer: {
    backgroundColor: colors.neutral[200],
    borderRadius: 8,
  },
  
  // Header styles
  headerContainer: {
    height: 450,
    width: '100%',
    backgroundColor: colors.neutral[200],
  },
  headerOverlay: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  tokenInfo: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  profileImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
    marginRight: 16,
  },
  tokenNameContainer: {
    flex: 1,
  },
  tokenName: {
    height: 32,
    width: 160,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  price: {
    height: 28,
    width: 100,
  },
  priceChange: {
    height: 24,
    width: 80,
  },
  
  // Content container
  contentContainer: {
    flex: 1,
  },
  
  // Stats Chart styles
  statsChartContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  holderBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    height: 14,
    width: 80,
    marginBottom: 8,
  },
  statValue: {
    height: 24,
    width: 100,
  },
  dividerVertical: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral[200],
    marginHorizontal: 16,
  },
  holdersContainer: {
    flexDirection: 'row',
    gap: -8,
  },
  holderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  chart: {
    height: 180,
    width: '100%',
    marginBottom: 20,
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeframeButton: {
    width: 60,
    height: 36,
    borderRadius: 18,
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginVertical: 20,
  },
  
  // About section
  aboutSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    height: 14,
    width: 60,
    marginBottom: 12,
  },
  descriptionLine: {
    height: 16,
    width: '100%',
    marginBottom: 6,
  },
  
  // Info section
  infoSection: {
    paddingHorizontal: 24,
  },
  infoList: {
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    height: 16,
    width: 100,
  },
  infoValue: {
    height: 16,
    width: 80,
  },
  
  // Socials section
  socialsSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  socialsList: {
    gap: 16,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  socialLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  socialPlatform: {
    height: 16,
    width: 60,
  },
  socialHandle: {
    height: 16,
    width: 100,
  },
});