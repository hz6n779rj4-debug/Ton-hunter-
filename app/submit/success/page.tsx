import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function SubmitSuccessPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white">
      <div className="rounded-[28px] border border-cyan-500/20 bg-[#05122b] p-6 md:p-8">
        <p className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-300">
          Submission received
        </p>

        <h1 className="text-4xl font-semibold">Your listing has been submitted</h1>

        <p className="mt-4 text-white/70">
          Your token was submitted successfully. Free listings stay pending until they are reviewed and approved.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-1">
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">Status</p>
            <p className="mt-2 text-2xl font-semibold">Pending review</p>
          </div>
        </div>

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
