export default function SubmitPage() {
  return (
    <section className="container-main overflow-x-hidden py-8 sm:py-10">
      <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="card min-w-0 p-5 text-left sm:p-6">
          <div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">Submit Project</div>
          <h1 className="text-3xl font-bold leading-tight">List your project on KYRON</h1>
          <p className="mt-3 text-slate-400">KYRON now uses fast listing only. Submit your project, then complete the inline 10 TON payment to move it into review.</p>
          <div className="mt-8 space-y-4 text-sm text-slate-300">
            <div className="panel p-4"><div className="font-medium text-white">Fast listing only</div><p className="mt-1 text-slate-400">10 TON. After you submit, you will get a pay-now button with the exact wallet and memo already filled in.</p></div>
            <div className="panel p-4"><div className="font-medium text-white">What happens next</div><p className="mt-1 text-slate-400">Once payment is detected, your listing can be matched to your submission and reviewed faster.</p></div>
            <div className="panel p-4"><div className="font-medium text-white">Promoted slots</div><p className="mt-1 text-slate-400">1 day = 5 TON, 3 days = 12 TON, 7 days = 25 TON.</p></div>
          </div>
        </div>

        <div className="card min-w-0 p-5 text-left sm:p-6">
          <form action="/api/submit" method="post" encType="multipart/form-data" className="grid min-w-0 gap-4">
            <input type="hidden" name="listing_tier" value="fast" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Project name" name="name" placeholder="KYRON" required />
              <Field label="Ticker" name="symbol" placeholder="KYN" required />
            </div>
            <Field label="Token address" name="address" placeholder="EQ..." required />
            <UploadField />
            <Field label="Website" name="website" placeholder="https://..." />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Telegram" name="telegram" placeholder="https://t.me/..." />
              <Field label="X / Twitter" name="twitter" placeholder="https://x.com/..." />
            </div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-200">Listing tier</div>
              <div className="mt-2 text-lg font-medium text-white">Fast listing — 10 TON</div>
              <div className="mt-1 text-sm text-slate-400">Inline payment will open right after submission.</div>
            </div>
            <label className="grid min-w-0 gap-2 text-sm">
              <span className="text-slate-300">Description</span>
              <textarea name="description" rows={6} required className="rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 text-base outline-none focus:border-cyan-400/50" placeholder="Tell people why your project matters." />
            </label>
            <button className="mt-2 rounded-full bg-white px-5 py-3 font-medium text-slate-950">Continue to payment</button>
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
