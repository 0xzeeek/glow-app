import React, { useMemo } from 'react';
import { View, FlatList, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import HeaderBar from '../../src/components/navigation/HeaderBar';
import TopMovers from '../../src/components/home/TopMovers';
import FeaturedToken from '../../src/components/home/FeaturedToken';
import CreatorTokenRow from '../../src/components/home/CreatorTokenRow';
import BottomNav from '../../src/components/navigation/BottomNav';
import { useTokenData, useWatchlistContext } from '../../src/contexts';
import { useMultipleToken24hPrices } from '../../src/hooks';
import { fonts } from '@/theme/typography';
import { colors } from '@/theme/colors';
import { interpolateChartData, calculatePriceChange } from '@/utils';

export default function HomeScreen() {
  const { featuredToken, creatorTokens, isLoading } = useTokenData();
  const { watchlist } = useWatchlistContext();

  const allTokens = useMemo(
    () => [...creatorTokens, ...(featuredToken ? [featuredToken] : [])],
    [creatorTokens, featuredToken]
  );

  // Filter tokens based on watchlist - now using allTokens
  const watchlistTokens = useMemo(
    () => allTokens.filter(token => watchlist.includes(token.address)),
    [allTokens, watchlist]
  );

  // Filter out watchlisted tokens from the creators list - still only from creatorTokens
  const nonWatchlistTokens = useMemo(
    () => creatorTokens.filter(token => !watchlist.includes(token.address)),
    [creatorTokens, watchlist]
  );

  // Fetch 24h price data for ALL tokens (including featured)
  const tokenAddresses = useMemo(() => 
    allTokens.map(token => token.address),
    [allTokens]
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

  // Calculate 24h change for each token
  const changeMap = useMemo(() => {
    const map: Record<string, number> = {};
    priceDataQueries.forEach((query, index) => {
      if (query.data && tokenAddresses[index]) {
        map[tokenAddresses[index]] = calculatePriceChange(query.data.prices);
      }
    });
    return map;
  }, [priceDataQueries, tokenAddresses]);

  // Calculate top movers based on actual 24h price changes - now using allTokens
  const calculatedTopMovers = useMemo(() => {
    return allTokens
      .map(token => ({
        ...token,
        change24h: changeMap[token.address] || 0
      }))
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, 10);
  }, [allTokens, changeMap]);

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
        {calculatedTopMovers.length > 0 && <TopMovers data={calculatedTopMovers} />}

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
                  change24h={changeMap[item.address]}
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
                change24h={changeMap[item.address]}
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
