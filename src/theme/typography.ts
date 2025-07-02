import { Platform, TextStyle } from 'react-native';

const fontFamily = {
  regular: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto',
  }),
  medium: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto-Medium',
  }),
  semiBold: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto-Medium',
  }),
  bold: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto-Bold',
  }),
  mono: Platform.select({
    ios: 'SF Mono',
    android: 'monospace',
  }),
} as const;

export const typography = {
  // Display styles
  displayLarge: {
    fontFamily: fontFamily.bold,
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: -0.25,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  displayMedium: {
    fontFamily: fontFamily.bold,
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: 0,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  displaySmall: {
    fontFamily: fontFamily.semiBold,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  
  // Headline styles
  headlineLarge: {
    fontFamily: fontFamily.semiBold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  headlineMedium: {
    fontFamily: fontFamily.semiBold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  headlineSmall: {
    fontFamily: fontFamily.medium,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  
  // Title styles
  titleLarge: {
    fontFamily: fontFamily.medium,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  titleMedium: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  titleSmall: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  
  // Label styles
  labelLarge: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  labelMedium: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  labelSmall: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  
  // Body styles
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  bodyMedium: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  
  // Special styles
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
  overline: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
    fontWeight: '500' as TextStyle['fontWeight'],
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  mono: {
    fontFamily: fontFamily.mono,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
} as const;

export type Typography = typeof typography; 