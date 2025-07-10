# Environment Variables Configuration

Create a `.env.local` file in the root of your project with the following variables:

## Required Variables

### Crossmint Configuration
```bash
# Your Crossmint API key for authentication and embedded wallets
# Get this from https://console.crossmint.com/
EXPO_PUBLIC_CROSSMINT_API_KEY=your-crossmint-api-key-here
```

### Backend API Configuration
```bash
# REST API endpoint
EXPO_PUBLIC_API_URL=https://api.glow.club

# WebSocket endpoint (AWS API Gateway)
EXPO_PUBLIC_WS_URL=wss://ws.glow.club

# Or for Cloudflare Workers:
# EXPO_PUBLIC_WS_URL=wss://broadcast.yourdomain.com
# EXPO_PUBLIC_USE_CLOUDFLARE=true
```

### WebSocket Configuration
```bash
# Use Cloudflare for WebSocket? (true/false)
# Set to true if using Cloudflare Workers, false for AWS API Gateway
EXPO_PUBLIC_USE_CLOUDFLARE=false
```

## Optional Variables

### Error Tracking
```bash
# Sentry DSN for error tracking
EXPO_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## Development vs Production

For local development:
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_WS_URL=ws://localhost:3000
```

For production, use your deployed backend URLs.

## Notes

1. All Expo environment variables must be prefixed with `EXPO_PUBLIC_`
2. The WebSocket URL format differs between AWS and Cloudflare:
   - AWS: `wss://xxx.execute-api.region.amazonaws.com/stage`
   - Cloudflare: `wss://your-subdomain.yourdomain.com`
3. Make sure to restart the Expo development server after changing environment variables 