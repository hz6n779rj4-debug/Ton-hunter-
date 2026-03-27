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
  admin_boost_votes integer not null default 0,
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
  payment_reference text,
  source text not null default 'site',
  submitted_by_telegram_id text,
  submitted_by_username text,
  admin_notes text
);

alter table public.tokens add column if not exists admin_boost_votes integer not null default 0;
alter table public.tokens add column if not exists source text not null default 'site';
alter table public.tokens add column if not exists submitted_by_telegram_id text;
alter table public.tokens add column if not exists submitted_by_username text;
alter table public.tokens add column if not exists admin_notes text;
alter table public.tokens enable row level security;

create index if not exists tokens_status_idx on public.tokens(status);
create index if not exists tokens_submitted_by_telegram_id_idx on public.tokens(submitted_by_telegram_id);

drop policy if exists "public read approved tokens" on public.tokens;
create policy "public read approved tokens" on public.tokens for select using (status = 'approved');

create table if not exists public.vote_logs (
  id uuid primary key default gen_random_uuid(),
  token_address text not null,
  voter_key text not null,
  source text not null default 'site',
  created_at timestamptz not null default now()
);

create index if not exists vote_logs_token_address_idx on public.vote_logs(token_address);
create index if not exists vote_logs_voter_key_idx on public.vote_logs(voter_key);
alter table public.vote_logs enable row level security;
drop policy if exists "service role manages vote logs" on public.vote_logs;
create policy "service role manages vote logs" on public.vote_logs for all using (false) with check (false);

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  token_address text,
  action text not null,
  value integer,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.admin_actions enable row level security;
drop policy if exists "service role manages admin actions" on public.admin_actions;
create policy "service role manages admin actions" on public.admin_actions for all using (false) with check (false);

create table if not exists public.banner_ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  target_url text not null,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.banner_ads enable row level security;
drop policy if exists "public read active banner ads" on public.banner_ads;
create policy "public read active banner ads" on public.banner_ads for select using (is_active = true);

create table if not exists public.telegram_users (
  telegram_id text primary key,
  username text,
  first_name text,
  last_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.telegram_users enable row level security;
drop policy if exists "service role manages telegram users" on public.telegram_users;
create policy "service role manages telegram users" on public.telegram_users for all using (false) with check (false);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  token_address text,
  payer_reference text not null unique,
  telegram_id text,
  kind text not null,
  amount_ton numeric,
  status text not null default 'pending',
  tx_hash text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_telegram_id_idx on public.payments(telegram_id);
create index if not exists payments_status_idx on public.payments(status);
alter table public.payments enable row level security;
drop policy if exists "service role manages payments" on public.payments;
create policy "service role manages payments" on public.payments for all using (false) with check (false);
