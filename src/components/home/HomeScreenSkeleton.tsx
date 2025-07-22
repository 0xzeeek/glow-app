import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView, SafeAreaView } from 'react-native';
import { colors } from '@/theme/colors';

export default function HomeScreenSkeleton() {
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

  // Create array of placeholder items for lists
  const placeholderTokens = Array(6).fill(null);

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
        {/* Top Movers Section */}
        <View style={styles.topMoversSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topMoversScrollContent}
          >
            {[1, 2, 3, 4, 5].map((_, index) => (
              <View key={index} style={styles.topMoverItem}>
                <ShimmerPlaceholder style={styles.topMoverImage} />
                <ShimmerPlaceholder style={styles.topMoverName} />
                <ShimmerPlaceholder style={styles.topMoverChange} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Featured Token Section */}
        <View style={styles.featuredSection}>
          <View style={styles.featuredBanner}>
            <ShimmerPlaceholder style={styles.featuredBannerBackground} />
            <View style={styles.featuredOverlay}>
              <View style={styles.featuredContent}>
                <View style={styles.featuredTop}>
                  <ShimmerPlaceholder style={styles.featuredImage} />
                  <View style={styles.featuredInfo}>
                    <ShimmerPlaceholder style={styles.featuredLive} />
                    <ShimmerPlaceholder style={styles.featuredName} />
                  </View>
                </View>
                <View style={styles.featuredBottom}>
                  <View style={styles.featuredMarketCap}>
                    <ShimmerPlaceholder style={styles.marketCapLabel} />
                    <ShimmerPlaceholder style={styles.marketCapValue} />
                  </View>
                  <ShimmerPlaceholder style={styles.buyButton} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Watchlist Section (optional) */}
        <View style={styles.tokenListSection}>
          <ShimmerPlaceholder style={styles.sectionTitleSmall} />
          {placeholderTokens.slice(0, 2).map((_, index) => (
            <View key={`watchlist-${index}`} style={styles.tokenRow}>
              <ShimmerPlaceholder style={styles.tokenImage} />
              <View style={styles.tokenInfo}>
                <ShimmerPlaceholder style={styles.tokenName} />
                <ShimmerPlaceholder style={styles.tokenMarketCap} />
              </View>
              <ShimmerPlaceholder style={styles.tokenChart} />
              <View style={styles.tokenPriceSection}>
                <ShimmerPlaceholder style={styles.tokenPrice} />
                <ShimmerPlaceholder style={styles.tokenChange} />
              </View>
            </View>
          ))}
        </View>

        {/* Creators Section */}
        <View style={styles.tokenListSection}>
          <ShimmerPlaceholder style={styles.sectionTitleSmall} />
          {placeholderTokens.map((_, index) => (
            <View key={`creator-${index}`} style={styles.tokenRow}>
              <ShimmerPlaceholder style={styles.tokenImage} />
              <View style={styles.tokenInfo}>
                <ShimmerPlaceholder style={styles.tokenName} />
                <ShimmerPlaceholder style={styles.tokenMarketCap} />
              </View>
              <ShimmerPlaceholder style={styles.tokenChart} />
              <View style={styles.tokenPriceSection}>
                <ShimmerPlaceholder style={styles.tokenPrice} />
                <ShimmerPlaceholder style={styles.tokenChange} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom nav
  },
  shimmerContainer: {
    backgroundColor: colors.neutral[200],
    borderRadius: 8,
  },



  // Top Movers styles
  topMoversSection: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    height: 20,
    width: 120,
    marginLeft: 20,
    marginBottom: 12,
  },
  topMoversScrollContent: {
    paddingHorizontal: 20,
  },
  topMoverItem: {
    width: 80,
    marginRight: 10,
    alignItems: 'center',
  },
  topMoverImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  topMoverName: {
    height: 14,
    width: 60,
    marginBottom: 4,
  },
  topMoverChange: {
    height: 16,
    width: 50,
  },

  // Featured Token styles
  featuredSection: {
    paddingHorizontal: 0,
    marginBottom: 20,
  },
  featuredBanner: {
    height: 160,
    position: 'relative',
    overflow: 'hidden',
  },
  featuredBannerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutral[200],
  },
  featuredOverlay: {
    flex: 1,
    padding: 10,
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  featuredTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredImage: {
    width: 114,
    height: 114,
    borderRadius: 57,
    marginRight: 16,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredLive: {
    height: 20,
    width: 50,
    marginBottom: 8,
  },
  featuredName: {
    height: 28,
    width: 140,
  },
  featuredBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  featuredMarketCap: {
    flex: 1,
  },
  marketCapLabel: {
    height: 14,
    width: 80,
    marginBottom: 6,
  },
  marketCapValue: {
    height: 24,
    width: 100,
  },
  buyButton: {
    width: 100,
    height: 40,
    borderRadius: 20,
  },

  // Token List styles
  tokenListSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitleSmall: {
    height: 16,
    width: 80,
    marginBottom: 12,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tokenImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    height: 16,
    width: 100,
    marginBottom: 4,
  },
  tokenMarketCap: {
    height: 14,
    width: 80,
  },
  tokenChart: {
    width: 50,
    height: 24,
    marginRight: 16,
  },
  tokenPriceSection: {
    alignItems: 'flex-end',
  },
  tokenPrice: {
    height: 16,
    width: 60,
    marginBottom: 4,
  },
  tokenChange: {
    height: 14,
    width: 50,
  },
}); 