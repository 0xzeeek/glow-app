// metro.config.js   (RN 0.79 / Expo 53 or later)
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Small custom resolver
const resolveRequestWithPackageExports = (context, moduleName, platform) => {
  // 1️⃣ isows (viem) – disable exports completely
  if (moduleName === 'isows') {
    return context.resolveRequest(
      { ...context, unstable_enablePackageExports: false },
      moduleName,
      platform,
    );
  }

  // 2️⃣ zustand@4 – disable exports completely
  if (moduleName.startsWith('zustand')) {
    return context.resolveRequest(
      { ...context, unstable_enablePackageExports: false },
      moduleName,
      platform,
    );
  }

  // 3️⃣ jose – keep exports *on* but assert the "browser" condition
  if (moduleName === 'jose') {
    return context.resolveRequest(
      { ...context, unstable_conditionNames: ['browser'] },
      moduleName,
      platform,
    );
  }

  // fallback to the default behaviour
  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.resolveRequest = resolveRequestWithPackageExports;

module.exports = config;
