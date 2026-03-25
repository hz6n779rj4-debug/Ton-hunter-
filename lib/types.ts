export type ListingStatus = 'pending' | 'approved' | 'rejected' | 'pending_payment';
export type ListingTier = 'free' | 'fast';
export type PaymentRequestType = 'listing' | 'promotion';
export type PaymentRequestStatus = 'pending' | 'paid' | 'expired';

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
  listed_at: string;
  promoted: boolean;
  votes_24h: number;
  votes_all_time: number;
  holders?: number;
  price_usd?: number;
  market_cap_usd?: number;
  liquidity_usd?: number;
  volume_24h_usd?: number;
  change_24h_percent?: number;
  chart_url?: string;
  category?: string;
  status?: ListingStatus;
  listing_tier?: ListingTier;
  payment_tx_hash?: string;
  approved_at?: string | null;
  feature_expires_at?: string | null;
};

export type PaymentRequest = {
  id: string;
  token_address: string;
  request_type: PaymentRequestType;
  status: PaymentRequestStatus;
  amount_ton: number;
  duration_days?: number | null;
  payment_reference: string;
  payment_wallet: string;
  payment_tx_hash?: string | null;
  created_at: string;
  paid_at?: string | null;
};
