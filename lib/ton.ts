import { sampleTokens } from './sample-data';
import { storageBucket, supabaseAdmin } from './supabase';
import { ListedToken } from './types';

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

function normalizeToken(token: Partial<ListedToken>): ListedToken {
  return {
    id: String(token.id || crypto.randomUUID()),
    name: String(token.name || 'Unknown Token'),
    symbol: String(token.symbol || 'TON'),
    address: String(token.address || ''),
    description: String(token.description || 'No description provided.'),
    logo_url: String(token.logo_url || '/placeholder-token.png'),
    website: token.website || undefined,
    telegram: token.telegram || undefined,
    twitter: token.twitter || undefined,
    category: token.category || 'General',
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

async function getDbTokens(includePending = false): Promise<ListedToken[]> {
  if (!supabaseAdmin) {
    return includePending ? [] : sampleTokens.map(normalizeToken);
  }

  let query = supabaseAdmin.from('tokens').select('*').order('promoted', { ascending: false }).order('votes_24h', { ascending: false });
  if (!includePending) query = query.eq('status', 'approved');

  const { data, error } = await query;
  if (error) return includePending ? [] : sampleTokens.map(normalizeToken);
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
  const tokens = await getTokens(true);
  return tokens.find((token) => token.address === address) || null;
}

export async function getHomepageData() {
  const tokens = await getTokens();
  const now = Date.now();
  const promoted = tokens
    .filter((token) => token.promoted && (!token.promotion_expires_at || new Date(token.promotion_expires_at).getTime() > now))
    .slice(0, 6);
  const trending = [...tokens].sort((a, b) => (b.votes_24h || 0) - (a.votes_24h || 0)).slice(0, 10);
  const topVoted = [...tokens].sort((a, b) => getTokenScore(b) - getTokenScore(a)).slice(0, 6);
  const topGainers = [...tokens].sort((a, b) => (b.change_24h_percent || 0) - (a.change_24h_percent || 0)).slice(0, 6);
  const latest = [...tokens].sort((a, b) => new Date(b.listed_at).getTime() - new Date(a.listed_at).getTime()).slice(0, 8);

  return { promoted, trending, topVoted, topGainers, latest };
}
