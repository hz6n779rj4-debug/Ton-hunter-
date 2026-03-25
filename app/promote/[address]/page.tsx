import { notFound } from 'next/navigation';
import { getTokenByAddress } from '@/lib/ton';
import { PAYMENT_WALLET } from '@/lib/payment';

const packages = [
  { days: 1, price: 5 },
  { days: 3, price: 12 },
  { days: 7, price: 25 },
];

export default async function PromotePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  const token = await getTokenByAddress(address);
  if (!token) notFound();

  return <section className="container-main py-14">
    <div className="mx-auto max-w-4xl card p-6 sm:p-8">
      <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">Promoted placement</div>
      <h1 className="mt-3 text-3xl font-bold text-white">Promote {token.name}</h1>
      <p className="mt-2 text-slate-300">Choose a duration. After payment is verified, the token is automatically pushed into the promoted homepage board for the selected period.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {packages.map((pkg) => (
          <form key={pkg.days} action="/api/promote-request" method="post" className="rounded-3xl border border-stroke bg-slate-950/25 p-5">
            <input type="hidden" name="address" value={token.address} />
            <input type="hidden" name="duration_days" value={pkg.days} />
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Duration</div>
            <div className="mt-2 text-2xl font-bold text-white">{pkg.days} day{pkg.days > 1 ? 's' : ''}</div>
            <div className="mt-1 text-cyan-200">{pkg.price} TON</div>
            <div className="mt-3 text-xs text-slate-500">Wallet: {PAYMENT_WALLET}</div>
            <button className="mt-5 w-full rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100">Continue to pay</button>
          </form>
        ))}
      </div>
      <div className="mt-6 panel p-4 text-sm text-slate-300">
        Support: <a href="https://t.me/DevAtSpyTON" target="_blank" className="text-cyan-200 hover:text-white">@DevAtSpyTON</a>
      </div>
    </div>
  </section>;
}
