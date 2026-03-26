import { getTokenByAddress } from '@/lib/ton';
import { notFound } from 'next/navigation';

export default async function PromotePage({ searchParams }: { searchParams?: Promise<{ address?: string }> }) {
  const params = (await searchParams) || {};
  const address = params.address || '';
  const token = address ? await getTokenByAddress(address) : null;
  if (!token) notFound();

  return (
    <section className="container-main py-14">
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card p-6">
          <div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">Promote project</div>
          <h1 className="text-3xl font-bold text-white">Boost {token.name}</h1>
          <p className="mt-3 text-slate-400">Choose a duration, get a payment reference, then verify your payment to activate promotion automatically.</p>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div className="panel p-4"><span className="font-medium text-white">1 day</span><p className="mt-1 text-slate-400">5 TON</p></div>
            <div className="panel p-4"><span className="font-medium text-white">3 days</span><p className="mt-1 text-slate-400">12 TON</p></div>
            <div className="panel p-4"><span className="font-medium text-white">7 days</span><p className="mt-1 text-slate-400">25 TON</p></div>
          </div>
        </div>
        <div className="card p-6">
          <form action="/api/promote/request" method="post" className="grid gap-4">
            <input type="hidden" name="address" value={token.address} />
            <div className="rounded-2xl border border-stroke bg-slate-950/30 p-4">
              <div className="text-sm text-slate-400">Project</div>
              <div className="mt-2 text-xl font-semibold text-white">{token.name}</div>
              <div className="mt-1 break-all text-sm text-slate-500">{token.address}</div>
            </div>
            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">Promotion duration</span>
              <select name="days" className="rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 outline-none focus:border-cyan-400/50">
                <option value="1">1 day — 5 TON</option>
                <option value="3">3 days — 12 TON</option>
                <option value="7">7 days — 25 TON</option>
              </select>
            </label>
            <button className="rounded-full bg-white px-5 py-3 font-medium text-slate-950">Continue to payment</button>
          </form>
        </div>
      </div>
    </section>
  );
}
