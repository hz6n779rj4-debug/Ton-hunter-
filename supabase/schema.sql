create extension if not exists pgcrypto;

create table if not exists public.tokens (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ticker text not null,
  address text not null unique,
  logo_url text,
  website text,
  telegram text,
  twitter text,
  description text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  listing_tier text not null default 'free' check (listing_tier in ('free', 'fast')),
  created_at timestamptz not null default now()
);

alter table public.tokens enable row level security;

drop policy if exists "public can read approved tokens" on public.tokens;
create policy "public can read approved tokens"
  on public.tokens for select
  using (status = 'approved');
