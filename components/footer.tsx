import Image from 'next/image';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-stroke/70 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.78),rgba(2,6,23,0.96))] py-14 text-sm text-slate-300">
      <div className="container-main">
        <div className="rounded-[32px] border border-stroke/70 bg-card/60 p-8 shadow-soft backdrop-blur-xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-4">
                <Image src="/kyron-logo.png" alt="KYRON" width={72} height={72} className="h-16 w-16 rounded-2xl object-cover" />
                <div>
                  <h2 className="text-3xl font-bold tracking-[0.18em] text-cyan-300 sm:text-5xl">KYRON</h2>
                  <p className="mt-2 text-base text-slate-400">Discovery, voting, promoted placements and banner ads.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <div className="text-lg font-semibold text-white">Contact Us</div>
                <div className="mt-4 flex items-center gap-3">
                  <a href="https://x.com/hubspyton" className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-cyan-300/50 hover:text-cyan-200">X</a>
                  <a href="https://t.me/SpyTonCommunity" className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-sky-400/30 bg-sky-400/20 text-white transition hover:border-sky-300 hover:bg-sky-400/30">TG</a>
                  <a href="https://t.me/DevAtSpyTON" className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-cyan-300/50 hover:text-cyan-200">@</a>
                </div>
              </div>

              <div>
                <div className="text-lg font-semibold text-white">Ad &amp; Boosting</div>
                <div className="mt-4 space-y-2 text-slate-300">
                  <a href="/banner-ads" className="block hover:text-white">Header banner ads</a>
                  <a href="/promote" className="block hover:text-white">Promoted placements</a>
                  <a href="/submit" className="block hover:text-white">Fast listing</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
