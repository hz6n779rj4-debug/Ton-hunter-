import { storageBucket, supabaseAdmin } from './supabase';
export type TokenCategory = 'Meme' | 'New Launches';

export type ListedToken = {
  id: string;
  name: string;
  symbol: string;
  address: string;
  description: string;
  logo_url: string;
  website?: string;
  telegram?: string;
  twitter?: string;
  category?: TokenCategory;
  verified_team?: boolean;
  is_claimed?: boolean;
  claimed_by_telegram_id?: string | null;
  claimed_by_username?: string | null;
  listed_at: string;
  promoted: boolean;
  votes_24h: number;
  votes_all_time: number;
  admin_boost_votes: number;
  holders?: number;
  price_usd?: number;
  market_cap_usd?: number;
  liquidity_usd?: number;
  volume_24h_usd?: number;
  change_24h_percent?: number;
  chart_url?: string;
  status?: 'pending' | 'approved' | 'rejected';
  listing_tier?: 'free' | 'fast';
  promotion_duration_days?: number | null;
  promotion_expires_at?: string | null;
  payment_reference?: string | null;
};

const TONAPI_BASE = process.env.TONAPI_BASE_URL || 'https://tonapi.io/v2';
const STON_API_BASE = process.env.STON_API_BASE_URL || 'https://api.ston.fi/v1';
const DEXSCREENER_BASE = process.env.DEXSCREENER_BASE_URL || 'https://api.dexscreener.com/latest/dex';

const headers = (): HeadersInit => {
  const token = process.env.TONAPI_KEY;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function getTokenScore(token: ListedToken) {
  return Number(token.votes_all_time || 0) + Number(token.admin_boost_votes || 0);
}

function normalizeCategory(value?: string | null): TokenCategory {
  return value === 'Meme' ? 'Meme' : 'New Launches';
}

function normalizeToken(token: Partial<ListedToken>): ListedToken {
  return {
    id: String(token.id || (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2))),
    name: String(token.name || 'Unknown Token'),
    symbol: String(token.symbol || 'TON'),
    address: String(token.address || ''),
    description: String(token.description || 'No description provided.'),
    logo_url: String(token.logo_url || '/placeholder-token.png'),
    website: token.website || undefined,
    telegram: token.telegram || undefined,
    twitter: token.twitter || undefined,
    category: normalizeCategory(token.category),
    verified_team: Boolean(token.verified_team),
    is_claimed: Boolean(token.is_claimed),
    claimed_by_telegram_id: token.claimed_by_telegram_id || null,
    claimed_by_username: token.claimed_by_username || null,
    listed_at: String(token.listed_at || new Date().toISOString()),
    promoted: Boolean(token.promoted),
    votes_24h: Number(token.votes_24h || 0),
    votes_all_time: Number(token.votes_all_time || 0),
    admin_boost_votes: Number(token.admin_boost_votes || 0),
    holders: token.holders != null ? Number(token.holders) : undefined,
    price_usd: token.price_usd != null ? Number(token.price_usd) : undefined,
    market_cap_usd: token.market_cap_usd != null ? Number(token.market_cap_usd) : undefined,
    liquidity_usd: token.liquidity_usd != null ? Number(token.liquidity_usd) : undefined,
    volume_24h_usd: token.volume_24h_usd != null ? Number(token.volume_24h_usd) : undefined,
    change_24h_percent: token.change_24h_percent != null ? Number(token.change_24h_percent) : undefined,
    chart_url: token.chart_url || undefined,
    status: (token.status as ListedToken['status']) || 'approved',
    listing_tier: (token.listing_tier as ListedToken['listing_tier']) || 'free',
    promotion_duration_days: token.promotion_duration_days != null ? Number(token.promotion_duration_days) : null,
    promotion_expires_at: token.promotion_expires_at || null,
    payment_reference: token.payment_reference || null,
  };
}

const allowSampleData = process.env.ALLOW_SAMPLE_DATA === 'true' && process.env.NODE_ENV !== 'production';

async function getDbTokens(includePending = false): Promise<ListedToken[]> {
  if (!supabaseAdmin) {
    if (allowSampleData && !includePending) {
      return (await import('./sample-data')).sampleTokens.map(normalizeToken);
    }
    return [];
  }

  let query = supabaseAdmin.from('tokens').select('*').order('promoted', { ascending: false }).order('votes_24h', { ascending: false });
  if (!includePending) query = query.eq('status', 'approved');

  const { data, error } = await query;
  if (error) {
    if (allowSampleData && !includePending) {
      return (await import('./sample-data')).sampleTokens.map(normalizeToken);
    }
    return [];
  }
  if (!data?.length) return [];
  return data.map((item) => normalizeToken(item as Partial<ListedToken>));
}

async function enrichToken(token: ListedToken): Promise<ListedToken> {
  try {
    const [jetton, market, dex] = await Promise.all([
      fetch(`${TONAPI_BASE}/jettons/${token.address}`, { headers: headers(), next: { revalidate: 180 } }),
      fetch(`${STON_API_BASE}/assets/${token.address}`, { next: { revalidate: 180 } }),
      fetch(`${DEXSCREENER_BASE}/tokens/${token.address}`, { next: { revalidate: 180 } }),
    ]);
    const jettonJson = jetton.ok ? await jetton.json() : null;
    const marketJson = market.ok ? await market.json() : null;
    const dexJson = dex.ok ? await dex.json() : null;
    const resolved = marketJson?.asset || marketJson?.data || marketJson || {};
    const pair = Array.isArray(dexJson?.pairs) && dexJson.pairs.length ? dexJson.pairs[0] : null;

    let uploadedLogo = token.logo_url;
    if (uploadedLogo && !uploadedLogo.startsWith('http') && !uploadedLogo.startsWith('/') && supabaseAdmin) {
      const { data } = supabaseAdmin.storage.from(storageBucket).getPublicUrl(uploadedLogo);
      uploadedLogo = data.publicUrl;
    }

    const priceUsd = pair?.priceUsd ?? resolved?.dex_usd_price ?? resolved?.priceUsd ?? token.price_usd;
    const marketCapUsd = pair?.fdv ?? resolved?.dex_market_cap_usd ?? resolved?.marketCapUsd ?? token.market_cap_usd;
    const liquidityUsd = pair?.liquidity?.usd ?? resolved?.dex_liquidity_usd ?? resolved?.liquidityUsd ?? token.liquidity_usd;
    const volume24hUsd = pair?.volume?.h24 ?? resolved?.volume_24h_usd ?? resolved?.volume24hUsd ?? token.volume_24h_usd;
    const change24hPercent = pair?.priceChange?.h24 ?? resolved?.price_change_24h ?? resolved?.change24h ?? token.change_24h_percent;
    const chartUrl = pair?.url ?? token.chart_url;

    return {
      ...token,
      name: jettonJson?.metadata?.name || token.name,
      symbol: jettonJson?.metadata?.symbol || token.symbol,
      logo_url: uploadedLogo || jettonJson?.metadata?.image || token.logo_url,
      description: token.description || jettonJson?.metadata?.description || token.description,
      holders: Number(jettonJson?.holders_count || token.holders),
      price_usd: priceUsd != null ? Number(priceUsd) : token.price_usd,
      market_cap_usd: marketCapUsd != null ? Number(marketCapUsd) : token.market_cap_usd,
      liquidity_usd: liquidityUsd != null ? Number(liquidityUsd) : token.liquidity_usd,
      volume_24h_usd: volume24hUsd != null ? Number(volume24hUsd) : token.volume_24h_usd,
      change_24h_percent: change24hPercent != null ? Number(change24hPercent) : token.change_24h_percent,
      chart_url: chartUrl || token.chart_url,
    };
  } catch {
    return token;
  }
}

export async function getTokens(includePending = false): Promise<ListedToken[]> {
  const tokens = await getDbTokens(includePending);
  return Promise.all(tokens.map((token) => enrichToken(token)));
}

export async function getTokenByAddress(address: string): Promise<ListedToken | null> {
  const normalizedAddress = decodeURIComponent(String(address || '')).trim();
  if (!normalizedAddress) return null;

  if (supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('tokens')
      .select('*')
      .eq('address', normalizedAddress)
      .maybeSingle();
    if (data) return enrichToken(normalizeToken(data as Partial<ListedToken>));
  }

  const tokens = await getTokens(true);
  return tokens.find((token) => decodeURIComponent(String(token.address || '')).trim() === normalizedAddress) || null;
}

export async function getHomepageData() {
  const tokens = await getTokens();
  const now = Date.now();
  const promoted = tokens
    .filter((token) => token.promoted && (!token.promotion_expires_at || new Date(token.promotion_expires_at).getTime() > now))
    .slice(0, 6);
  const trending = [...tokens].sort((a, b) => {
    const scoreA = Number(a.votes_24h || 0) + Number(a.admin_boost_votes || 0) + (a.promoted ? 25 : 0);
    const scoreB = Number(b.votes_24h || 0) + Number(b.admin_boost_votes || 0) + (b.promoted ? 25 : 0);
    return scoreB - scoreA;
  }).slice(0, 6);
  const allTimeBest = [...tokens].sort((a, b) => getTokenScore(b) - getTokenScore(a)).slice(0, 6);
  const newListings = [...tokens].sort((a, b) => new Date(b.listed_at).getTime() - new Date(a.listed_at).getTime()).slice(0, 6);
  const topGainers = [...tokens]
    .filter((token) => Number(token.change_24h_percent || 0) > 0)
    .sort((a, b) => {
      const changeDiff = Number(b.change_24h_percent || 0) - Number(a.change_24h_percent || 0);
      if (changeDiff !== 0) return changeDiff;
      return Number(b.volume_24h_usd || 0) - Number(a.volume_24h_usd || 0);
    })
    .slice(0, 6);
  const verifiedTeam = tokens.filter((token) => token.verified_team).sort((a, b) => getTokenScore(b) - getTokenScore(a)).slice(0, 6);

  return {
    promoted,
    trending,
    todaysBest: trending,
    allTimeBest,
    newListings,
    topGainers,
    verifiedTeam,
    topVoted: allTimeBest,
    latest: newListings,
  };
}
