# Token WebSocket Update System

This document explains how the token WebSocket update system works to automatically update the frontend when new tokens are created on the server.

## Overview

The token update system uses WebSocket connections to push real-time updates about new tokens from the server to the frontend. When a new token is created, the frontend automatically refreshes its token list, ensuring that the new token appears as the featured token on the homepage.

## Frontend Implementation

### 1. Hook: `useTokenSocketUpdates`

Located in `src/hooks/useTokenSocketUpdates.ts`, this hook:
- Encapsulates all WebSocket subscription logic
- Accepts an `onTokenUpdate` callback to handle token events
- Automatically manages connection state and subscriptions
- Provides clean separation of concerns

```typescript
interface UseTokenSocketUpdatesOptions {
  onTokenUpdate: () => void | Promise<void>;
}
```

### 2. TokenDataContext Integration

The `TokenDataContext` uses the `useTokenSocketUpdates` hook:
- Passes `refreshTokenData` as the callback
- When new tokens are created, the data automatically refreshes
- The new token appears as the featured token (most recent by `createdAt`)

### 3. WebSocket Manager Updates

The `LiveWebSocketManager` has been extended to support token events:
- Added `tokenUpdate` event to `WebSocketEvents` interface with proper `TokenUpdateEvent` type
- Handles `TOKEN_CREATED` and `TOKEN_UPDATED` message types

### 4. Type Safety

Created a proper `TokenUpdateEvent` type in `src/types/index.ts`:
```typescript
export interface TokenUpdateEvent {
  type: 'TOKEN_CREATED' | 'TOKEN_UPDATED';
  token: Token;
}
```

## Server Implementation Requirements

The server uses a unified subscription system where a single WebSocket connection can subscribe to multiple types of updates.

### 1. Subscription Messages

#### Subscribe to Live Updates (Unified)
```json
{
  "action": "subscribeLive",
  "subscriptions": {
    "tokens": {
      "type": "all"
    }
  }
}
```

You can also subscribe to both balance and token updates in a single request:
```json
{
  "action": "subscribeLive",
  "subscriptions": {
    "balance": {
      "wallets": ["wallet_address"]
    },
    "tokens": {
      "type": "all"
    }
  }
}
```

### 2. Event Messages

#### Subscription Confirmation
After subscribing, you'll receive:
```json
{
  "type": "SUBSCRIPTION_CONFIRMED",
  "subscriptions": {
    "tokens": {
      "type": "all",
      "message": "Subscribed to all token updates"
    }
  }
}
```

#### Token Creation
When a new token is created, the server broadcasts:

```json
{
  "type": "TOKEN_CREATED",
  "token": {
    "address": "0x...",
    "symbol": "SYMBOL",
    "name": "Token Name",
    "description": "Token description",
    "image": "https://...",
    "video": "https://...",
    "socials": [],
    "price": 0.001,
    "marketCap": 1000000,
    "holders": 1,
    "change24h": 0,
    "volume24h": 0,
    "totalSupply": 1000000000,
    "circulatingSupply": 1000000000,
    "decimals": 18,
    "createdAt": 1234567890,
    "lastUpdated": 1234567890
  }
}
```

When a token is updated:

```json
{
  "type": "TOKEN_UPDATED",
  "token": {
    // Same structure as TOKEN_CREATED
  }
}
```

## How It Works

1. When the app loads, the `useTokenSocketUpdates` hook initializes
2. The hook connects to the WebSocket server and uses the unified `subscribeLive` action to subscribe to token events
3. The server confirms the subscription with a `SUBSCRIPTION_CONFIRMED` message
4. When the server creates a new token, it broadcasts a `TOKEN_CREATED` message
5. The frontend receives this message and calls `refreshTokenData()`
6. The token list is refreshed, and the new token appears as the featured token (most recent by `createdAt`)

The unified subscription system allows the same WebSocket connection to handle both balance updates and token updates, reducing complexity and improving performance.

## Benefits

- **Real-time Updates**: New tokens appear immediately without manual refresh
- **Automatic Featured Token**: The most recently created token automatically becomes the featured token
- **No Polling Required**: Efficient push-based updates instead of periodic polling

## Testing

To test the implementation:

1. Connect to the WebSocket server
2. Create a new token on the backend
3. Verify that the frontend receives the `TOKEN_CREATED` message
4. Confirm that the new token appears as the featured token on the homepage

## Future Enhancements

- Add specific token subscriptions (subscribe to updates for specific token addresses)
- Implement token deletion events
- Add batch update support for multiple tokens
- Implement optimistic updates for better UX 