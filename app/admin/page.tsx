import { getTokens } from '@/lib/ton';
import { formatCompact, shortAddress } from '@/lib/utils';

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

export default async function AdminPage() {
  const tokens = await getTokens(true);
  const promotedCount = tokens.filter((token) => token.promoted).length;
  const pendingCount = tokens.filter((token) => (token.status || 'approved') === 'pending').length;

  return (
    <section className="container-main py-14">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin dashboard</h1>
          <p className="mt-2 text-slate-400">Approve or reject free listings before they go live.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="panel px-4 py-3">Listed: <span className="font-semibold text-white">{formatCompact(tokens.length)}</span></div>
          <div className="panel px-4 py-3">Pending: <span className="font-semibold text-white">{formatCompact(pendingCount)}</span></div>
          <div className="panel px-4 py-3">Promoted: <span className="font-semibold text-white">{formatCompact(promotedCount)}</span></div>
        </div>
      </div>

      <div className="space-y-4">
        {tokens.length === 0 ? (
          <div className="card p-6 text-sm text-slate-400">No tokens found. Add <code className="text-white">SUPABASE_SERVICE_ROLE_KEY</code> in your deploy env so admin can load real submissions.</div>
        ) : (
          tokens.map((token) => {
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
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto">
                    <form action="/api/admin" method="post">
                      <input type="hidden" name="address" value={token.address} />
                      <input type="hidden" name="action" value="approve" />
                      <button className="w-full rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300 transition hover:bg-emerald-500/20">
                        Approve
                      </button>
                    </form>

                    <form action="/api/admin" method="post">
                      <input type="hidden" name="address" value={token.address} />
                      <input type="hidden" name="action" value="reject" />
                      <button className="w-full rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-500/20">
                        Reject
                      </button>
                    </form>

                    <form action="/api/promote" method="post">
                      <input type="hidden" name="address" value={token.address} />
                      <button className="w-full rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/20">
                        Toggle promote
                      </button>
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
