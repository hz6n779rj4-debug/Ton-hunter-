import { isAdminAuthenticated } from '@/lib/auth';
import { getTokens } from '@/lib/ton';
import { formatCompact, shortAddress } from '@/lib/utils';

export const dynamic = 'force-dynamic';

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

function LoginCard() {
  return (
    <section className="container-main py-14">
      <div className="mx-auto max-w-md card p-8">
        <div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">Admin access</div>
        <h1 className="text-3xl font-bold text-white">Enter admin password</h1>
        <p className="mt-3 text-slate-400">Only you should know this password. Set the same value in your deploy environment as <code className="text-white">ADMIN_SECRET</code>.</p>
        <form action="/api/admin/login" method="post" className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Admin password</span>
            <input name="password" type="password" required className="rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 outline-none focus:border-cyan-400/50" />
          </label>
          <button className="rounded-full bg-white px-5 py-3 font-medium text-slate-950">Unlock dashboard</button>
        </form>
      </div>
    </section>
  );
}

export default async function AdminPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const params = (await searchParams) || {};
  const authed = await isAdminAuthenticated();
  if (!authed) return <LoginCard />;

  const actionError = params.error || '';
  const tokens = await getTokens(true);
  const visibleTokens = tokens.filter((token) => token.status !== 'rejected');
  const promotedCount = visibleTokens.filter((token) => token.promoted).length;
  const pendingCount = visibleTokens.filter((token) => (token.status || 'approved') === 'pending').length;

  return (
    <section className="container-main py-14">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin dashboard</h1>
          <p className="mt-2 text-slate-400">Approve or reject free listings before they go live.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="panel px-4 py-3">Listed: <span className="font-semibold text-white">{formatCompact(visibleTokens.filter((t) => (t.status || 'approved') === 'approved').length)}</span></div>
            <div className="panel px-4 py-3">Pending: <span className="font-semibold text-white">{formatCompact(pendingCount)}</span></div>
            <div className="panel px-4 py-3">Promoted: <span className="font-semibold text-white">{formatCompact(promotedCount)}</span></div>
          </div>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-full border border-stroke px-4 py-2 text-sm text-slate-300 hover:border-cyan-400/40">Lock admin</button>
          </form>
        </div>
      </div>

      {actionError ? <div className="mb-5 card border border-rose-500/30 p-4 text-sm text-rose-300">{actionError}</div> : null}

      <div className="space-y-4">
        {visibleTokens.length === 0 ? (
          <div className="card p-6 text-sm text-slate-400">No tokens found. Check <code className="text-white">SUPABASE_SERVICE_ROLE_KEY</code> in your deploy env.</div>
        ) : (
          visibleTokens.map((token) => {
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
    </section>
  );
}
