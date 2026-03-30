alter table public.tokens add column if not exists votes_24h integer not null default 0;
alter table public.tokens add column if not exists votes_all_time integer not null default 0;
create unique index if not exists tokens_address_idx on public.tokens(address);
create index if not exists vote_logs_token_voter_created_idx on public.vote_logs(token_address, voter_key, created_at desc);
