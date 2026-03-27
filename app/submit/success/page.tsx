import Link from 'next/link'

export const dynamic = 'force-dynamic'

type SearchParams = {
  tier?: string
  ref?: string
  wallet?: string
  address?: string
  amount?: string
}

export default async function SubmitSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const tier = params.tier || 'free'
  const paymentRef = params.ref || 'N/A'
  const wallet = params.wallet || 'Not configured'
  const amount = params.amount || '10'
  const tokenAddress = params.address || 'N/A'
  const isFast = tier === 'fast'

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white">
      <div className="rounded-[28px] border border-cyan-500/20 bg-[#05122b] p-6 md:p-8">
        <p className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-300">
          Submission received
        </p>

        <h1 className="text-4xl font-semibold">Your listing has been submitted</h1>

        <p className="mt-4 text-white/70">
          {isFast
            ? 'Your token is in the fast-listing queue. Complete the TON payment below using the exact memo so it can be matched to your submission.'
            : 'Your token was submitted successfully. Free listings stay pending until they are reviewed and approved.'}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-1">
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">Status</p>
            <p className="mt-2 text-2xl font-semibold">{isFast ? 'Awaiting payment' : 'Pending review'}</p>
          </div>
        </div>

        {isFast && (
          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Amount</p>
              <p className="mt-2 text-2xl font-semibold text-white">{amount} TON</p>
            </div>

            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">Payment wallet</p>
              <p className="mt-2 break-all text-base font-medium text-white">{wallet}</p>
            </div>

            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">Memo / reference</p>
              <p className="mt-2 break-all text-base font-medium text-cyan-300">{paymentRef}</p>
            </div>

            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">Submitted token address</p>
              <p className="mt-2 break-all text-sm text-white/80">{tokenAddress}</p>
            </div>

            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-100/90">
              Send the exact amount to the wallet above and include the exact memo/reference shown here. Without the memo, payment matching may fail.
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/explore" className="rounded-full bg-white px-6 py-3 text-black">
            Explore coins
          </Link>
          <Link
            href="/"
            className="rounded-full border border-cyan-400/40 px-6 py-3 text-cyan-300"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  )
}
