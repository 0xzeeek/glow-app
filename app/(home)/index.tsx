import React, { useMemo } from 'react';
import { View, FlatList, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import HeaderBar from '../../src/components/navigation/HeaderBar';
import TopMovers from '../../src/components/home/TopMovers';
import FeaturedToken from '../../src/components/home/FeaturedToken';
import CreatorTokenRow from '../../src/components/home/CreatorTokenRow';
import BottomNav from '../../src/components/navigation/BottomNav';
import { useTokenData, useWatchlistContext } from '../../src/contexts';
import { useGlobalWebSocketUpdates, useMultipleToken24hPrices } from '../../src/hooks';
import { fonts } from '@/theme/typography';
import { colors } from '@/theme/colors';
import { interpolateChartData } from '@/utils';

export default function HomeScreen() {
  const { topMovers, featuredToken, creatorTokens, isLoading } = useTokenData();
  const { watchlist } = useWatchlistContext();
  
  // Subscribe to global WebSocket updates for all visible tokens
  useGlobalWebSocketUpdates();

  // Filter tokens based on watchlist - memoized to prevent recalculation
  const watchlistTokens = useMemo(() => 
    creatorTokens.filter(token => watchlist.includes(token.address)),
    [creatorTokens, watchlist]
  );
  
  // Filter out watchlisted tokens from the creators list - memoized
  const nonWatchlistTokens = useMemo(() => 
    creatorTokens.filter(token => !watchlist.includes(token.address)),
    [creatorTokens, watchlist]
  );

  // Fetch 24h price data for all creator tokens
  const tokenAddresses = useMemo(() => 
    creatorTokens.map(token => token.address),
    [creatorTokens]
  );
  const priceDataQueries = useMultipleToken24hPrices(tokenAddresses);

  // Create a map of token address to chart data
  const chartDataMap = useMemo(() => {
    const map: Record<string, number[]> = {};
    priceDataQueries.forEach((query, index) => {
      if (query.data && tokenAddresses[index]) {
        // Interpolate to 50 points for mini charts (smoother but performant)
        const interpolated = interpolateChartData(query.data.prices, 50);
        // Extract just the prices from the interpolated data
        map[tokenAddresses[index]] = interpolated.map(point => point.price);
      }
    });
    return map;
  }, [priceDataQueries, tokenAddresses]);

  if (isLoading) {
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
      <HeaderBar />

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {topMovers.length > 0 && <TopMovers data={topMovers} />}

        {featuredToken && <FeaturedToken token={featuredToken} />}

        {/* Watchlist Section */}
        {watchlistTokens.length > 0 && (
          <View style={styles.tokenListSection}>
            <Text style={styles.sectionTitle}>WATCHLIST</Text>
            <FlatList
              data={watchlistTokens}
              keyExtractor={item => item.address}
              renderItem={({ item }) => (
                <CreatorTokenRow 
                  token={item} 
                  chartData={chartDataMap[item.address]}
                />
              )}
              scrollEnabled={false}
            />
          </View>
        )}

        <View style={styles.tokenListSection}>
          <Text style={styles.sectionTitle}>CREATORS</Text>
          <FlatList
            data={nonWatchlistTokens}
            keyExtractor={item => item.address}
            renderItem={({ item }) => (
              <CreatorTokenRow 
                token={item} 
                chartData={chartDataMap[item.address]}
              />
            )}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <BottomNav activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenListSection: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral[700],
    marginLeft: 20,
    marginBottom: 12,
    letterSpacing: 0.5,
    fontFamily: fonts.secondaryBold,
  },
});
