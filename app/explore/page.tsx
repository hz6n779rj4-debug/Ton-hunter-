import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

type SearchParams = {
  sort?: string
}

type ExploreProps = {
  searchParams?: SearchParams
}

type TokenRow = {
  id: string
  name: string
  ticker: string | null
  address: string
  logo_url: string | null
  description: string | null
  price_usd: number | null
  market_cap: number | null
  volume_24h: number | null
  holders: number | null
  votes_24h: number | null
  votes_all_time: number | null
  status: string | null
  featured: boolean | null
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value)
}

function formatUsd(value: number | null | undefined) {
  if (value === null || value === undefined) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function sortTokens(tokens: TokenRow[], sort: string) {
  switch (sort) {
    case 'votes':
      return [...tokens].sort(
        (a, b) => (b.votes_all_time ?? 0) - (a.votes_all_time ?? 0)
      )
    case 'gainers':
      return [...tokens].sort((a, b) => (b.price_usd ?? 0) - (a.price_usd ?? 0))
    case 'holders':
      return [...tokens].sort((a, b) => (b.holders ?? 0) - (a.holders ?? 0))
    default:
      return [...tokens].sort(
        (a, b) => (b.votes_24h ?? 0) - (a.votes_24h ?? 0)
      )
  }
}

function Filter({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-2 text-sm ${
        active
          ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
          : 'border-white/10 text-white/70 hover:border-cyan-400/40 hover:text-white'
      }`}
    >
      {label}
    </Link>
  )
}

export default async function ExplorePage({ searchParams }: ExploreProps) {
  const sort = searchParams?.sort ?? 'trending'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let tokens: TokenRow[] = []

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data } = await supabase
      .from('tokens')
      .select(
        'id,name,ticker,address,logo_url,description,price_usd,market_cap,volume_24h,holders,votes_24h,votes_all_time,status,featured'
      )
      .eq('status', 'approved')

    tokens = (data as TokenRow[] | null) ?? []
  }

  const sorted = sortTokens(tokens, sort)

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-white">
      <div className="mb-8">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-cyan-300">
          Explore TON Projects
        </p>
        <h1 className="text-4xl font-semibold">Find listed TON gems</h1>
        <p className="mt-3 max-w-2xl text-white/70">
          Browse approved projects, check live stats, and discover trending TON tokens.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <Filter href="/explore?sort=trending" label="Trending" active={sort === 'trending'} />
        <Filter href="/explore?sort=votes" label="Top voted" active={sort === 'votes'} />
        <Filter href="/explore?sort=gainers" label="Gainers" active={sort === 'gainers'} />
        <Filter href="/explore?sort=holders" label="Holders" active={sort === 'holders'} />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((token, index) => (
          <Link
            key={token.id}
            href={`/token/${token.address}`}
            className="rounded-3xl border border-cyan-500/20 bg-[#05122b] p-5 transition hover:border-cyan-400/40"
          >
            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/5">
                {token.logo_url ? (
                  <img
                    src={token.logo_url}
                    alt={token.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-cyan-300">
                    {token.name.slice(0, 1)}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-cyan-300">#{index + 1}</span>
                  <h2 className="truncate text-xl font-semibold">{token.name}</h2>
                </div>
                <p className="truncate text-sm text-white/60">
                  {token.ticker ? `$${token.ticker}` : '—'} • {token.address}
                </p>
              </div>
            </div>

            <p className="mb-4 line-clamp-3 text-sm text-white/70">
              {token.description || 'No description yet.'}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 p-3">
                <p className="mb-1 text-xs uppercase tracking-[0.2em] text-white/40">Price</p>
                <p className="text-lg font-semibold">{formatUsd(token.price_usd)}</p>
              </div>

              <div className="rounded-2xl border border-white/10 p-3">
                <p className="mb-1 text-xs uppercase tracking-[0.2em] text-white/40">Market Cap</p>
                <p className="text-lg font-semibold">{formatUsd(token.market_cap)}</p>
              </div>

              <div className="rounded-2xl border border-white/10 p-3">
                <p className="mb-1 text-xs uppercase tracking-[0.2em] text-white/40">24H Volume</p>
                <p className="text-lg font-semibold">{formatUsd(token.volume_24h)}</p>
              </div>

              <div className="rounded-2xl border border-white/10 p-3">
                <p className="mb-1 text-xs uppercase tracking-[0.2em] text-white/40">Holders</p>
                <p className="text-lg font-semibold">{formatNumber(token.holders)}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-white/60">
              <span>{formatNumber(token.votes_24h)} 24h votes</span>
              <span>{formatNumber(token.votes_all_time)} all-time</span>
            </div>
          </Link>
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-[#05122b] p-8 text-white/70">
          No approved tokens yet.
        </div>
      )}
    </main>
  )
}
