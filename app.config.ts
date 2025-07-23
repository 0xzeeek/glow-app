import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  let updatedConfig: ExpoConfig = {
    ...config,
    name: 'glow',
    slug: 'glow-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'glow',
    userInterfaceStyle: 'automatic',
    newArchEnabled: false,
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.zeke.glow',
      infoPlist: {
        NSUserNotificationsUsageDescription:
          'Glow uses notifications to alert you about launches, price moves, and rewards in real time.',
        NSPhotoLibraryUsageDescription:
          'Glow needs access to your photo library to allow you to update your profile picture.',
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: 'com.zekeglow.glow',
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
    },
    plugins: [
      'expo-router',
      'expo-image-picker',
      [
        'expo-notifications',
        {
          icon: './assets/images/notification-icon.png',
          color: '#000000',
          sounds: [],
        },
      ],
      ['expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
          },
        },
      ],
      [
        '@config-plugins/react-native-branch',
        {
          apiKey: 'key_test_gsyew8RqLARCQu65b9bUuimarzf8BRE2',
          iosAppDomain: '6zemu.test-app.link',
        },
      ],
      'expo-web-browser',
      'expo-secure-store',
    ],
    experiments: {
      typedRoutes: true,
    },
    updates: {
      fallbackToCacheTimeout: 0,
      url: 'https://u.expo.dev/14810e18-bb4f-4d6d-9976-410019e23ecd',
    },
    owner: 'glow-systems',
    extra: {
      router: {},
      eas: {
        projectId: '14810e18-bb4f-4d6d-9976-410019e23ecd',
      },
      branchLiveKey: 'key_live_puFfB8PBHyStVF50aXmOymooEtiXFGIf',
      branchTestKey: 'key_test_gsyew8RqLARCQu65b9bUuimarzf8BRE2',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
  };

  return updatedConfig;
};
