create extension if not exists pgcrypto;

drop table if exists public.tokens cascade;

create table public.tokens (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  symbol text not null,
  address text not null unique,
  description text not null,
  logo_url text not null,
  website text,
  telegram text,
  twitter text,
  category text default 'General',
  listed_at timestamptz not null default now(),
  promoted boolean not null default false,
  votes_24h integer not null default 0,
  votes_all_time integer not null default 0,
  holders integer,
  price_usd numeric,
  market_cap_usd numeric,
  liquidity_usd numeric,
  volume_24h_usd numeric,
  change_24h_percent numeric,
  chart_url text,
  status text not null default 'pending_review',
  listing_tier text not null default 'free',
  payment_reference text,
  payment_amount_ton numeric,
  promotion_duration_days integer
);

alter table public.tokens enable row level security;

drop policy if exists "public read approved tokens" on public.tokens;
create policy "public read approved tokens" on public.tokens for select using (status = 'approved');
