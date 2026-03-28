import Image from 'next/image';
import Link from 'next/link';
import { isAdminAuthenticated } from '@/lib/auth';
import { getTokenScore, getTokens } from '@/lib/ton';
import { getBannerAds } from '@/lib/banner-ads';
import { formatCompact } from '@/lib/utils';
import { getClaimRequests } from '@/lib/claims';

export const dynamic = 'force-dynamic';

type FilterKey = 'listed' | 'pending' | 'promoted' | 'today' | 'alltime' | 'new' | 'verified' | 'claims';

function StatusPill({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const classes = normalized === 'approved' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : normalized === 'rejected' ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300';
  return <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${classes}`}>{value}</span>;
}
function FilterCard({ label, value, href, active }: { label: string; value: number; href: string; active: boolean }) { return <Link href={href} className={`panel px-4 py-3 text-sm transition ${active ? 'border-cyan-400/50 bg-cyan-400/10 text-white' : 'hover:border-cyan-400/35'}`}>{label}: <span className="font-semibold text-white">{formatCompact(value)}</span></Link>; }
function EmptyState({ text }: { text: string }) { return <div className="card p-6 text-sm text-slate-400">{text}</div>; }

export default async function AdminPanelPage({ searchParams }: { searchParams?: Promise<{ error?: string; message?: string; filter?: string }> }) {
  const params = (await searchParams) || {};
  const authed = await isAdminAuthenticated();
  if (!authed) return <section className="container-main overflow-x-hidden py-8 sm:py-10"><div className="mx-auto max-w-md card p-8"><h1 className="text-3xl font-bold text-white">Owner password required</h1><p className="mt-3 text-slate-400">Go back to <a href="/admin" className="text-cyan-300 underline">/admin</a> and unlock the dashboard.</p></div></section>;

  const selectedFilter = (params.filter || 'listed') as FilterKey;
  const tokens = await getTokens(true);
  const visibleTokens = tokens.filter((token) => token.status !== 'rejected');
  const claimRequests = await getClaimRequests();
  const bannerAds = await getBannerAds(true);

  const views: Record<FilterKey, typeof visibleTokens> = {
    listed: visibleTokens.filter((t) => (t.status || 'approved') === 'approved'),
    pending: visibleTokens.filter((t) => (t.status || 'approved') === 'pending'),
    promoted: visibleTokens.filter((t) => t.promoted),
    today: [...visibleTokens].sort((a,b)=>(b.votes_24h||0)-(a.votes_24h||0)),
    alltime: [...visibleTokens].sort((a,b)=>getTokenScore(b)-getTokenScore(a)),
    new: [...visibleTokens].sort((a,b)=>new Date(b.listed_at).getTime()-new Date(a.listed_at).getTime()),
    verified: visibleTokens.filter((t)=>t.verified_team),
    claims: [],
  };
  const filteredTokens = views[selectedFilter] || views.listed;

  return <section className="container-main overflow-x-hidden py-8 sm:py-10">
    <div className="mx-auto mb-6 max-w-6xl text-center"><h1 className="text-3xl font-bold">Owner dashboard</h1><p className="mt-2 text-slate-400">Approve listings, control promoted slots, manage header banners, verified teams, and project claims.</p></div>
    <div className="mx-auto mb-4 grid max-w-6xl grid-cols-2 gap-3 lg:grid-cols-5">
      <FilterCard label="Listed" value={views.listed.length} href="/admin/panel?filter=listed" active={selectedFilter === 'listed'} />
      <FilterCard label="Pending" value={views.pending.length} href="/admin/panel?filter=pending" active={selectedFilter === 'pending'} />
      <FilterCard label="Promoted" value={views.promoted.length} href="/admin/panel?filter=promoted" active={selectedFilter === 'promoted'} />
      <FilterCard label="Today" value={views.today.length} href="/admin/panel?filter=today" active={selectedFilter === 'today'} />
      <FilterCard label="All Time" value={views.alltime.length} href="/admin/panel?filter=alltime" active={selectedFilter === 'alltime'} />
      <FilterCard label="New" value={views.new.length} href="/admin/panel?filter=new" active={selectedFilter === 'new'} />
      <FilterCard label="Verified Team" value={views.verified.length} href="/admin/panel?filter=verified" active={selectedFilter === 'verified'} />
      <FilterCard label="Claim Requests" value={claimRequests.length} href="/admin/panel?filter=claims" active={selectedFilter === 'claims'} />
    </div>
    {params.message ? <div className="mx-auto mb-5 max-w-6xl card border border-cyan-500/30 p-4 text-sm text-cyan-200">{params.message}</div> : null}
    {params.error ? <div className="mx-auto mb-5 max-w-6xl card border border-rose-500/30 p-4 text-sm text-rose-300">{params.error}</div> : null}

    {selectedFilter === 'claims' ? <div className="mx-auto max-w-6xl space-y-4">{claimRequests.length === 0 ? <EmptyState text="No claim requests yet." /> : claimRequests.map((request) => <div key={request.id} className="card p-5"><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-semibold text-white">{request.username || 'Unknown requester'}</h2><StatusPill value={request.status} /></div><p className="mt-2 break-all text-sm text-slate-400">{request.token_address}</p><p className="mt-3 text-sm text-slate-300">{request.proof}</p><div className="mt-4 flex flex-wrap gap-2"><form action="/api/admin/action" method="post"><input type="hidden" name="action" value="approve-claim" /><input type="hidden" name="request_id" value={request.id} /><input type="hidden" name="address" value={request.token_address} /><button className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">Approve claim</button></form><form action="/api/admin/action" method="post"><input type="hidden" name="action" value="reject-claim" /><input type="hidden" name="request_id" value={request.id} /><input type="hidden" name="address" value={request.token_address} /><button className="rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">Reject claim</button></form></div></div>)}</div> : <div className="mx-auto max-w-6xl space-y-4">{filteredTokens.length === 0 ? <EmptyState text="No tokens found in this tab." /> : filteredTokens.map((token) => <div key={token.id} className="card overflow-hidden p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="truncate text-xl font-semibold text-white">{token.name}</h2><span className="text-sm text-slate-500">${token.symbol}</span><StatusPill value={token.status || 'approved'} />{token.promoted ? <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">Promoted</span> : null}{token.verified_team ? <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">Verified Team</span> : null}</div><p className="mt-2 break-all text-xs leading-6 text-slate-400 sm:text-sm">{token.address}</p><div className="mt-4 grid gap-3 sm:grid-cols-4"><MiniStat label="24h votes" value={formatCompact(token.votes_24h)} /><MiniStat label="Public votes" value={formatCompact(token.votes_all_time)} /><MiniStat label="Boost votes" value={formatCompact(token.admin_boost_votes)} /><MiniStat label="Total score" value={formatCompact(getTokenScore(token))} /></div></div><div className="grid grid-cols-2 gap-2 lg:w-[340px]"><form action="/api/admin/action" method="post"><input type="hidden" name="action" value="approve" /><input type="hidden" name="address" value={token.address} /><button className="w-full rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">Approve</button></form><form action="/api/admin/action" method="post"><input type="hidden" name="action" value="toggle-promote" /><input type="hidden" name="address" value={token.address} /><button className="w-full rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">Toggle promote</button></form><form action="/api/admin/action" method="post"><input type="hidden" name="action" value="toggle-verified" /><input type="hidden" name="address" value={token.address} /><button className="w-full rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">Toggle verified</button></form><form action="/api/admin/action" method="post"><input type="hidden" name="action" value="boost-votes" /><input type="hidden" name="address" value={token.address} /><input name="amount" type="hidden" value="10" /><button className="w-full rounded-full border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">+10 boost</button></form></div></div></div>)}</div>}

    <div className="mx-auto mt-8 max-w-6xl card p-6"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-2xl font-semibold text-white">Live banner queue</h2><span className="text-sm text-slate-400">{bannerAds.length} saved</span></div><div className="space-y-4">{bannerAds.length === 0 ? <EmptyState text="No banner ads yet." /> : bannerAds.map((ad) => <div key={ad.id} className="rounded-[24px] border border-stroke/70 bg-slate-950/35 p-4"><div className="flex gap-3"><Image src={ad.image_url} alt={ad.title} width={96} height={64} className="h-16 w-24 rounded-xl object-cover" unoptimized /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><div className="font-semibold text-white">{ad.title}</div></div><a href={ad.target_url} className="mt-1 block break-all text-xs text-cyan-300 hover:text-cyan-200">{ad.target_url}</a></div></div></div>)}</div></div>
  </section>;
}

function MiniStat({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-stroke/60 bg-slate-950/30 p-3"><div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div><div className="mt-2 font-medium text-white">{value}</div></div>; }
