import { Social } from '../types';

/**
 * Map social platform names to display names and icons
 */
const SOCIAL_PLATFORM_MAP: Record<string, { displayName: string; icon: string }> = {
  x: { displayName: 'X', icon: 'logo-twitter' },
  twitter: { displayName: 'X', icon: 'logo-twitter' },
  instagram: { displayName: 'Instagram', icon: 'logo-instagram' },
  youtube: { displayName: 'YouTube', icon: 'logo-youtube' },
  tiktok: { displayName: 'TikTok', icon: 'logo-tiktok' },
  website: { displayName: 'Website', icon: 'globe-outline' },
  kick: { displayName: 'Kick', icon: 'videocam-outline' },
};

/**
 * Convert Social array to format expected by TokenSocials component
 */
export function formatSocialsForDisplay(socials?: Social[]): Array<{
  platform: string;
  handle: string;
  icon: string;
}> {
  if (!socials || socials.length === 0) return [];
  
  return socials
    .map(social => {
      const platformInfo = SOCIAL_PLATFORM_MAP[social.name.toLowerCase()];
      if (!platformInfo) return null;
      
      return {
        platform: platformInfo.displayName,
        handle: social.url,
        icon: platformInfo.icon,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

/**
 * Get a specific social URL by name
 */
export function getSocialUrl(socials: Social[] | undefined, name: string): string | undefined {
  if (!socials) return undefined;
  
  const social = socials.find(s => s.name.toLowerCase() === name.toLowerCase());
  return social?.url;
}

/**
 * Check if a token has any social links
 */
export function hasSocials(socials?: Social[]): boolean {
  return socials ? socials.length > 0 : false;
} 