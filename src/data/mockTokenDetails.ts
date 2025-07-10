export interface TokenDetails {
  id: string;
  name: string;
  symbol: string;
  price: string;
  priceChange: number;
  profileImage: string;
  backgroundImage: string;
  marketCap: string;
  volume24h: string;
  holders: number;
  circulatingSupply: string;
  createdAt: string;
  description: string;
  topHolders: {
    position: number;
    avatar: string;
  }[];
  socialLinks: {
    platform: string;
    handle: string;
    icon: string;
  }[];
  chartData: {
    timestamp: number;
    price: number;
  }[];
}

import { topMovers, featuredToken, creatorTokens } from './mockTokens';

export const mockTokenDetails: TokenDetails = {
  id: '1',
  name: 'VisualBleed',
  symbol: 'VB',
  price: '$0.007',
  priceChange: 1.16,
  profileImage: 'https://i.pravatar.cc/300?img=25',
  backgroundImage: 'https://picsum.photos/800/600?grayscale&blur=2',
  marketCap: '$8.3M',
  volume24h: '$134,877',
  holders: 17000,
  circulatingSupply: '237,271',
  createdAt: '6 day / 2 months ago',
  description: 'Born in a jet engine. Powered by energy drinks and 90 mode. Hold it if your heart Rate matches the Trams rate.',
  topHolders: [
    { position: 1, avatar: 'https://i.pravatar.cc/150?img=1' },
    { position: 2, avatar: 'https://i.pravatar.cc/150?img=2' },
    { position: 3, avatar: 'https://i.pravatar.cc/150?img=3' },
  ],
  socialLinks: [
    { platform: 'X', handle: '@creatorname', icon: 'logo-twitter' },
    { platform: 'Instagram', handle: '@creatorname', icon: 'logo-instagram' },
    { platform: 'YouTube', handle: '@creatorname', icon: 'logo-youtube' },
  ],
  chartData: generateMockChartData(),
};

function generateMockChartData() {
  const data = [];
  const basePrice = 0.005;
  const now = Date.now();
  
  for (let i = 0; i < 100; i++) {
    const variation = Math.random() * 0.004 - 0.002;
    data.push({
      timestamp: now - (100 - i) * 3600000,
      price: basePrice + variation + (i * 0.00002),
    });
  }
  
  return data;
}

export function getTokenDetailsById(id: string): TokenDetails {
  // Check if it's a creator token
  const creatorToken = creatorTokens.find(token => token.id === id);
  if (creatorToken) {
    return {
      id: creatorToken.id,
      name: creatorToken.creatorName,
      symbol: creatorToken.creatorName.substring(0, 3).toUpperCase(),
      price: creatorToken.price,
      priceChange: creatorToken.changePercent,
      profileImage: creatorToken.avatar,
      backgroundImage: 'https://picsum.photos/800/600?grayscale&blur=2&random=' + id,
      marketCap: creatorToken.marketCap,
      volume24h: '$' + Math.floor(Math.random() * 500000 + 50000).toLocaleString(),
      holders: Math.floor(Math.random() * 20000 + 5000),
      circulatingSupply: Math.floor(Math.random() * 500000 + 100000).toLocaleString(),
      createdAt: Math.floor(Math.random() * 60) + ' days ago',
      description: `${creatorToken.creatorName} is a visionary creator building the future of web3. Join the community and be part of something amazing.`,
      topHolders: [
        { position: 1, avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}` },
        { position: 2, avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}` },
        { position: 3, avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}` },
      ],
      socialLinks: [
        { platform: 'X', handle: `@${creatorToken.creatorName}`, icon: 'logo-twitter' },
        { platform: 'Instagram', handle: `@${creatorToken.creatorName}`, icon: 'logo-instagram' },
        { platform: 'YouTube', handle: `@${creatorToken.creatorName}`, icon: 'logo-youtube' },
      ],
      chartData: generateMockChartData(),
    };
  }

  // Check if it's the featured token
  if (featuredToken.id === id) {
    return {
      id: featuredToken.id,
      name: featuredToken.name,
      symbol: 'VB',
      price: '$0.007',
      priceChange: 1.16,
      profileImage: featuredToken.image,
      backgroundImage: 'https://picsum.photos/800/600?grayscale&blur=2&random=' + id,
      marketCap: featuredToken.marketCap,
      volume24h: '$134,877',
      holders: 17000,
      circulatingSupply: '237,271',
      createdAt: '6 days ago',
      description: 'Born in a jet engine. Powered by energy drinks and 90 mode. Hold it if your heart Rate matches the Trams rate.',
      topHolders: [
        { position: 1, avatar: 'https://i.pravatar.cc/150?img=1' },
        { position: 2, avatar: 'https://i.pravatar.cc/150?img=2' },
        { position: 3, avatar: 'https://i.pravatar.cc/150?img=3' },
      ],
      socialLinks: [
        { platform: 'X', handle: '@visualbleed', icon: 'logo-twitter' },
        { platform: 'Instagram', handle: '@visualbleed', icon: 'logo-instagram' },
        { platform: 'YouTube', handle: '@visualbleed', icon: 'logo-youtube' },
      ],
      chartData: generateMockChartData(),
    };
  }

  // Check if it's a top mover
  const topMover = topMovers.find(token => token.id === id);
  if (topMover) {
    return {
      id: topMover.id,
      name: topMover.name,
      symbol: topMover.name.substring(0, 3).toUpperCase(),
      price: '$0.00' + Math.floor(Math.random() * 99 + 1),
      priceChange: topMover.changePercent,
      profileImage: topMover.image,
      backgroundImage: 'https://picsum.photos/800/600?grayscale&blur=2&random=' + id,
      marketCap: '$' + Math.floor(Math.random() * 50 + 5) + 'M',
      volume24h: '$' + Math.floor(Math.random() * 200000 + 10000).toLocaleString(),
      holders: Math.floor(Math.random() * 15000 + 3000),
      circulatingSupply: Math.floor(Math.random() * 300000 + 50000).toLocaleString(),
      createdAt: Math.floor(Math.random() * 30) + ' days ago',
      description: `${topMover.name} is making waves in the crypto space. Don't miss out on this incredible opportunity.`,
      topHolders: [
        { position: 1, avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}` },
        { position: 2, avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}` },
        { position: 3, avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}` },
      ],
      socialLinks: [
        { platform: 'X', handle: `@${topMover.name.toLowerCase()}`, icon: 'logo-twitter' },
        { platform: 'Instagram', handle: `@${topMover.name.toLowerCase()}`, icon: 'logo-instagram' },
        { platform: 'YouTube', handle: `@${topMover.name.toLowerCase()}`, icon: 'logo-youtube' },
      ],
      chartData: generateMockChartData(),
    };
  }

  // Default fallback
  return mockTokenDetails;
} 