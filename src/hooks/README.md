# TanStack Query Hooks

This directory contains custom hooks that use TanStack Query for data fetching and state management.

## User Hooks

### `useUserBalance`
Fetches the USDC balance for a wallet address.

```tsx
import { useUserBalance } from '@/hooks';

function MyComponent() {
  const { balance, isLoading, error, refreshBalance } = useUserBalance(walletAddress);
  
  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error loading balance</Text>;
  
  return (
    <View>
      <Text>${balance.toFixed(2)}</Text>
      <Button onPress={refreshBalance} title="Refresh" />
    </View>
  );
}
```

### `useUserProfile`
Fetches the user profile for a wallet address.

```tsx
import { useUserProfile } from '@/hooks';

function ProfileComponent() {
  const { data: profile, isLoading } = useUserProfile(walletAddress);
  
  if (isLoading) return <ActivityIndicator />;
  
  return <Text>{profile?.referralCode}</Text>;
}
```

### `useUpdateUserProfile`
Updates the user profile with optimistic updates.

```tsx
import { useUpdateUserProfile } from '@/hooks';

function EditProfileComponent() {
  const mutation = useUpdateUserProfile(walletAddress);
  
  const handleSave = () => {
    mutation.mutate({
      profileUrl: 'https://example.com/image.jpg',
      referredBy: 'REFERRAL_CODE'
    });
  };
  
  return (
    <Button 
      onPress={handleSave} 
      disabled={mutation.isPending}
      title="Save Profile"
    />
  );
}
```

## Token Hooks

### `useTokenPrice`
Fetches the latest price for a token with auto-refresh every 5 seconds.

```tsx
import { useTokenPrice } from '@/hooks';

function TokenPriceComponent({ tokenAddress }: { tokenAddress: string }) {
  const { data, isLoading } = useTokenPrice(tokenAddress);
  
  if (isLoading) return <ActivityIndicator />;
  
  return <Text>${data?.price.toFixed(6)}</Text>;
}
```

### `useTokenMetadata`
Fetches token metadata (name, symbol, image, etc).

```tsx
import { useTokenMetadata } from '@/hooks';

function TokenInfoComponent({ tokenAddress }: { tokenAddress: string }) {
  const { data: metadata } = useTokenMetadata(tokenAddress);
  
  return (
    <View>
      <Image source={{ uri: metadata?.imageUrl }} />
      <Text>{metadata?.name} ({metadata?.symbol})</Text>
    </View>
  );
}
```

### `useMultipleTokenPrices`
Fetches prices for multiple tokens in parallel.

```tsx
import { useMultipleTokenPrices } from '@/hooks';

function PortfolioComponent({ tokenAddresses }: { tokenAddresses: string[] }) {
  const { data: prices } = useMultipleTokenPrices(tokenAddresses);
  
  return (
    <FlatList
      data={tokenAddresses}
      renderItem={({ item }) => (
        <Text>{item}: ${prices?.[item]?.price.toFixed(6)}</Text>
      )}
    />
  );
}
```

## Best Practices

1. **Error Handling**: Always handle loading and error states
2. **Optimistic Updates**: Use mutations for updates with optimistic UI
3. **Caching**: Leverage TanStack Query's built-in caching
4. **Refetch Control**: Use `refetchInterval` for real-time data
5. **Conditional Fetching**: Use the `enabled` option to prevent unnecessary requests

## Configuration

All hooks use sensible defaults for:
- `staleTime`: How long data is considered fresh
- `gcTime`: How long data is kept in cache
- `refetchInterval`: Auto-refresh intervals
- `retry`: Automatic retry on failure

These can be overridden per-hook if needed. 