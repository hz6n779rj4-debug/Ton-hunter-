export default function ClaimProjectPage() {
  return (
    <section className="container-main py-12">
      <div className="mx-auto max-w-3xl card p-6">
        <div className="mb-3 inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
          Claim Project
        </div>

        <h1 className="text-3xl font-bold text-white">Claim your Ton Gemz page</h1>
        <p className="mt-3 text-slate-400">
          Submit your contract address and proof. After owner review, your project can be marked as
          claimed and optionally receive the Verified Team badge.
        </p>

        <form action="/api/claim-project" method="post" className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Token address</span>
            <input
              name="token_address"
              required
              className="rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 outline-none focus:border-cyan-400/50"
              placeholder="EQ..."
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Telegram username</span>
            <input
              name="username"
              className="rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 outline-none focus:border-cyan-400/50"
              placeholder="@yourhandle"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Proof</span>
            <textarea
              name="proof"
              rows={5}
              required
              className="rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 outline-none focus:border-cyan-400/50"
              placeholder="Share your Telegram/X/website proof showing you control the project."
            />
          </label>

          <button className="rounded-full bg-white px-5 py-3 font-medium text-slate-950">
            Send claim request
          </button>
        </form>
      </div>
    </section>
  );
}
