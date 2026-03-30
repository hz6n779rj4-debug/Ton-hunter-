import Image from 'next/image';
import Link from 'next/link';
import { isAdminAuthenticated } from '@/lib/auth';
import { getTokenScore, getTokens } from '@/lib/ton';
import { getBannerAds } from '@/lib/banner-ads';
import { formatCompact } from '@/lib/utils';
import { getClaimRequests } from '@/lib/claims';

export const dynamic = 'force-dynamic';

type FilterKey = 'listed' | 'pending' | 'promoted' | 'trending' | 'alltime' | 'new' | 'gainers' | 'verified' | 'claims';

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
    trending: [...visibleTokens].sort((a, b) => ((b.votes_24h || 0) + (b.admin_boost_votes || 0)) - ((a.votes_24h || 0) + (a.admin_boost_votes || 0))),
    alltime: [...visibleTokens].sort((a, b) => getTokenScore(b) - getTokenScore(a)),
    new: [...visibleTokens].sort((a, b) => new Date(b.listed_at).getTime() - new Date(a.listed_at).getTime()),
    gainers: [...visibleTokens].filter((t) => Number(t.change_24h_percent || 0) > 0).sort((a, b) => Number(b.change_24h_percent || 0) - Number(a.change_24h_percent || 0)),
    verified: visibleTokens.filter((t) => t.verified_team),
    claims: [],
  };
  const filteredTokens = views[selectedFilter] || views.listed;

  return <section className="container-main overflow-x-hidden py-8 sm:py-10">
    <div className="mx-auto mb-6 max-w-6xl text-center"><h1 className="text-3xl font-bold">Owner dashboard</h1><p className="mt-2 text-slate-400">Manage listings, promoted slots, banners, verified teams, claims, and vote boosts from one place.</p></div>
    <div className="mx-auto mb-4 grid max-w-6xl grid-cols-2 gap-3 lg:grid-cols-5">
      <FilterCard label="Listed" value={views.listed.length} href="/admin/panel?filter=listed" active={selectedFilter === 'listed'} />
      <FilterCard label="Pending" value={views.pending.length} href="/admin/panel?filter=pending" active={selectedFilter === 'pending'} />
      <FilterCard label="Promoted" value={views.promoted.length} href="/admin/panel?filter=promoted" active={selectedFilter === 'promoted'} />
      <FilterCard label="Trending" value={views.trending.length} href="/admin/panel?filter=trending" active={selectedFilter === 'trending'} />
      <FilterCard label="All Time" value={views.alltime.length} href="/admin/panel?filter=alltime" active={selectedFilter === 'alltime'} />
      <FilterCard label="New Listings" value={views.new.length} href="/admin/panel?filter=new" active={selectedFilter === 'new'} />
      <FilterCard label="Top Gainers" value={views.gainers.length} href="/admin/panel?filter=gainers" active={selectedFilter === 'gainers'} />
      <FilterCard label="Verified Team" value={views.verified.length} href="/admin/panel?filter=verified" active={selectedFilter === 'verified'} />
      <FilterCard label="Claim Requests" value={claimRequests.length} href="/admin/panel?filter=claims" active={selectedFilter === 'claims'} />
      <FilterCard label="Banners" value={bannerAds.length} href="/admin/panel?filter=listed" active={false} />
    </div>
    {params.message ? <div className="mx-auto mb-5 max-w-6xl card border border-cyan-500/30 p-4 text-sm text-cyan-200">{params.message}</div> : null}
    {params.error ? <div className="mx-auto mb-5 max-w-6xl card border border-rose-500/30 p-4 text-sm text-rose-300">{params.error}</div> : null}

    {selectedFilter === 'claims' ? <div className="mx-auto max-w-6xl space-y-4">{claimRequests.length === 0 ? <EmptyState text="No claim requests yet." /> : claimRequests.map((request) => <div key={request.id} className="card p-5"><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-semibold text-white">{request.username || 'Unknown requester'}</h2><StatusPill value={request.status} /></div><p className="mt-2 break-all text-sm text-slate-400">{request.token_address}</p><p className="mt-3 text-sm text-slate-300">{request.proof}</p><div className="mt-4 flex flex-wrap gap-2"><form action="/api/admin/action" method="post"><input type="hidden" name="action" value="approve-claim" /><input type="hidden" name="request_id" value={request.id} /><input type="hidden" name="address" value={request.token_address} /><button className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">Approve claim</button></form><form action="/api/admin/action" method="post"><input type="hidden" name="action" value="reject-claim" /><input type="hidden" name="request_id" value={request.id} /><input type="hidden" name="address" value={request.token_address} /><button className="rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">Reject claim</button></form></div></div>)}</div> : <div className="mx-auto max-w-6xl space-y-4">{filteredTokens.length === 0 ? <EmptyState text="No tokens found in this tab." /> : filteredTokens.map((token) => <div key={token.id} className="card overflow-hidden p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="truncate text-xl font-semibold text-white">{token.name}</h2><span className="text-sm text-slate-500">${token.symbol}</span><StatusPill value={token.status || 'approved'} />{token.promoted ? <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">Promoted</span> : null}{token.verified_team ? <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">Verified Team</span> : null}</div><p className="mt-2 break-all text-xs leading-6 text-slate-400 sm:text-sm">{token.address}</p><div className="mt-4 grid gap-3 sm:grid-cols-4"><MiniStat label="24h votes" value={formatCompact(token.votes_24h)} /><MiniStat label="Public votes" value={formatCompact(token.votes_all_time)} /><MiniStat label="Boost votes" value={formatCompact(token.admin_boost_votes)} /><MiniStat label="Total score" value={formatCompact(getTokenScore(token))} /></div></div><div className="grid grid-cols-2 gap-2 lg:w-[340px]"><form action="/api/admin/action" method="post"><input type="hidden" name="action" value="approve" /><input type="hidden" name="address" value={token.address} /><button className="w-full rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">Approve</button></form><form action="/api/admin/action" method="post"><input type="hidden" name="action" value="toggle-promote" /><input type="hidden" name="address" value={token.address} /><button className="w-full rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">Toggle promote</button></form><form action="/api/admin/action" method="post"><input type="hidden" name="action" value="toggle-verified" /><input type="hidden" name="address" value={token.address} /><button className="w-full rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">Toggle verified</button></form><form action="/api/admin/action" method="post"><input type="hidden" name="action" value="boost-votes" /><input type="hidden" name="address" value={token.address} /><input name="amount" type="hidden" value="10" /><button className="w-full rounded-full border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">+10 boost</button></form></div></div></div>)}</div>}

    <div className="mx-auto mt-8 max-w-6xl card p-6">
      <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-2xl font-semibold text-white">Create banner</h2><span className="text-sm text-slate-400">Upload your own banner image</span></div>
      <form action="/api/admin/banner" method="post" encType="multipart/form-data" className="grid gap-4 lg:grid-cols-2">
        <input type="hidden" name="action" value="create" />
        <div className="rounded-2xl border border-stroke/60 bg-slate-950/30 p-4"><div className="mb-2 text-sm text-slate-300">Banner title</div><input name="title" placeholder="Book a KYRON banner" className="w-full rounded-xl border border-stroke/70 bg-slate-950/40 px-4 py-3 text-white outline-none" /></div>
        <div className="rounded-2xl border border-stroke/60 bg-slate-950/30 p-4"><div className="mb-2 text-sm text-slate-300">Target URL</div><input name="target_url" placeholder="/banner-ads or https://..." className="w-full rounded-xl border border-stroke/70 bg-slate-950/40 px-4 py-3 text-white outline-none" /></div>
        <div className="rounded-2xl border border-stroke/60 bg-slate-950/30 p-4"><div className="mb-2 text-sm text-slate-300">Start date and time</div><input type="datetime-local" name="starts_at" className="w-full rounded-xl border border-stroke/70 bg-slate-950/40 px-4 py-3 text-white outline-none" /></div>
        <div className="rounded-2xl border border-stroke/60 bg-slate-950/30 p-4"><div className="mb-2 text-sm text-slate-300">End date and time</div><input type="datetime-local" name="ends_at" className="w-full rounded-xl border border-stroke/70 bg-slate-950/40 px-4 py-3 text-white outline-none" /></div>
        <div className="rounded-2xl border border-stroke/60 bg-slate-950/30 p-4 lg:col-span-2"><div className="mb-2 text-sm text-slate-300">Banner image</div><input type="file" name="image" accept="image/*" className="w-full rounded-xl border border-stroke/70 bg-slate-950/40 px-4 py-3 text-white outline-none file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:text-slate-950" /></div>
        <div className="lg:col-span-2"><button className="rounded-full bg-white px-6 py-3 font-medium text-slate-950">Save banner</button></div>
      </form>
    </div>

    <div className="mx-auto mt-8 max-w-6xl card p-6"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-2xl font-semibold text-white">Live banner queue</h2><span className="text-sm text-slate-400">{bannerAds.length} saved</span></div><div className="space-y-4">{bannerAds.length === 0 ? <EmptyState text="No banner ads yet." /> : bannerAds.map((ad) => <div key={ad.id} className="rounded-[24px] border border-stroke/70 bg-slate-950/35 p-4"><div className="flex flex-col gap-4 sm:flex-row"><Image src={ad.image_url} alt={ad.title} width={280} height={120} className="h-24 w-full rounded-xl object-cover sm:w-72" unoptimized /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><div className="font-semibold text-white">{ad.title}</div><span className="rounded-full border px-3 py-1 text-xs ${ad.is_active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-slate-500/30 bg-slate-500/10 text-slate-300'}">{ad.is_active ? 'Active' : 'Off'}</span></div><a href={ad.target_url} className="mt-1 block break-all text-xs text-cyan-300 hover:text-cyan-200">{ad.target_url}</a><div className="mt-4 flex flex-wrap gap-2"><form action="/api/admin/banner" method="post"><input type="hidden" name="action" value="toggle" /><input type="hidden" name="id" value={ad.id} /><button className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">Toggle</button></form><form action="/api/admin/banner" method="post"><input type="hidden" name="action" value="reorder" /><input type="hidden" name="id" value={ad.id} /><input type="hidden" name="direction" value="up" /><button className="rounded-full border border-stroke/70 px-4 py-2 text-sm text-slate-200">Move up</button></form><form action="/api/admin/banner" method="post"><input type="hidden" name="action" value="reorder" /><input type="hidden" name="id" value={ad.id} /><input type="hidden" name="direction" value="down" /><button className="rounded-full border border-stroke/70 px-4 py-2 text-sm text-slate-200">Move down</button></form><form action="/api/admin/banner" method="post"><input type="hidden" name="action" value="delete" /><input type="hidden" name="id" value={ad.id} /><button className="rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">Delete</button></form></div></div></div></div>)}</div></div>
  </section>;
}

function MiniStat({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-stroke/60 bg-slate-950/30 p-3"><div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div><div className="mt-2 font-medium text-white">{value}</div></div>; }
