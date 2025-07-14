import { Platform } from 'react-native';

export const fonts = {
  primary: Platform.select({
    ios: 'DGMTypeset-Regular',
    android: 'DGMTypeset-Regular',
  }) as string,
  primaryMedium: Platform.select({
    ios: 'DGMTypeset-Medium',
    android: 'DGMTypeset-Medium',
  }) as string,
  primaryBold: Platform.select({
    ios: 'DGMTypeset-Bold',
    android: 'DGMTypeset-Bold',
  }) as string,
  secondary: Platform.select({
    ios: 'SFPro-Regular',
    android: 'SFPro-Regular',
  }) as string,
  secondaryMedium: Platform.select({
    ios: 'SFPro-Medium',
    android: 'SFPro-Medium',
  }) as string,
  secondaryBold: Platform.select({
    ios: 'SFPro-Bold',
    android: 'SFPro-Bold',
  }) as string,
} as const;

// Export type definitions
export type FontFamily = keyof typeof fonts;