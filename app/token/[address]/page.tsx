import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, Globe, MessageCircle, Twitter, Vote, BadgeCheck, Copy, ArrowUpRight } from 'lucide-react';
import { getTokenByAddress, getTokenScore } from '@/lib/ton';
import { formatCompact, formatPercent, formatUsd, shortAddress } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function TokenPage({ params, searchParams }: { params: Promise<{ address: string }>; searchParams?: Promise<{ vote?: string; next?: string; reason?: string }>; }) {
  const { address } = await params;
  const query = (await searchParams) || {};
  const normalizedAddress = decodeURIComponent(address);
  const token = await getTokenByAddress(normalizedAddress);
  if (!token || token.status === 'rejected') notFound();

  const totalScore = getTokenScore(token);
  const nextVote = query.next ? new Date(query.next) : null;
  const positive = (token.change_24h_percent || 0) >= 0;

  return (
    <section className="container-main py-8 sm:py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="card overflow-hidden p-5 sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <Image src={token.logo_url} alt={token.name} width={84} height={84} className="h-20 w-20 rounded-3xl border border-stroke/70 object-cover" unoptimized />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-3xl font-bold text-white">{token.name}</h1>
                    {token.verified_team ? <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200"><BadgeCheck className="h-3.5 w-3.5" />Verified Team</span> : null}
                    {token.promoted ? <span className="rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1 text-xs text-violet-200">Promoted</span> : null}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-slate-300"><span className="text-lg font-medium">${token.symbol}</span><span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm ${positive ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-rose-400/20 bg-rose-400/10 text-rose-300'}`}>{formatPercent(token.change_24h_percent)}</span></div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[24px] border border-stroke/70 bg-slate-950/30 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-2xl border border-stroke/70 bg-slate-950/45 px-4 py-3 text-sm text-slate-200">{shortAddress(token.address)}</div>
                  <a href={token.chart_url || '#'} target="_blank" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-stroke/70 bg-slate-950/45 text-slate-200 hover:border-cyan-400/35"><ArrowUpRight className="h-5 w-5" /></a>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-stroke/70 bg-slate-950/45 text-slate-200"><Copy className="h-5 w-5" /></div>
                </div>
                <p className="mt-4 text-base leading-7 text-slate-300">{token.description}</p>
              </div>

              <div className="rounded-[24px] border border-stroke/70 bg-slate-950/30 p-4">
                <div className="flex flex-col gap-3">
                  {token.website ? <Social href={token.website} label="Website" icon={<Globe className="h-4 w-4" />} /> : null}
                  {token.telegram ? <Social href={token.telegram} label="Telegram" icon={<MessageCircle className="h-4 w-4" />} /> : null}
                  {token.twitter ? <Social href={token.twitter} label="X" icon={<Twitter className="h-4 w-4" />} /> : null}
                  {token.chart_url ? <Social href={token.chart_url} label="Chart" icon={<ExternalLink className="h-4 w-4" />} /> : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Cap" value={formatUsd(token.market_cap_usd)} />
            <Stat label="FDV" value={formatUsd(token.market_cap_usd)} />
            <Stat label="Liquidity" value={formatUsd(token.liquidity_usd)} />
            <Stat label="24H Vol" value={formatUsd(token.volume_24h_usd)} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="rounded-[24px] border border-stroke/70 bg-slate-950/25 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Performance</div>
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-stroke/70 bg-slate-950/35 px-4 py-4"><div className="text-xl font-semibold text-white">Price</div><div className={`text-3xl font-bold ${positive ? 'text-emerald-300' : 'text-rose-300'}`}>{formatPercent(token.change_24h_percent)}</div></div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3"><MiniStat label="Price" value={formatUsd(token.price_usd)} /><MiniStat label="Holders" value={formatCompact(token.holders)} /><MiniStat label="24H Votes" value={formatCompact(token.votes_24h)} /></div>
            </div>

            <div className="rounded-[24px] border border-stroke/70 bg-slate-950/25 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Trading</div>
              <div className="mt-3 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center"><div className="text-sm uppercase tracking-[0.18em] text-emerald-300">Public</div><div className="mt-2 text-3xl font-bold text-white">{formatCompact(token.votes_all_time)}</div></div><div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-center"><div className="text-sm uppercase tracking-[0.18em] text-rose-300">Boost</div><div className="mt-2 text-3xl font-bold text-white">{formatCompact(token.admin_boost_votes)}</div></div></div>
              <div className="mt-3 text-center text-sm text-slate-400">{formatCompact(totalScore)} total score</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="card p-5 sm:p-6">
            <h2 className="text-xl font-semibold">Community actions</h2>
            <p className="mt-2 text-slate-400">Normal users can vote once per token every 24 hours. Owner dashboard votes stay separate as boost votes.</p>
            {query.vote === 'success' ? <Notice tone="success" text="Vote counted. You can vote this token again after 24 hours." /> : null}
            {query.vote === 'cooldown' ? <Notice tone="warning" text={nextVote ? `You already voted. Next vote opens ${nextVote.toLocaleString()}.` : 'You already voted on this token in the last 24 hours.'} /> : null}
            {query.vote === 'error' ? <Notice tone="error" text={`Vote could not be saved right now.${query.reason ? ` (${query.reason})` : ''}`} /> : null}
            <div className="mt-5 flex flex-wrap gap-3"><form action="/api/vote" method="post"><input type="hidden" name="tokenId" value={token.id} /><button className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-medium text-slate-950"><Vote className="h-4 w-4" />Vote this coin</button></form><Link href={`/promote?address=${encodeURIComponent(normalizedAddress)}`} className="rounded-full border border-stroke px-5 py-3 font-medium hover:border-cyan-400/40">Promote this coin</Link></div>
          </div>
          <div className="card p-5 sm:p-6"><h2 className="text-xl font-semibold">Listing profile</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><Line label="Project name" value={token.name} /><Line label="Ticker" value={`$${token.symbol}`} /><Line label="Address" value={normalizedAddress} /><Line label="Status" value={token.promoted ? 'Promoted' : 'Standard listing'} /></div></div>
        </div>
      </div>
    </section>
  );
}

function Social({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) { return <Link href={href} target="_blank" className="inline-flex items-center justify-between gap-2 rounded-2xl border border-stroke px-4 py-3 text-sm text-slate-200 hover:border-cyan-400/40"><span className="inline-flex items-center gap-2">{icon}{label}</span><ArrowUpRight className="h-4 w-4" /></Link>; }
function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-stroke/70 bg-slate-950/20 p-4"><div className="text-xs uppercase tracking-wide text-slate-500">{label}</div><div className="mt-2 text-2xl font-semibold">{value}</div></div>; }
function MiniStat({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-stroke/70 bg-slate-950/20 p-4"><div className="text-xs uppercase tracking-wide text-slate-500">{label}</div><div className="mt-2 text-lg font-semibold">{value}</div></div>; }
function Line({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-stroke/60 bg-slate-950/20 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div><div className="mt-2 break-all text-sm text-slate-200">{value}</div></div>; }
function Notice({ tone, text }: { tone: 'success' | 'warning' | 'error'; text: string }) { const classes = tone === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : tone === 'warning' ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-rose-500/30 bg-rose-500/10 text-rose-300'; return <div className={`mt-4 rounded-2xl border p-3 text-sm ${classes}`}>{text}</div>; }
