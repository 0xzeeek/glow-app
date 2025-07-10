export interface TopMover {
  id: string;
  name: string;
  image: string;
  changePercent: number;
}

export interface FeaturedTokenData {
  id: string;
  name: string;
  image: string;
  status: string;
  marketCap: string;
}

export interface CreatorToken {
  id: string;
  creatorName: string;
  avatar: string;
  marketCap: string;
  price: string;
  changePercent: number;
  chartData: number[];
}

export const topMovers: TopMover[] = [
  { id: '1', name: 'User1', image: 'https://i.pravatar.cc/150?img=1', changePercent: 3.12 },
  { id: '2', name: 'User2', image: 'https://i.pravatar.cc/150?img=2', changePercent: -2.67 },
  { id: '3', name: 'User3', image: 'https://i.pravatar.cc/150?img=3', changePercent: 28.4 },
  { id: '4', name: 'User4', image: 'https://i.pravatar.cc/150?img=4', changePercent: -1.97 },
  { id: '5', name: 'User5', image: 'https://i.pravatar.cc/150?img=5', changePercent: 15.3 },
  { id: '6', name: 'User6', image: 'https://i.pravatar.cc/150?img=6', changePercent: 45.2 },
];

export const featuredToken: FeaturedTokenData = {
  id: 'featured-1',
  name: 'VisualBleed',
  image: 'https://i.pravatar.cc/300?img=25',
  status: 'LIVE',
  marketCap: '$8.3M',
};

export const creatorTokens: CreatorToken[] = [
  {
    id: 'ct-1',
    creatorName: 'Andrew_Allen',
    avatar: 'https://i.pravatar.cc/150?img=7',
    marketCap: '$35M',
    price: '$0.007',
    changePercent: 1.16,
    chartData: [20, 22, 25, 23, 27, 26, 30, 32, 35, 38],
  },
  {
    id: 'ct-2',
    creatorName: 'Sarah_Chen',
    avatar: 'https://i.pravatar.cc/150?img=8',
    marketCap: '$12.4M',
    price: '$0.0043',
    changePercent: -2.34,
    chartData: [45, 42, 40, 38, 35, 33, 30, 28, 25, 23],
  },
  {
    id: 'ct-3',
    creatorName: 'Mike_Digital',
    avatar: 'https://i.pravatar.cc/150?img=9',
    marketCap: '$8.7M',
    price: '$0.0021',
    changePercent: 5.67,
    chartData: [15, 18, 20, 19, 25, 28, 30, 35, 38, 42],
  },
  {
    id: 'ct-4',
    creatorName: 'Elena_Art',
    avatar: 'https://i.pravatar.cc/150?img=10',
    marketCap: '$23.1M',
    price: '$0.0089',
    changePercent: -0.89,
    chartData: [30, 32, 31, 30, 29, 28, 27, 26, 25, 24],
  },
  {
    id: 'ct-5',
    creatorName: 'James_Crypto',
    avatar: 'https://i.pravatar.cc/150?img=11',
    marketCap: '$5.6M',
    price: '$0.0012',
    changePercent: 12.45,
    chartData: [10, 12, 15, 18, 22, 25, 30, 35, 40, 45],
  },
  {
    id: 'ct-6',
    creatorName: 'Lisa_NFT',
    avatar: 'https://i.pravatar.cc/150?img=12',
    marketCap: '$17.8M',
    price: '$0.0056',
    changePercent: -5.23,
    chartData: [35, 34, 32, 30, 28, 25, 22, 20, 18, 15],
  },
  {
    id: 'ct-7',
    creatorName: 'Tom_Builder',
    avatar: 'https://i.pravatar.cc/150?img=13',
    marketCap: '$42.3M',
    price: '$0.0098',
    changePercent: 3.21,
    chartData: [25, 26, 28, 27, 30, 32, 35, 36, 38, 40],
  },
  {
    id: 'ct-8',
    creatorName: 'Nina_Meta',
    avatar: 'https://i.pravatar.cc/150?img=14',
    marketCap: '$9.2M',
    price: '$0.0034',
    changePercent: -1.78,
    chartData: [22, 21, 20, 19, 18, 17, 16, 15, 14, 13],
  },
]; 