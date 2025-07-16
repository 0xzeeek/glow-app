export interface TopMover {
  address: string;
  name: string;
  symbol: string;
  image: string;
  change24h: number;
}

export interface FeaturedTokenData {
  address: string;
  name: string;
  image: string;
  status: string;
  marketCap: string;
  price: number;
}

export interface CreatorToken {
  address: string;
  name: string;
  symbol: string;
  image: string;
  marketCap: string;
  price: string;
  change24h: number;
  chartData: number[];
}

export const topMovers: TopMover[] = [
  { address: '1', name: 'User1', symbol: 'ABC', image: 'https://i.pravatar.cc/150?img=1', change24h: 3.12 },
  { address: '2', name: 'User2', symbol: 'DEF', image: 'https://i.pravatar.cc/150?img=2', change24h: -2.67 },
  { address: '3', name: 'User3', symbol: 'GHI', image: 'https://i.pravatar.cc/150?img=3', change24h: 28.4 },
  { address: '4', name: 'User4', symbol: 'JKL', image: 'https://i.pravatar.cc/150?img=4', change24h: -1.97 },
  { address: '5', name: 'User5', symbol: 'MNO', image: 'https://i.pravatar.cc/150?img=5', change24h: 15.3 },
  { address: '6', name: 'User6', symbol: 'PQR', image: 'https://i.pravatar.cc/150?img=6', change24h: 45.2 },
];

export const featuredToken: FeaturedTokenData = {
  address: 'featured-1',
  name: 'VisualBleed',
  image: 'https://i.pravatar.cc/300?img=25',
  status: 'LIVE',
  marketCap: '$8.3M',
  price: 0.007,
};

export const creatorTokens: CreatorToken[] = [
  {
    address: 'ct-1',
    name: 'Andrew_Allen',
    symbol: 'ABCD',
    image: 'https://i.pravatar.cc/150?img=7',
    marketCap: '$35M',
    price: '$0.007',
    change24h: 1.16,
    chartData: [20, 22, 25, 23, 27, 26, 30, 32, 35, 38],
  },
  {
    address: 'ct-2',
    name: 'Sarah_Chen',
    symbol: 'EFGH',
    image: 'https://i.pravatar.cc/150?img=8',
    marketCap: '$12.4M',
    price: '$0.0043',
    change24h: -2.34,
    chartData: [45, 42, 40, 38, 35, 33, 30, 28, 25, 23],
  },
  {
    address: 'ct-3',
    name: 'Mike_Digital',
    symbol: 'IJKL',
    image: 'https://i.pravatar.cc/150?img=9',
    marketCap: '$8.7M',
    price: '$0.0021',
    change24h: 5.67,
    chartData: [15, 18, 20, 19, 25, 28, 30, 35, 38, 42],
  },
  {
    address: 'ct-4',
    name: 'Elena_Art',
    symbol: 'MNOP',
    image: 'https://i.pravatar.cc/150?img=10',
    marketCap: '$23.1M',
    price: '$0.0089',
    change24h: -0.89,
    chartData: [30, 32, 31, 30, 29, 28, 27, 26, 25, 24],
  },
  {
    address: 'ct-5',
    name: 'James_Crypto',
    symbol: 'QRST',
    image: 'https://i.pravatar.cc/150?img=11',
    marketCap: '$5.6M',
    price: '$0.0012',
    change24h: 12.45,
    chartData: [10, 12, 15, 18, 22, 25, 30, 35, 40, 45],
  },
  {
    address: 'ct-6',
    name: 'Lisa_NFT',
    symbol: 'UVWX',
    image: 'https://i.pravatar.cc/150?img=12',
    marketCap: '$17.8M',
    price: '$0.0056',
    change24h: -5.23,
    chartData: [35, 34, 32, 30, 28, 25, 22, 20, 18, 15],
  },
  {
    address: 'ct-7',
    name: 'Tom_Builder',
    symbol: 'YZAB',
    image: 'https://i.pravatar.cc/150?img=13',
    marketCap: '$42.3M',
    price: '$0.0098',
    change24h: 3.21,
    chartData: [25, 26, 28, 27, 30, 32, 35, 36, 38, 40],
  },
  {
    address: 'ct-8',
    name: 'Nina_Meta',
    symbol: 'CDEF',
    image: 'https://i.pravatar.cc/150?img=14',
    marketCap: '$9.2M',
    price: '$0.0034',
    change24h: -1.78,
    chartData: [22, 21, 20, 19, 18, 17, 16, 15, 14, 13],
  },
]; 