import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-stroke/70 bg-slate-950/85 backdrop-blur">
      <div className="container-main flex items-center justify-between gap-4 py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image src="/tonhunters-logo.jpg" alt="Tonhunters" width={56} height={56} className="h-14 w-14 rounded-2xl object-cover" priority />
          <div className="min-w-0">
            <div className="truncate text-2xl font-semibold tracking-tight text-white">Tonhunters</div>
            <div className="truncate text-[11px] uppercase tracking-[0.38em] text-slate-400">SpyTON-owned TON gem board</div>
          </div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="https://t.me/SpyTonCommunity" target="_blank" className="hidden rounded-full border border-stroke px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-white sm:inline-flex">Community</Link>
          <Link href="/submit" className="rounded-full border border-cyan-400/35 bg-cyan-400/10 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:text-white sm:px-6">List your project</Link>
        </div>
      </div>
    </header>
  );
}
