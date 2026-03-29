import Link from 'next/link';
import { ArrowUpRight, TrendingUp, Vote, Sparkles, BadgeCheck } from 'lucide-react';
import type { ListedToken } from '@/lib/types';
import { formatCompact, formatPercent, formatUsd, shortAddress } from '@/lib/utils';
import { getTokenScore } from '@/lib/ton';

export function TokenCard({ token, compact = false, rank }: { token: ListedToken; compact?: boolean; rank?: number }) {
  const positive = (token.change_24h_percent || 0) >= 0;
  const logoSrc = token.logo_url || '/placeholder-token.png';
  const totalScore = getTokenScore(token);

  return (
    <div className="card p-4 transition duration-200 hover:-translate-y-1 hover:border-cyan-400/35 hover:shadow-glow">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img src={logoSrc} alt={token.name} className="h-14 w-14 rounded-2xl border border-stroke/70 bg-slate-950/40 object-cover" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {rank ? <span className="text-xs font-semibold text-cyan-300">#{rank}</span> : null}
              <h3 className="truncate text-lg font-semibold text-white">{token.name}</h3>
              {token.promoted ? <span className="rounded-full border border-violet-400/25 bg-violet-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-violet-200">Promoted</span> : null}
              {token.verified_team ? <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-emerald-200"><BadgeCheck className="h-3 w-3" />Verified Team</span> : null}
            </div>
            <p className="truncate text-sm text-slate-400">${token.symbol} • {shortAddress(token.address)}</p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-400">
              {token.promoted ? <span className="rounded-full border border-violet-400/25 px-2 py-0.5 text-violet-200">Featured</span> : null}
              {token.verified_team ? <span className="rounded-full border border-emerald-400/25 px-2 py-0.5 text-emerald-200">Verified</span> : null}
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${positive ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-rose-400/20 bg-rose-400/10 text-rose-300'}`}>
          <TrendingUp className="h-3.5 w-3.5" />
          {formatPercent(token.change_24h_percent)}
        </div>
      </div>

      <p className="mb-4 line-clamp-2 min-h-10 text-sm text-slate-300">{token.description}</p>

      <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
        <Stat label="Price" value={formatUsd(token.price_usd)} />
        <Stat label="Market cap" value={formatUsd(token.market_cap_usd)} />
        <Stat label="24h volume" value={formatUsd(token.volume_24h_usd)} />
        <Stat label="Holders" value={formatCompact(token.holders)} />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1"><Vote className="h-3.5 w-3.5" />{formatCompact(token.votes_24h)} 24h</span>
          <span>{formatCompact(token.votes_all_time)} public</span>
          <span className="inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" />{formatCompact(token.admin_boost_votes || 0)} boost</span>
          <span className="text-slate-300">{formatCompact(totalScore)} total</span>
        </div>
        <Link href={`/token/${encodeURIComponent(token.address)}`} className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">View <ArrowUpRight className="h-4 w-4" /></Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stroke/60 bg-slate-950/30 p-3">
      <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="font-medium text-slate-100">{value}</div>
    </div>
  );
}
