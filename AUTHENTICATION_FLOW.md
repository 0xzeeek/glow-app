# Authentication Flow with Dynamic SDK

## Overview

Glow uses Dynamic SDK for all wallet and authentication operations. This provides:
- Email OTP authentication
- Embedded Solana wallets (no external wallet needed)
- Secure transaction signing
- Session management

## Authentication Flow

### 1. Email OTP Login
```typescript
// Send OTP to email
await authService.sendOTP('user@example.com');

// Verify OTP
const wallet = await authService.verifyOTP('user@example.com', '123456');
```

### 2. Behind the Scenes
1. **Dynamic SDK** verifies the email OTP
2. **Dynamic SDK** creates/retrieves embedded Solana wallet
3. **AuthService** gets a nonce from the backend
4. **Dynamic SDK** signs the nonce with the embedded wallet
5. **AuthService** connects to WebSocket with signed authentication

### 3. Transaction Signing
All transactions are signed through Dynamic SDK:
```typescript
const signature = await authService.executeTransaction(transaction);
```

## Key Points

- **No External Wallets**: Users don't need Phantom, Solflare, etc.
- **Email-Based**: Authentication is tied to email address
- **Embedded Wallet**: Dynamic manages the private keys securely
- **Backend Compatible**: Works with the Solana Trading Backend's nonce-based auth

## Environment Variables

```bash
# Dynamic SDK Configuration
EXPO_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your-dynamic-env-id

# Backend URLs
EXPO_PUBLIC_API_URL=https://your-api.execute-api.us-east-1.amazonaws.com
EXPO_PUBLIC_WS_URL=wss://your-api.execute-api.us-east-1.amazonaws.com/production
```

## Security Notes

- Private keys are managed by Dynamic SDK
- Never exposed to the app code
- Transactions require user approval through Dynamic UI
- Session persists across app restarts 