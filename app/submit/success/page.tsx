import Link from 'next/link'

export const dynamic = 'force-dynamic'

type SearchParams = {
  tier?: string
  ref?: string
  wallet?: string
  address?: string
  amount?: string
  verified?: string
  error?: string
}

function toNano(ton: string) {
  const value = Number(ton || '0')
  return String(Math.round(value * 1_000_000_000))
}

function buildTonkeeperLink(wallet: string, amount: string, ref: string) {
  const cleanWallet = wallet.trim()
  const nano = toNano(amount)
  const text = encodeURIComponent(ref)
  return `https://app.tonkeeper.com/transfer/${encodeURIComponent(cleanWallet)}?amount=${nano}&text=${text}`
}

export default async function SubmitSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const paymentRef = params.ref || 'N/A'
  const wallet = params.wallet || 'Not configured'
  const amount = params.amount || '10'
  const tokenAddress = params.address || 'N/A'
  const verified = params.verified === '1'
  const error = params.error === 'not-found'
  const payUrl = wallet && wallet !== 'Not configured' ? buildTonkeeperLink(wallet, amount, paymentRef) : '#'

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white">
      <div className="rounded-[28px] border border-cyan-500/20 bg-[#05122b] p-6 md:p-8">
        <p className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-300">
          Fast listing payment
        </p>

        <h1 className="text-4xl font-semibold">Complete your KYRON listing</h1>

        <p className="mt-4 text-white/70">
          Your project has been saved. Pay the exact amount below using the prefilled wallet button, then verify the payment.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Stat label="Status" value={verified ? 'Payment verified' : 'Awaiting payment'} />
          <Stat label="Amount" value={`${amount} TON`} />
          <Stat label="Reference" value={paymentRef} />
        </div>

        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">Payment wallet</p>
            <p className="mt-2 break-all text-base font-medium text-white">{wallet}</p>
          </div>

          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">Submitted token address</p>
            <p className="mt-2 break-all text-sm text-white/80">{tokenAddress}</p>
          </div>

          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-100/90">
            The wallet button includes the memo/reference automatically. If your wallet changes the memo, payment matching may fail.
          </div>
        </div>

        {verified ? <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">Payment verified. Your listing is now in the fast-review queue.</div> : null}
        {error ? <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-300">Payment not found yet. Wait a little and tap verify again.</div> : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <a href={payUrl} className="rounded-full bg-white px-6 py-3 text-black" target="_blank" rel="noreferrer">
            Pay {amount} TON now
          </a>

          <form action="/api/payment/verify" method="post">
            <input type="hidden" name="mode" value="fast" />
            <input type="hidden" name="address" value={tokenAddress} />
            <input type="hidden" name="reference" value={paymentRef} />
            <button className="rounded-full border border-cyan-400/40 px-6 py-3 text-cyan-300">
              Verify payment
            </button>
          </form>

          <Link href="/" className="rounded-full border border-white/10 px-6 py-3 text-white/80">
            Back home
          </Link>
        </div>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-white/40">{label}</p>
      <p className="mt-2 break-all text-2xl font-semibold">{value}</p>
    </div>
  )
}
