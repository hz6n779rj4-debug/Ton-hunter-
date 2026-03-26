import Image from 'next/image';
import Link from 'next/link';
import { isAdminAuthenticated } from '@/lib/auth';
import { getTokens } from '@/lib/ton';
import { getBannerAds } from '@/lib/banner-ads';
import { formatCompact, shortAddress } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type FilterKey = 'listed' | 'pending' | 'promoted';

function StatusPill({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const classes =
    normalized === 'approved'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : normalized === 'rejected'
        ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
        : 'border-amber-500/30 bg-amber-500/10 text-amber-300';

  return <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${classes}`}>{value}</span>;
}

function FilterCard({ label, value, href, active }: { label: string; value: number; href: string; active: boolean }) {
  return (
    <Link href={href} className={`panel px-4 py-3 text-sm transition ${active ? 'border-cyan-400/50 bg-cyan-400/10 text-white' : 'hover:border-cyan-400/35'}`}>
      {label}: <span className="font-semibold text-white">{formatCompact(value)}</span>
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="card p-6 text-sm text-slate-400">{text}</div>;
}

export default async function AdminPanelPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; message?: string; filter?: string }>;
}) {
  const params = (await searchParams) || {};
  const authed = await isAdminAuthenticated();
  if (!authed) return <section className="container-main py-14"><div className="mx-auto max-w-md card p-8"><div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">Private owner access</div><h1 className="text-3xl font-bold text-white">Owner password required</h1><p className="mt-3 text-slate-400">Go back to <a href="/admin" className="text-cyan-300 underline">/admin</a> and unlock the dashboard.</p></div></section>;

  const actionError = params.error || '';
  const ownerMessage = params.message || '';
  const selectedFilter: FilterKey = params.filter === 'pending' || params.filter === 'promoted' ? params.filter : 'listed';

  const tokens = await getTokens(true);
  const visibleTokens = tokens.filter((token) => token.status !== 'rejected');
  const listedTokens = visibleTokens.filter((t) => (t.status || 'approved') === 'approved');
  const pendingTokens = visibleTokens.filter((t) => (t.status || 'approved') === 'pending');
  const promotedTokens = visibleTokens.filter((token) => token.promoted);
  const bannerAds = await getBannerAds(true);

  const filteredTokens = selectedFilter === 'pending' ? pendingTokens : selectedFilter === 'promoted' ? promotedTokens : listedTokens;

  return (
    <section className="container-main py-14">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Owner dashboard</h1>
          <p className="mt-2 text-slate-400">Approve listings, control promoted slots, and manage header banner ads without editing files.</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FilterCard label="Listed" value={listedTokens.length} href="/admin/panel?filter=listed" active={selectedFilter === 'listed'} />
        <FilterCard label="Pending" value={pendingTokens.length} href="/admin/panel?filter=pending" active={selectedFilter === 'pending'} />
        <FilterCard label="Promoted" value={promotedTokens.length} href="/admin/panel?filter=promoted" active={selectedFilter === 'promoted'} />
      </div>

      {ownerMessage ? <div className="mb-5 card border border-cyan-500/30 p-4 text-sm text-cyan-200">{ownerMessage}</div> : null}
      {actionError ? <div className="mb-5 card border border-rose-500/30 p-4 text-sm text-rose-300">{actionError}</div> : null}

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">
              {selectedFilter === 'pending' ? 'Pending tokens' : selectedFilter === 'promoted' ? 'Promoted tokens' : 'Listed tokens'}
            </h2>
            <div className="text-sm text-slate-400">Click the tabs above to switch the token list.</div>
          </div>

          <div className="space-y-4">
            {filteredTokens.length === 0 ? (
              <EmptyState text="No tokens found in this tab." />
            ) : (
              filteredTokens.map((token) => {
                const status = token.status || 'approved';
                return (
                  <div key={token.id} className="card p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="truncate text-xl font-semibold text-white">{token.name}</h2>
                          <span className="text-sm text-slate-500">${token.symbol}</span>
                          <StatusPill value={status} />
                          <span className="rounded-full border border-stroke px-3 py-1 text-xs capitalize text-slate-300">{token.listing_tier || 'free'}</span>
                          {token.promoted ? <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">Promoted</span> : null}
                        </div>
                        <p className="mt-2 break-all text-sm text-slate-400">{token.address}</p>
                        {token.payment_reference ? <p className="mt-2 text-xs text-slate-500">Payment ref: {token.payment_reference}</p> : null}
                        {token.promotion_expires_at ? <p className="mt-1 text-xs text-slate-500">Promotion ends: {new Date(token.promotion_expires_at).toLocaleString()}</p> : null}
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto">
                        <form action="/api/admin/action" method="post">
                          <input type="hidden" name="action" value="approve" />
                          <input type="hidden" name="address" value={token.address} />
                          <button className="w-full rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-center text-sm text-emerald-300 transition hover:bg-emerald-500/20">Approve</button>
                        </form>
                        <form action="/api/admin/action" method="post">
                          <input type="hidden" name="action" value="reject" />
                          <input type="hidden" name="address" value={token.address} />
                          <button className="w-full rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-center text-sm text-rose-300 transition hover:bg-rose-500/20">Reject</button>
                        </form>
                        <form action="/api/admin/action" method="post">
                          <input type="hidden" name="action" value="toggle-promote" />
                          <input type="hidden" name="address" value={token.address} />
                          <button className="w-full rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-center text-sm text-cyan-300 transition hover:bg-cyan-500/20">Toggle promote</button>
                        </form>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                      <span>24h votes: <span className="text-white">{formatCompact(token.votes_24h)}</span></span>
                      <span>All-time votes: <span className="text-white">{formatCompact(token.votes_all_time)}</span></span>
                      <span>Shown as: <span className="text-white">{shortAddress(token.address)}</span></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="mb-3 inline-flex rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-fuchsia-200">Banner ads manager</div>
            <h2 className="text-2xl font-semibold text-white">Publish header banners</h2>
            <p className="mt-2 text-sm text-slate-400">Upload a banner image, add the project link, set start and end dates, then publish. No redeploy needed.</p>
            <form action="/api/admin/banner" method="post" encType="multipart/form-data" className="mt-5 grid gap-4">
              <input type="hidden" name="action" value="create" />
              <label className="grid gap-2 text-sm">
                <span className="text-slate-300">Banner title</span>
                <input name="title" required placeholder="Ton Gemz Launch Banner" className="rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 outline-none focus:border-cyan-400/50" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="text-slate-300">Banner image</span>
                <input name="image" type="file" accept="image/*" required className="rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400/10 file:px-4 file:py-2 file:text-cyan-200" />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="text-slate-300">Target link</span>
                <input name="target_url" type="url" required placeholder="https://..." className="rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 outline-none focus:border-cyan-400/50" />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="text-slate-300">Start date</span>
                  <input name="starts_at" type="datetime-local" required className="rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 outline-none focus:border-cyan-400/50" />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="text-slate-300">End date</span>
                  <input name="ends_at" type="datetime-local" required className="rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 outline-none focus:border-cyan-400/50" />
                </label>
              </div>
              <button className="rounded-full bg-white px-5 py-3 font-medium text-slate-950">Publish banner</button>
            </form>
          </div>

          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-white">Live banner queue</h2>
              <span className="text-sm text-slate-400">{bannerAds.length} saved</span>
            </div>
            <div className="space-y-4">
              {bannerAds.length === 0 ? (
                <EmptyState text="No banner ads yet." />
              ) : (
                bannerAds.map((ad) => (
                  <div key={ad.id} className="rounded-[24px] border border-stroke/70 bg-slate-950/35 p-4">
                    <div className="flex gap-3">
                      <Image src={ad.image_url} alt={ad.title} width={96} height={64} className="h-16 w-24 rounded-xl object-cover" unoptimized />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-semibold text-white">{ad.title}</div>
                          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] ${ad.is_active ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-slate-500/30 bg-slate-500/10 text-slate-300'}`}>{ad.is_active ? 'On' : 'Off'}</span>
                        </div>
                        <a href={ad.target_url} className="mt-1 block truncate text-xs text-cyan-300 hover:text-cyan-200">{ad.target_url}</a>
                        <div className="mt-2 text-xs text-slate-400">{ad.starts_at ? `Start: ${new Date(ad.starts_at).toLocaleString()}` : 'Start: now'} · {ad.ends_at ? `End: ${new Date(ad.ends_at).toLocaleString()}` : 'No end date'}</div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <form action="/api/admin/banner" method="post">
                        <input type="hidden" name="action" value="toggle" />
                        <input type="hidden" name="id" value={ad.id} />
                        <button className="w-full rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300">Turn {ad.is_active ? 'off' : 'on'}</button>
                      </form>
                      <form action="/api/admin/banner" method="post">
                        <input type="hidden" name="action" value="reorder" />
                        <input type="hidden" name="id" value={ad.id} />
                        <input type="hidden" name="direction" value="up" />
                        <button className="w-full rounded-full border border-stroke px-3 py-2 text-sm text-slate-200">Move up</button>
                      </form>
                      <form action="/api/admin/banner" method="post">
                        <input type="hidden" name="action" value="reorder" />
                        <input type="hidden" name="id" value={ad.id} />
                        <input type="hidden" name="direction" value="down" />
                        <button className="w-full rounded-full border border-stroke px-3 py-2 text-sm text-slate-200">Move down</button>
                      </form>
                      <form action="/api/admin/banner" method="post">
                        <input type="hidden" name="action" value="delete" />
                        <input type="hidden" name="id" value={ad.id} />
                        <button className="w-full rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">Delete</button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
