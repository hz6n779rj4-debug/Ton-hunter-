import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { buildTonTransferLink } from '@/lib/payment';
import { PaymentWatcher } from '@/components/payment-watcher';
import { formatCompact } from '@/lib/utils';

export default async function PayPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  if (!supabaseAdmin) notFound();
  const { data: payment } = await supabaseAdmin.from('payment_requests').select('*').eq('payment_reference', reference).single();
  const { data: token } = await supabaseAdmin.from('tokens').select('*').eq('address', payment?.token_address).single();
  if (!payment || !token) notFound();

  const transferLink = buildTonTransferLink({ amountTon: Number(payment.amount_ton), reference: payment.payment_reference });

  return <section className="container-main py-14">
    <div className="mx-auto grid max-w-3xl gap-6">
      <div className="card p-6">
        <div className="text-xs uppercase tracking-[0.25em] text-cyan-200">TON payment checkout</div>
        <h1 className="mt-3 text-3xl font-bold text-white">{payment.request_type === 'listing' ? 'Fast listing payment' : 'Promote this coin'}</h1>
        <p className="mt-2 text-slate-300">Send the payment from your TON wallet using the exact comment below. Tonhunters checks the wallet for that memo and auto-applies the listing or promotion after the payment lands.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Info label="Project" value={`${token.name} ($${token.symbol})`} />
          <Info label="Amount" value={`${formatCompact(Number(payment.amount_ton))} TON`} />
          <Info label="Wallet" value={payment.payment_wallet} mono />
          <Info label="Comment / memo" value={payment.payment_reference} mono />
          {payment.duration_days ? <Info label="Promotion duration" value={`${payment.duration_days} day${payment.duration_days > 1 ? 's' : ''}`} /> : null}
          <Info label="Flow" value={payment.request_type === 'listing' ? 'Paid listing goes live automatically' : 'Promotion activates automatically'} />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={transferLink} className="rounded-full bg-white px-5 py-3 font-medium text-slate-950">Open TON wallet</Link>
          <Link href="https://t.me/DevAtSpyTON" target="_blank" className="rounded-full border border-stroke px-5 py-3 font-medium text-slate-200 hover:border-cyan-400/40">Need support</Link>
        </div>
        <PaymentWatcher reference={payment.payment_reference} tokenAddress={token.address} />
      </div>
    </div>
  </section>;
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="rounded-2xl border border-stroke/70 bg-slate-950/25 p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div><div className={`mt-2 break-all text-sm text-white ${mono ? 'font-mono' : ''}`}>{value}</div></div>;
}
