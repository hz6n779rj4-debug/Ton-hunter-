create extension if not exists pgcrypto;

create table if not exists public.tokens (
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
  status text not null default 'pending',
  listing_tier text not null default 'free',
  promotion_duration_days integer,
  promotion_expires_at timestamptz,
  payment_reference text
);

alter table public.tokens enable row level security;

drop policy if exists "public read approved tokens" on public.tokens;
create policy "public read approved tokens" on public.tokens for select using (status = 'approved');
