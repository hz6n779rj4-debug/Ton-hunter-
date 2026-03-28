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

export type BannerAd = {
  id: string;
  title: string;
  image_url: string;
  target_url: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  display_order: number;
  created_at: string;
};

export type VoteState = {
  status: 'success' | 'cooldown' | 'error' | null;
  cooldownHours?: number;
  nextVoteAt?: string | null;
  message?: string;
};

export type ClaimRequest = {
  id: string;
  token_address: string;
  telegram_id?: string | null;
  username?: string | null;
  proof: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};
