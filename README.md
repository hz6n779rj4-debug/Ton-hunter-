# Ton Gemz
Ton Gemz is a TON-focused token discovery site inspired by the structure of SolHunters, with a homepage, listing board, token profile pages, submit flow, and admin dashboard.

## What is included
- Hero landing page with promoted coins, top upvoted 24H, top gainers 24H, all-time top voted, and recently added sections
- Explore page with filters for votes, 24H votes, gainers, and recent listings
- Individual token page with stats and social links
- Submit coin form
- Admin dashboard with promote toggle flow
- Supabase SQL schema and seed file
- TONAPI + STON.fi enrichment hooks
- Fallback sample data when env vars are missing

## Stack
- Next.js 15
- TypeScript
- Tailwind CSS
- Supabase
- TONAPI
- STON.fi API

## Local setup
1. Copy `.env.example` to `.env.local`
2. Add your Supabase and TONAPI credentials
3. Run `npm install`
4. Run `npm run dev`

## Free deployment
### Best option
- Frontend: Vercel free tier
- Database/Auth: Supabase free tier

### Why
- Vercel is the easiest free deployment for a Next.js app like this
- Supabase gives you hosted Postgres and auth on a free plan
- Railway free access changes often, so Vercel + Supabase is the safest free setup right now

## Deploy steps
1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL editor
3. Optionally run `scripts/seed.sql`
4. Push the project to GitHub
5. Import the repo into Vercel
6. Add the env vars from `.env.example`
7. Deploy

## Environment variables
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TONAPI_BASE_URL=https://tonapi.io/v2
TONAPI_KEY=
STON_API_BASE_URL=https://api.ston.fi/v1
ADMIN_SECRET=change-me
```

## Notes
- Without Supabase configured, the app falls back to sample data
- For better live market data, connect TONAPI and STON.fi
- This is a clean production starter, not a copyrighted pixel clone
