# WebSocket Updates Documentation

## Overview

The app now uses two separate WebSocket connections:
1. **AWS WebSocket** (BalanceWebSocketManager) - For balance updates and user-specific data
2. **Cloudflare Edge Worker** (PriceSocket) - For real-time price updates using Durable Objects

## Environment Variables

Add the following to your `.env` file:

```bash
# Balance WebSocket URL (AWS)
EXPO_PUBLIC_WS_URL=wss://your-aws-websocket.com/ws

# Price WebSocket URL (Cloudflare Edge Worker)
EXPO_PUBLIC_PRICE_WS_URL=wss://your-edge-worker.workers.dev/ws
```

If `EXPO_PUBLIC_PRICE_WS_URL` is not set, it will default to the main WS URL with `/ws` path.

## Architecture

```
┌─────────────────┐         ┌─────────────────────────┐
│ React Native    │         │ AWS WebSocket           │
│ App             ├────────►│ BalanceWebSocketManager │
│                 │         │ - Balance Updates       │
│                 │         │ - User Data             │
│                 │         └─────────────────────────┘
│                 │         
│                 │         ┌─────────────────────────┐
│                 ├────────►│ Cloudflare Edge         │
│                 │         │ PriceSocket             │
│                 │         │ - Price Updates         │
│                 │         │ - Durable Objects       │
└─────────────────┘         └─────────────────────────┘
```

## Key Changes

### 1. Renamed WebSocketManager to BalanceWebSocketManager
- Makes it clear this manager handles balance updates only
- Removed `useCloudflare` option as it's no longer needed
- Updated all logging to reference "BalanceWebSocket"

### 2. New PriceSocket Class (`src/services/PriceWebSocketManager.ts`)
- Handles connection to Cloudflare Edge Worker
- Uses `{ op: "SUB", token: address }` for subscriptions
- Uses `{ op: "UNSUB", token: address }` for unsubscriptions
- Receives `{ type: "PRICE_UPDATE", token, price, timestamp }` messages

### 3. Updated `useVisibleTokenSubscriptions` Hook
- Now uses PriceSocket instead of the old WebSocket system
- Supports both visible tokens and user balance tokens
- Automatically updates React Query cache with new prices

### 4. Profile Page Updates
- Uses `useVisibleTokenSubscriptions` with `balanceTokens` parameter
- Subscribes to all tokens in user's holdings for real-time price updates

## Usage

### Balance Updates (AWS)
```typescript
// Automatically handled by useWebSocketBalanceUpdates hook
const { isConnected } = useWebSocketBalanceUpdates(walletAddress);
```

### Price Updates (Cloudflare)
```typescript
useVisibleTokenSubscriptions({
  visibleTokens: visibleTokensArray,  // Tokens currently visible on screen
  balanceTokens: userHoldingsArray,   // User's token holdings
  onPriceUpdate: (address, price) => {
    // Handle price update
  }
});
```

## Benefits

1. **Clear Separation**: Balance updates (user-specific) vs Price updates (global)
2. **Scalability**: Durable Objects handle price broadcasting more efficiently
3. **Performance**: Only subscribe to visible tokens + user holdings
4. **Reliability**: Independent reconnection logic for each WebSocket connection
5. **Clarity**: Named managers make it obvious what each connection handles 