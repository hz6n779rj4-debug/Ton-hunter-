import Link from 'next/link';

export default async function PromoteSuccessPage({ searchParams }: { searchParams?: Promise<{ address?: string; days?: string; amount?: string; ref?: string; wallet?: string; verified?: string; error?: string }> }) {
  const params = (await searchParams) || {};
  const address = params.address || '';
  const days = params.days || '1';
  const amount = params.amount || '5';
  const ref = params.ref || 'TH-PROMO';
  const wallet = params.wallet || 'UQDQ-Bp7EiOZevivYISInOTR2wZnwxowRMm-1QJFQGYCutEa';
  const verified = params.verified === '1';
  const error = params.error === 'not-found';

  return (
    <section className="container-main py-14">
      <div className="mx-auto max-w-3xl card p-8">
        <div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">Promotion payment</div>
        <h1 className="text-3xl font-bold text-white">Promote your coin</h1>
        <p className="mt-3 text-slate-400">Pay with the reference below, then verify payment to activate the promoted slot automatically.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Stat label="Duration" value={`${days} day${days === '1' ? '' : 's'}`} />
          <Stat label="Amount" value={`${amount} TON`} />
          <Stat label="Reference" value={ref} />
        </div>
        <div className="mt-6 rounded-2xl border border-stroke bg-slate-950/30 p-5">
          <div className="text-sm text-slate-400">Payment wallet</div>
          <div className="mt-2 break-all text-white">{wallet}</div>
          <div className="mt-4 text-sm text-slate-400">Send exactly {amount} TON and include <span className="text-white">{ref}</span> in the memo/comment if your wallet supports it.</div>
        </div>
        {verified ? <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">Payment verified. Your project is now promoted.</div> : null}
        {error ? <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-300">Payment not found yet. Wait a little and try verify again.</div> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <form action="/api/payment/verify" method="post">
            <input type="hidden" name="mode" value="promote" />
            <input type="hidden" name="address" value={address} />
            <input type="hidden" name="days" value={days} />
            <input type="hidden" name="reference" value={ref} />
            <button className="rounded-full bg-white px-5 py-3 font-medium text-slate-950">Verify payment</button>
          </form>
          <a href="https://t.me/DevAtSpyTON" className="rounded-full border border-stroke px-5 py-3">Need help?</a>
          <Link href={`/token/${address}`} className="rounded-full border border-stroke px-5 py-3">Back to token</Link>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-stroke/60 bg-slate-950/30 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div><div className="mt-2 font-medium text-white break-all">{value}</div></div>;
}
