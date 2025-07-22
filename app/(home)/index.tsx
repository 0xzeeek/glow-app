import React, { useMemo, useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, ViewToken, RefreshControl } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useQueryClient } from '@tanstack/react-query';
import HeaderBar from '../../src/components/navigation/HeaderBar';
import TopMovers from '../../src/components/home/TopMovers';
import FeaturedToken from '../../src/components/home/FeaturedToken';
import CreatorTokenRow from '../../src/components/home/CreatorTokenRow';
import BottomNav from '../../src/components/navigation/BottomNav';
import { useTokenData, useWatchlistContext } from '../../src/contexts';
import { useMultipleToken24hPrices, useVisibleTokenSubscriptions } from '../../src/hooks';
import { fonts } from '@/theme/typography';
import { colors } from '@/theme/colors';
import { interpolateChartData } from '@/utils';
import { Token, TokenAddress } from '@/types';

export default function HomeScreen() {
  const queryClient = useQueryClient();
  const { 
    featuredToken, 
    creatorTokens, 
    allTokens,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refreshTokenData,
    updateTokenPrice,
  } = useTokenData();
  const { watchlist } = useWatchlistContext();
  const [visibleTokens, setVisibleTokens] = useState<Token[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter tokens based on watchlist
  const watchlistTokens = useMemo(
    () => allTokens.filter(token => watchlist.includes(token.address)),
    [allTokens, watchlist]
  );

  // Filter out watchlisted tokens from the creators list
  const nonWatchlistTokens = useMemo(
    () => creatorTokens.filter(token => !watchlist.includes(token.address)),
    [creatorTokens, watchlist]
  );

  // Track visible tokens for optimized WebSocket subscriptions
  useVisibleTokenSubscriptions({
    visibleTokens,
    featuredToken: featuredToken || undefined,
    onPriceUpdate: updateTokenPrice,
  });

  // Fetch 24h price data for all loaded tokens (not just visible)
  // This ensures charts don't disappear when scrolling
  const loadedTokenAddresses = useMemo(() => {
    // Get addresses for featured token, watchlist tokens, and non-watchlist tokens
    const addresses = new Set<TokenAddress>();
    
    // Add featured token
    if (featuredToken) {
      addresses.add(featuredToken.address);
    }
    
    // Add watchlist tokens
    watchlistTokens.forEach(token => addresses.add(token.address));
    
    // Add currently displayed creator tokens
    nonWatchlistTokens.forEach(token => addresses.add(token.address));
    
    return Array.from(addresses);
  }, [featuredToken, watchlistTokens, nonWatchlistTokens]);
  
  const priceDataQueries = useMultipleToken24hPrices(loadedTokenAddresses);
  // const priceDataQueries = [];

  // Create a map of token address to chart data
  const chartDataMap = useMemo(() => {
    const map: Record<string, number[]> = {};

    priceDataQueries.forEach((query, index) => {
      if (query.data && loadedTokenAddresses[index]) {
        const interpolated = interpolateChartData(query.data.prices, 50);
        map[loadedTokenAddresses[index]] = interpolated.map(point => point.price);
      }
    });
    return map;
  }, [priceDataQueries, loadedTokenAddresses]);

  // Calculate top movers based on visible tokens
  const calculatedTopMovers = useMemo(() => {
    return allTokens
      .slice(0, 50) // Only check top 50 tokens for performance
      .sort((a, b) => b.change24h - a.change24h);
  }, [allTokens]);

  // Track which tokens are visible on screen
  const onViewableItemsChanged = useCallback(({ viewableItems }: { 
    viewableItems: ViewToken[] 
  }) => {
    const visible = viewableItems
      .filter(item => item.isViewable && item.item)
      .map(item => item.item as Token);
    setVisibleTokens(visible);
  }, []);

  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  }), []);

  // Handle refresh - clear entire cache
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // TODO: completely removes all data
      queryClient.removeQueries();
      // Invalidate any remaining queries
      await queryClient.invalidateQueries();
      // This will also trigger refreshTokenData through the queries
      await refreshTokenData();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshTokenData, queryClient]);

  // Load more when approaching the end
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(({ item }: { item: Token }) => (
    <CreatorTokenRow
      token={item}
      chartData={chartDataMap[item.address]}
      change24h={item.change24h}
    />
  ), [chartDataMap]);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.neutral[500]} />
        <Text style={styles.loadingText}>Loading more tokens...</Text>
      </View>
    );
  }, [isFetchingNextPage]);

  const ListHeaderComponent = useMemo(() => (
    <>
      {calculatedTopMovers.length > 0 && <TopMovers data={calculatedTopMovers} />}
      {featuredToken && <FeaturedToken token={featuredToken} />}
      
      {/* Watchlist Section */}
      {watchlistTokens.length > 0 && (
        <View style={styles.tokenListSection}>
          <Text style={styles.sectionTitle}>WATCHLIST</Text>
          {watchlistTokens.map((token) => (
            <CreatorTokenRow
              key={token.address}
              token={token}
              chartData={chartDataMap[token.address]}
              change24h={token.change24h}
            />
          ))}
        </View>
      )}
      
      <View style={styles.tokenListSection}>
        <Text style={styles.sectionTitle}>CREATORS</Text>
      </View>
    </>
  ), [calculatedTopMovers, featuredToken, watchlistTokens, chartDataMap]);

  // Create animated scroll value
  const scrollY = useSharedValue(0);
  
  // Handle scroll event
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.container}>
        <HeaderBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.neutral[500]} />
        </View>
        <BottomNav activeTab="home" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderBar scrollY={scrollY} />

      <Animated.FlatList
        data={nonWatchlistTokens}
        renderItem={renderItem}
        keyExtractor={item => item.address}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.neutral[500]]}
            tintColor={colors.neutral[500]}
          />
        }
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      />

      <BottomNav activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenListSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fonts.primaryBold,
    color: colors.neutral[500],
    letterSpacing: 0.5,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.neutral[500],
    fontFamily: fonts.primaryMedium,
  },
});
