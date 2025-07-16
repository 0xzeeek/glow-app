import React from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import TokenHeader from '../../src/components/token-details/TokenHeader';
import TokenStatsChart from '../../src/components/token-details/TokenStatsChart';
import TokenAbout from '../../src/components/token-details/TokenAbout';
import TokenInfo from '../../src/components/token-details/TokenInfo';
import TokenSocials from '../../src/components/token-details/TokenSocials';
import FloatingBuyButton from '../../src/components/token-details/FloatingBuyButton';
import BottomNav from '../../src/components/navigation/BottomNav';
import { useTokenDetails, useWebSocketPriceUpdates } from '../../src/hooks';
import { colors, fonts } from '../../src/theme';

export default function TokenDetailScreen() {
  const { id } = useLocalSearchParams();
  const { tokenDetails, topHolders, chartData, isLoading, error } = useTokenDetails(id as string);
  
  // Subscribe to real-time price updates for this token
  useWebSocketPriceUpdates(id as string);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.text.primary} />
      </View>
    );
  }

  if (error || !tokenDetails) {
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
          price={tokenDetails.price}
          priceChange={tokenDetails.priceChange}
          profileImage={tokenDetails.image}
          backgroundImage={tokenDetails.backgroundImage}
        />
        
        <View style={styles.contentContainer}>
          <TokenStatsChart
            marketCap={tokenDetails.marketCap}
            topHolders={topHolders}
            chartData={chartData}
          />
          
          <View style={styles.divider} />
          
          <TokenAbout description={tokenDetails.description} />
          
          <View style={styles.divider} />
          
          <TokenInfo
            marketCap={tokenDetails.marketCap}
            volume24h={tokenDetails.volume24h}
            holders={tokenDetails.holders}
            circulatingSupply={tokenDetails.circulatingSupply}
            createdAt={tokenDetails.createdAt}
          />
          
          <View style={styles.divider} />
          
          <TokenSocials socialLinks={tokenDetails.socialLinks} />
        </View>
      </ScrollView>
      
      <FloatingBuyButton 
        tokenName={tokenDetails.name}
        tokenImage={tokenDetails.image}
        tokenId={tokenDetails.address}
        tokenPrice={parseFloat(tokenDetails.price.replace('$', ''))} 
      />
      <BottomNav activeTab={null} />
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