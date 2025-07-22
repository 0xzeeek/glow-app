import React from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTokenDetails } from '@/hooks';
import { useUser } from '@/contexts/UserContext';
import TokenHeader from '@/components/token-details/TokenHeader';
import TokenStatsChart from '@/components/token-details/TokenStatsChart';
import TokenHolding from '@/components/token-details/TokenHolding';
import TokenAbout from '@/components/token-details/TokenAbout';
import TokenInfo from '@/components/token-details/TokenInfo';
import TokenSocials from '@/components/token-details/TokenSocials';
import FloatingBuyButton from '@/components/token-details/FloatingBuyButton';
import TopHoldersModal from '@/components/shared/TopHoldersModal';
import BottomNav from '@/components/navigation/BottomNav';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { formatPrice, formatMarketCap } from '@/utils';
import { formatSocialsForDisplay } from '@/utils/socialHelpers';
import { TokenAddress } from '@/types';

export default function TokenDetailScreen() {
  const { address } = useLocalSearchParams<{ address: TokenAddress }>();
  const [showHoldersModal, setShowHoldersModal] = React.useState(false);
  const { tokenHoldings } = useUser();

  const {
    tokenDetails,
    topHolders,
    chartData,
    isLoading,
    isChartLoading,
    error,
    selectedRange,
    setSelectedRange,
    availableRanges,
  } = useTokenDetails(address);

  // Debug re-renders
  React.useEffect(() => {
    if (tokenDetails) {
      console.log('tokenDetails updated:', tokenDetails.address);
    }
  }, [tokenDetails?.address]);

  // Use price change from token details instead of calculating from chart data
  const priceChange = tokenDetails?.change24h || 0;

  // Check if user is holding this token
  const userHolding = tokenHoldings.find(holding => holding.address === address);

  const handleShareHolding = () => {
    console.log('Share holding modal will be implemented next');
    // TODO: Implement share modal
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.text.primary} />
      </View>
    );
  }

  if (!tokenDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load token details</Text>
        <Text style={styles.errorSubtext}>{error?.message || 'Please try again later'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TokenHeader
          name={tokenDetails.name}
          price={`$${formatPrice(tokenDetails.price)}`}
          priceChange={priceChange}
          profileImage={tokenDetails.image}
          backgroundVideo={tokenDetails.video}
          address={tokenDetails.address}
          socialLinks={formatSocialsForDisplay(tokenDetails.socials)}
        />

        <View style={styles.contentContainer}>
          <TokenStatsChart
            marketCap={formatMarketCap(tokenDetails?.marketCap || 0)}
            topHolders={topHolders}
            chartData={chartData}
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
            isLoading={isChartLoading}
            availableRanges={availableRanges}
            onPressHolders={topHolders.length > 0 ? () => setShowHoldersModal(true) : undefined}
          />

          <View style={styles.divider} />

          {/* Show user's holding if they have this token */}
          {userHolding && (
            <TokenHolding
              holding={userHolding}
              backgroundImage={tokenDetails.image}
              onSharePress={handleShareHolding}
            />
          )}

          <TokenAbout description={tokenDetails.description} />

          <TokenInfo
            marketCap={formatMarketCap(tokenDetails?.marketCap || 0)}
            volume24h={tokenDetails?.volume24h ? formatMarketCap(tokenDetails.volume24h) : 'N/A'}
            holders={tokenDetails?.holders || 0}
            circulatingSupply={
              tokenDetails.totalSupply ? tokenDetails.totalSupply.toLocaleString() : 'N/A'
            }
            createdAt={new Date(tokenDetails.createdAt).toLocaleDateString()}
          />

          <View style={styles.divider} />

          <TokenSocials socialLinks={formatSocialsForDisplay(tokenDetails.socials)} />
        </View>
      </ScrollView>

      <FloatingBuyButton
        tokenName={tokenDetails.name}
        tokenImage={tokenDetails.image}
        tokenAddress={tokenDetails.address}
        tokenPrice={tokenDetails.price}
      />
      <BottomNav activeTab={null} />

      {/* Top Holders Modal */}
      <TopHoldersModal
        visible={showHoldersModal}
        onClose={() => setShowHoldersModal(false)}
        topHolders={topHolders}
        tokenSymbol={tokenDetails?.symbol}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  contentContainer: {
    marginTop: -80,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
    paddingBottom: 160,
    shadowColor: colors.neutral[1000],
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: colors.background.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginHorizontal: 24,
    marginVertical: 20,
    marginLeft: -24,
    marginRight: -24,
    paddingLeft: 24,
    paddingRight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    fontFamily: fonts.primaryMedium,
    color: colors.text.primary,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: fonts.secondary,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});
