import { getTokens } from '@/lib/ton';
import { formatCompact, shortAddress } from '@/lib/utils';

export default async function AdminPage() {
  const tokens = await getTokens(true);
  const promotedCount = tokens.filter((token) => token.promoted).length;
  const pendingCount = tokens.filter((token) => (token.status || 'approved') === 'pending').length;

  return (
    <section className="container-main py-14">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin dashboard</h1>
          <p className="mt-2 text-slate-400">Moderate listings, approve free submissions, and feature tokens after manual payment check.</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="panel px-4 py-3">Listed: <span className="font-semibold text-white">{formatCompact(tokens.length)}</span></div>
          <div className="panel px-4 py-3">Pending: <span className="font-semibold text-white">{formatCompact(pendingCount)}</span></div>
          <div className="panel px-4 py-3">Promoted: <span className="font-semibold text-white">{formatCompact(promotedCount)}</span></div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-950/30 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3">Token</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Promoted</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <tr key={token.id} className="border-t border-stroke/70">
                <td className="px-4 py-4 font-medium text-white">{token.name} <span className="text-slate-500">${token.symbol}</span></td>
                <td className="px-4 py-4 text-slate-400">{shortAddress(token.address)}</td>
                <td className="px-4 py-4 capitalize">{token.status || 'approved'}</td>
                <td className="px-4 py-4 capitalize">{token.listing_tier || 'free'}</td>
                <td className="px-4 py-4">{token.promoted ? 'Yes' : 'No'}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <form action="/api/admin" method="post"><input type="hidden" name="address" value={token.address} /><input type="hidden" name="action" value="approve" /><button className="rounded-full border border-stroke px-3 py-2 text-xs hover:border-cyan-400/40">Approve</button></form>
                    <form action="/api/admin" method="post"><input type="hidden" name="address" value={token.address} /><input type="hidden" name="action" value="reject" /><button className="rounded-full border border-stroke px-3 py-2 text-xs hover:border-cyan-400/40">Reject</button></form>
                    <form action="/api/promote" method="post"><input type="hidden" name="address" value={token.address} /><button className="rounded-full border border-stroke px-3 py-2 text-xs hover:border-cyan-400/40">Toggle promote</button></form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 card p-5">
        <h2 className="font-semibold text-white">Manual payment note</h2>
        <p className="mt-2 text-sm text-slate-400">Fast listing is 10 TON. Promoted slots are 1 day = 5 TON, 3 days = 12 TON, 7 days = 25 TON. Wallet: UQDQ-Bp7EiOZevivYISInOTR2wZnwxowRMm-1QJFQGYCutEa</p>
      </div>
    </section>
  );
}
