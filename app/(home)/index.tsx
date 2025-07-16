import React, { useMemo } from 'react';
import { View, FlatList, StyleSheet, ScrollView, Text } from 'react-native';
import HeaderBar from '../../src/components/navigation/HeaderBar';
import TopMovers from '../../src/components/home/TopMovers';
import FeaturedToken from '../../src/components/home/FeaturedToken';
import CreatorTokenRow from '../../src/components/home/CreatorTokenRow';
import BottomNav from '../../src/components/navigation/BottomNav';
import { useTokenData, useWatchlistContext } from '../../src/contexts';
import { useGlobalWebSocketUpdates } from '../../src/hooks';
import { fonts } from '@/theme/typography';
import { colors } from '@/theme/colors';

export default function HomeScreen() {
  const { topMovers, featuredToken, creatorTokens } = useTokenData();
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

  return (
    <View style={styles.container}>
      <HeaderBar />

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TopMovers data={topMovers} />

        <FeaturedToken token={featuredToken} />

        {/* Watchlist Section */}
        {watchlistTokens.length > 0 && (
          <View style={styles.tokenListSection}>
            <Text style={styles.sectionTitle}>WATCHLIST</Text>
            <FlatList
              data={watchlistTokens}
              keyExtractor={item => item.address}
              renderItem={({ item }) => <CreatorTokenRow token={item} />}
              scrollEnabled={false}
            />
          </View>
        )}

        <View style={styles.tokenListSection}>
          <Text style={styles.sectionTitle}>CREATORS</Text>
          <FlatList
            data={nonWatchlistTokens}
            keyExtractor={item => item.address}
            renderItem={({ item }) => <CreatorTokenRow token={item} />}
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
