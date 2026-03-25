import { ListedToken } from './types';
const now = new Date().toISOString();
export const sampleTokens: ListedToken[] = [
  {
    id: '1',
    name: 'Resistance Dog',
    symbol: 'REDO',
    address: 'EQBZ_...m4Cko',
    description: 'TON-native meme momentum driven by culture, visibility, and community support across the ecosystem.',
    logo_url: '/token-placeholder.svg',
    website: 'https://www.redoton.com/home',
    telegram: 'https://t.me/redotoken',
    twitter: 'https://x.com/redotoken',
    listed_at: now,
    promoted: true,
    status: 'approved',
    listing_tier: 'fast',
    approved_at: now,
    votes_24h: 188,
    votes_all_time: 1220,
    holders: 26100,
    price_usd: 0,
    market_cap_usd: 0,
    liquidity_usd: 0,
    volume_24h_usd: 0,
    change_24h_percent: 0,
    chart_url: 'https://www.geckoterminal.com/ton',
    category: 'Meme'
  }
];
