import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, Globe, MessageCircle, Twitter, Vote, BadgeCheck } from 'lucide-react';
import { getTokenByAddress, getTokenScore } from '@/lib/ton';
import { formatCompact, formatPercent, formatUsd, shortAddress } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function TokenPage({
  params,
  searchParams,
}: {
  params: Promise<{ address: string }>;
  searchParams?: Promise<{ vote?: string; next?: string; reason?: string }>;
}) {
  const { address } = await params;
  const query = (await searchParams) || {};
  const normalizedAddress = decodeURIComponent(address);
  const token = await getTokenByAddress(normalizedAddress);

  if (!token || token.status === 'rejected') {
    notFound();
  }

  const totalScore = getTokenScore(token);
  const nextVote = query.next ? new Date(query.next) : null;

  return (
    <section className="container-main py-14">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Image
              src={token.logo_url}
              alt={token.name}
              width={120}
              height={120}
              className="h-24 w-24 rounded-3xl object-cover"
              unoptimized
            />

            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">{token.name}</h1>

                {token.promoted ? (
                  <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs text-violet-200">
                    Promoted
                  </span>
                ) : null}

                {token.verified_team ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified Team
                  </span>
                ) : null}
              </div>

              <p className="text-slate-300">
                ${token.symbol} • {shortAddress(token.address)}
              </p>

              <p className="mt-4 max-w-2xl text-slate-300">{token.description}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                {token.website ? (
                  <Social href={token.website} label="Website" icon={<Globe className="h-4 w-4" />} />
                ) : null}
                {token.telegram ? (
                  <Social href={token.telegram} label="Telegram" icon={<MessageCircle className="h-4 w-4" />} />
                ) : null}
                {token.twitter ? (
                  <Social href={token.twitter} label="X" icon={<Twitter className="h-4 w-4" />} />
                ) : null}
                {token.chart_url ? (
                  <Social href={token.chart_url} label="Chart" icon={<ExternalLink className="h-4 w-4" />} />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 text-xl font-semibold">Token Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Price" value={formatUsd(token.price_usd)} />
            <Stat label="Market Cap" value={formatUsd(token.market_cap_usd)} />
            <Stat label="Liquidity" value={formatUsd(token.liquidity_usd)} />
            <Stat label="24H Volume" value={formatUsd(token.volume_24h_usd)} />
            <Stat label="Holders" value={formatCompact(token.holders)} />
            <Stat label="24H Change" value={formatPercent(token.change_24h_percent)} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card p-6">
          <h2 className="mb-4 text-xl font-semibold">Voting Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="24H Votes" value={formatCompact(token.votes_24h)} />
            <Stat label="Public Votes" value={formatCompact(token.votes_all_time)} />
            <Stat label="Boost Votes" value={formatCompact(token.admin_boost_votes)} />
            <Stat label="Total Score" value={formatCompact(totalScore)} />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold">Community actions</h2>
          <p className="mt-2 text-slate-400">
            Normal users can vote once per token every 24 hours. Owner dashboard votes stay separate as boost votes.
          </p>

          {query.vote === 'success' ? (
            <Notice tone="success" text="Vote counted. You can vote this token again after 24 hours." />
          ) : null}

          {query.vote === 'cooldown' ? (
            <Notice
              tone="warning"
              text={
                nextVote
                  ? `You already voted. Next vote opens ${nextVote.toLocaleString()}.`
                  : 'You already voted on this token in the last 24 hours.'
              }
            />
          ) : null}

          {query.vote === 'error' ? (
            <Notice
              tone="error"
              text={`Vote could not be saved right now.${query.reason ? ` (${query.reason})` : ''}`}
            />
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <form action="/api/vote" method="post">
              <input type="hidden" name="tokenId" value={token.id} />
              <button className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-medium text-slate-950">
                <Vote className="h-4 w-4" />
                Vote this coin
              </button>
            </form>

            <Link
              href={`/promote?address=${encodeURIComponent(normalizedAddress)}`}
              className="rounded-full border border-stroke px-5 py-3 font-medium hover:border-cyan-400/40"
            >
              Promote this coin
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 card p-6">
        <h2 className="text-xl font-semibold">Listing profile</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Line label="Project name" value={token.name} />
          <Line label="Ticker" value={`$${token.symbol}`} />
          <Line label="Address" value={normalizedAddress} />
          <Line label="Status" value={token.promoted ? 'Promoted' : 'Standard listing'} />
        </div>
      </div>
    </section>
  );
}

function Social({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      className="inline-flex items-center gap-2 rounded-full border border-stroke px-4 py-2 text-sm text-slate-200 hover:border-cyan-400/40"
    >
      {icon}
      {label}
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stroke/70 bg-slate-950/20 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stroke/60 bg-slate-950/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-2 break-all text-sm text-slate-200">{value}</div>
    </div>
  );
}

function Notice({ tone, text }: { tone: 'success' | 'warning' | 'error'; text: string }) {
  const classes =
    tone === 'success'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : tone === 'warning'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
        : 'border-rose-500/30 bg-rose-500/10 text-rose-300';

  return <div className={`mt-4 rounded-2xl border p-3 text-sm ${classes}`}>{text}</div>;
}
