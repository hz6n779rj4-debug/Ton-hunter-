insert into public.tokens (name, ticker, address, logo_url, website, telegram, twitter, description, status, listing_tier)
values (
  'Resistance Dog',
  'REDO',
  'EQBZ_SAMPLE_REDO_ADDRESS',
  '/project-placeholder.png',
  'https://redoton.com/home',
  'https://t.me/redotoken',
  'https://x.com/redotoken',
  'TON-native meme project with community-driven visibility.',
  'approved',
  'fast'
)
on conflict (address) do nothing;
