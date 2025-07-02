/// <reference types="jest" />
import '@testing-library/jest-native/extend-expect';
import { cleanup } from '@testing-library/react-native';

// Auto cleanup after each test
afterEach(cleanup);

// Mock expo modules
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn(),
  openURL: jest.fn(),
}));

// Mock React Native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  captureEvent: jest.fn(),
  setUser: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

// Mock WebSocket
global.WebSocket = require('jest-websocket-mock').WS;

// Mock Dynamic SDK
jest.mock('@dynamic-labs/sdk-core', () => ({
  createClient: jest.fn(() => ({
    extend: jest.fn(() => ({
      auth: {
        email: {
          sendOTP: jest.fn(),
          verifyOTP: jest.fn(),
        },
        logout: jest.fn(),
      },
      wallets: {
        getWallets: jest.fn(() => []),
        createEmbeddedWallet: jest.fn(),
        getSigner: jest.fn(),
      },
    })),
  })),
}));

jest.mock('@dynamic-labs/react-native-extension', () => ({
  ReactNativeExtension: jest.fn(() => ({})),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

// Mock console methods in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 