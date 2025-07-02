// Central asset exports
// Add your asset imports here as you add them to the project

// Example structure (uncomment and modify as you add assets):
/*
// Onboarding Images
export { default as OnboardingWelcome } from './images/onboarding/welcome.png';
export { default as OnboardingTrade } from './images/onboarding/trade.png';
export { default as OnboardingSecure } from './images/onboarding/secure.png';

// Logos
export { default as GlowLogo } from './images/logos/glow-logo.png';
export { default as GlowLogoSmall } from './images/logos/glow-logo-small.png';

// UI Icons
export { default as IconHome } from './icons/ui/home.svg';
export { default as IconWallet } from './icons/ui/wallet.svg';
export { default as IconProfile } from './icons/ui/profile.svg';

// Animations
export { default as LoadingAnimation } from './animations/onboarding/loading.json';
*/

// Placeholder export to avoid empty file error
export const ASSETS_READY = true;

// Logos
export { default as GlowLogo } from './icons/ui/logo.svg';
export { default as SparkleIcon } from './icons/ui/sparkle.png';

// Onboarding Images
export { default as StarLarge } from './images/onboarding/star-large.png';
export { default as StarMedium } from './images/onboarding/star-medium.png';
export { default as StarSmall } from './images/onboarding/star-small.png';
export { default as LightningBolt } from './images/onboarding/lightning-bolt.png';

// Fonts
export const fonts = {
  'DGMTypeset-Regular': require('./fonts/DGMTypeset-regular.otf'),
  'SFPro-Regular': require('./fonts/SFPro-regular.otf'),
  'SFPro-Medium': require('./fonts/SFPro-medium.otf'),
  'SFPro-Bold': require('./fonts/SFPro-bold.otf'),
}; 