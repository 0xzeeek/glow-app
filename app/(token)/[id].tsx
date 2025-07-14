import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import TokenHeader from '../../src/components/token-details/TokenHeader';
import TokenStats from '../../src/components/token-details/TokenStats';
import TokenChart from '../../src/components/token-details/TokenChart';
import TokenAbout from '../../src/components/token-details/TokenAbout';
import TokenInfo from '../../src/components/token-details/TokenInfo';
import TokenSocials from '../../src/components/token-details/TokenSocials';
import FloatingBuyButton from '../../src/components/token-details/FloatingBuyButton';
import BottomNav from '../../src/components/navigation/BottomNav';
import { useTokenData } from '../../src/contexts';

export default function TokenDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getTokenDetails } = useTokenData();
  const tokenDetails = getTokenDetails(id as string);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TokenHeader
          name={tokenDetails.name}
          price={tokenDetails.price}
          priceChange={tokenDetails.priceChange}
          profileImage={tokenDetails.profileImage}
          backgroundImage={tokenDetails.backgroundImage}
        />
        
        <TokenStats
          marketCap={tokenDetails.marketCap}
          topHolders={tokenDetails.topHolders}
        />
        
        <TokenChart chartData={tokenDetails.chartData} />
        
        <TokenAbout description={tokenDetails.description} />
        
        <TokenInfo
          marketCap={tokenDetails.marketCap}
          volume24h={tokenDetails.volume24h}
          holders={tokenDetails.holders}
          circulatingSupply={tokenDetails.circulatingSupply}
          createdAt={tokenDetails.createdAt}
        />
        
        <TokenSocials socialLinks={tokenDetails.socialLinks} />
      </ScrollView>
      
      <FloatingBuyButton 
        tokenName={tokenDetails.name}
        tokenImage={tokenDetails.profileImage}
        tokenId={tokenDetails.id}
        tokenPrice={parseFloat(tokenDetails.price.replace('$', ''))} 
      />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
}); 