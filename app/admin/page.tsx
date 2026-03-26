export const dynamic = 'force-dynamic';

function OwnerAccessCard() {
  return (
    <section className="container-main py-14">
      <div className="mx-auto max-w-md card p-8">
        <div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">Private owner access</div>
        <h1 className="text-3xl font-bold text-white">Enter owner password</h1>
        <p className="mt-3 text-slate-400">This page is only for the Ton Gemz owner. Enter your private owner password to continue.</p>
        <form action="/api/admin/login" method="post" className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Owner password</span>
            <input name="password" type="password" required className="rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 outline-none focus:border-cyan-400/50" />
          </label>
          <button className="rounded-full bg-white px-5 py-3 font-medium text-slate-950">Open private dashboard</button>
        </form>
      </div>
    </section>
  );
}

export default function AdminPage() {
  return <OwnerAccessCard />;
}
