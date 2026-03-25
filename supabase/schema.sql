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
  status text not null default 'pending' check (status in ('pending','approved','rejected','pending_payment')),
  listing_tier text not null default 'free' check (listing_tier in ('free','fast')),
  payment_tx_hash text,
  approved_at timestamptz,
  feature_expires_at timestamptz,
  votes_24h integer not null default 0,
  votes_all_time integer not null default 0,
  holders integer,
  price_usd numeric,
  market_cap_usd numeric,
  liquidity_usd numeric,
  volume_24h_usd numeric,
  change_24h_percent numeric,
  chart_url text
);

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  token_address text not null references public.tokens(address) on delete cascade,
  request_type text not null check (request_type in ('listing','promotion')),
  status text not null default 'pending' check (status in ('pending','paid','expired')),
  amount_ton numeric not null,
  duration_days integer,
  payment_reference text not null unique,
  payment_wallet text not null,
  payment_tx_hash text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.tokens enable row level security;
alter table public.payment_requests enable row level security;

do $$ begin
  create policy "public read approved tokens" on public.tokens
  for select using (status = 'approved');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "service role payment requests" on public.payment_requests
  for all using (false) with check (false);
exception when duplicate_object then null;
end $$;

insert into storage.buckets (id, name, public)
values ('token-logos', 'token-logos', true)
on conflict (id) do nothing;
