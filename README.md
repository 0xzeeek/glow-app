# Glow - Mobile Meme-Coin Trading App

Production-grade React Native / Expo application for trading meme-coins on Solana.

## Tech Stack

- **Expo SDK 51** (managed workflow)
- **TypeScript** (strict mode)
- **React Navigation v7** + Expo Router
- **Reanimated 3**, Skia, Moti, React Native Gesture Handler
- **Zustand** (state management with subscribeWithSelector)
- **TanStack Query v5** (data fetching & caching)
- **Dynamic SDK** (phone-OTP authentication + embedded wallet)
- **FlashList**, Lodash, React Native SVG, Expo Blur, Sentry

## Project Structure

```
app/                    # Expo Router entry points
├── (auth)/            # Authentication flow
├── (onboarding)/      # Onboarding screens
├── (home)/            # Main app screens
├── (token)/           # Token detail screens
└── (profile)/         # User profile screens

src/
├── components/        # Reusable UI components
├── hooks/            # Custom React hooks
├── services/         # API, WebSocket, Auth services
├── stores/           # Zustand state stores
├── theme/            # Design tokens (colors, typography, motion)
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── tests/            # Test files and setup
```

## Architecture

### Services
- **ApiClient**: Centralized API client with TanStack Query integration
- **WebSocketManager**: Real-time price updates and balance tracking
- **AuthService**: Dynamic SDK integration for phone authentication
- **OfflineManager**: AsyncStorage-based caching for offline support
- **ErrorHandler**: Centralized error handling with Sentry integration

### State Management
- **tradingStore**: Live prices, trade feed, balances
- **userStore**: Wallet, cash balance, profile
- **uiStore**: Toasts, banners, modal states

### Animation Guidelines
- FPS target: 60 fps on mid-range Android
- Max overshoot: 8px
- Max animation duration: 400ms
- Native driver only (Reanimated/Skia)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
# Create .env file
EXPO_PUBLIC_API_URL=https://api.your-backend.com
EXPO_PUBLIC_WS_URL=wss://ws.your-backend.com
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
EXPO_PUBLIC_DYNAMIC_ENV_ID=your-dynamic-env-id
```

3. Run the app:
```bash
# iOS
npm run ios

# Android
npm run android
```

## Development

### Testing
```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Linting & Formatting
```bash
# Lint
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

## Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## License

Proprietary - All rights reserved 