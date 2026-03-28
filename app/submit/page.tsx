export default function SubmitPage() {
  return (
    <section className="container-main overflow-x-hidden py-8 sm:py-10">
      <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="card min-w-0 p-5 text-left sm:p-6">
          <div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">Submit Coin</div>
          <h1 className="text-3xl font-bold leading-tight">List your TON project</h1>
          <p className="mt-3 text-slate-400">Add your project to Ton Gemz for visibility, community voting, and promoted placement.</p>
          <div className="mt-8 space-y-4 text-sm text-slate-300">
            <div className="panel p-4"><div className="font-medium text-white">Free listing</div><p className="mt-1 text-slate-400">Sent for review and approved manually before going live.</p></div>
            <div className="panel p-4"><div className="font-medium text-white">Fast listing</div><p className="mt-1 text-slate-400">10 TON. Submit details, then pay using the reference shown on the next screen.</p></div>
            <div className="panel p-4"><div className="font-medium text-white">Promoted slots</div><p className="mt-1 text-slate-400">1 day = 5 TON, 3 days = 12 TON, 7 days = 25 TON.</p></div>
          </div>
        </div>

        <div className="card min-w-0 p-5 text-left sm:p-6">
          <form action="/api/submit" method="post" encType="multipart/form-data" className="grid min-w-0 gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Project name" name="name" placeholder="Ton Gemz" required />
              <Field label="Ticker" name="symbol" placeholder="HUNT" required />
            </div>
            <Field label="Token address" name="address" placeholder="EQ..." required />
            <UploadField />
            <Field label="Website" name="website" placeholder="https://..." />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Telegram" name="telegram" placeholder="https://t.me/..." />
              <Field label="X / Twitter" name="twitter" placeholder="https://x.com/..." />
            </div>
            <label className="grid min-w-0 gap-2 text-sm">
              <span className="text-slate-300">Category</span>
              <select name="category" className="rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 text-base outline-none focus:border-cyan-400/50">
                <option value="Meme">Meme</option>
                <option value="New Launches">New Launches</option>
              </select>
            </label>
            <label className="grid min-w-0 gap-2 text-sm">
              <span className="text-slate-300">Listing tier</span>
              <select name="listing_tier" className="rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 text-base outline-none focus:border-cyan-400/50">
                <option value="free">Free listing — under review</option>
                <option value="fast">Fast listing — 10 TON</option>
              </select>
            </label>
            <label className="grid min-w-0 gap-2 text-sm">
              <span className="text-slate-300">Description</span>
              <textarea name="description" rows={6} required className="rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 text-base outline-none focus:border-cyan-400/50" placeholder="Tell people why your TON project matters." />
            </label>
            <button className="mt-2 rounded-full bg-white px-5 py-3 font-medium text-slate-950">Submit listing</button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, placeholder, required = false }: { label: string; name: string; placeholder: string; required?: boolean }) {
  return <label className="grid min-w-0 gap-2 text-sm"><span className="text-slate-300">{label}</span><input name={name} required={required} placeholder={placeholder} className="w-full min-w-0 rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 text-base outline-none focus:border-cyan-400/50" /></label>;
}

function UploadField() {
  return (
    <label className="grid min-w-0 gap-2 text-sm">
      <span className="text-slate-300">Project logo upload</span>
      <input name="logo" type="file" accept="image/*" required className="w-full min-w-0 rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 text-base outline-none file:mr-3 file:rounded-full file:border-0 file:bg-cyan-400/10 file:px-3 file:py-2 file:text-cyan-200" />
    </label>
  );
}
