# Tonhunters

Tonhunters is a SpyTON-owned TON listing board with:
- device logo upload on submit
- project logos shown on listings
- free review listings
- fast-list payment instructions (10 TON)
- featured promotion pricing page
- simple admin approve/reject/feature flow

## Deploy
1. Create a fresh Supabase project.
2. Run `supabase/schema.sql`.
3. Create a public Storage bucket named `token-logos`.
4. Add env vars in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=token-logos`
   - `TONAPI_BASE_URL=https://tonapi.io/v2`
   - `TONAPI_KEY` (optional)
   - `STON_API_BASE_URL=https://api.ston.fi/v1`
   - `ADMIN_SECRET`

## Notes
- Free listing -> pending review.
- Fast listing -> payment instructions page for 10 TON.
- Promotion page shows pricing for 1d / 3d / 7d.
- Automatic on-chain payment verification is not included in this build.
