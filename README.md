# KYRON Live Package

This package contains both parts of the KYRON system:

- `web` in the project root: Next.js site + owner dashboard
- `telegram-bot-live/`: live Telegram bot for submissions, voting, status checks, banner requests, and admin actions

## Deploy setup

### 1) Website
Deploy the project root to Vercel.

Required env vars:
- `ADMIN_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_BANNER_BUCKET=banners`
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=token-logos`

### 2) Telegram bot
Deploy `telegram-bot-live` separately on Railway.

Required env vars are inside `telegram-bot-live/.env.example`.

### 3) Supabase
Run `supabase/schema.sql` first.

## Live features included

### Website
- token listings
- token detail pages
- voting with 24h cooldown
- owner boost votes
- banner ads manager
- pending/listed/promoted admin flow

### Telegram bot
- `/start`
- `/submit`
- `/vote <contract>`
- `/prices`
- `/status <contract>`
- `/mylisting`
- `/banner`
- `/support`
- admin: `/approve`, `/reject`, `/boost`, `/search`, `/pending`

## Important
- Website and bot share the same Supabase project.
- Public users can vote once per token every 24 hours.
- Owner/admin boost votes stay separate from public votes.
