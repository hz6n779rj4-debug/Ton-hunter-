import Image from 'next/image';
import Link from 'next/link';
import { BadgeDollarSign, Menu, Search, Shield } from 'lucide-react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/submit', label: 'Submit' },
  { href: '/banner-ads', label: 'Banner Ads' },
  { href: '/admin', label: 'Owner' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-stroke/70 bg-[#040814]/90 backdrop-blur-2xl">
      <div className="border-b border-fuchsia-400/20 bg-gradient-to-r from-fuchsia-500/70 via-violet-500/55 to-cyan-400/30">
        <div className="container-main flex items-center justify-between gap-3 py-2 text-[11px] uppercase tracking-[0.22em] text-white/90 sm:text-xs">
          <Link
            href="/banner-ads"
            className="inline-flex items-center gap-2 rounded-full border border-lime-300/35 bg-black/25 px-3 py-1 font-semibold text-lime-200 transition hover:bg-black/35"
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="rounded-md bg-lime-400 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-normal text-slate-950">Ad</span>
            Banner slot available
          </Link>
          <Link
            href="/banner-ads"
            className="inline-flex min-w-24 items-center justify-center rounded-full border border-lime-300/45 bg-lime-400/90 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-950 transition hover:bg-lime-300 sm:min-w-36"
          >
            Book banner ad
          </Link>
        </div>
      </div>

      <div className="border-b border-cyan-400/15 bg-black/25">
        <div className="container-main flex flex-wrap items-center gap-x-6 gap-y-2 py-3 text-sm text-slate-300">
          <span>SOL-style premium TON board</span>
          <span>Projects Listed: Live</span>
          <span>Total Upvotes: Live</span>
          <span>Promoted slots: Open</span>
        </div>
      </div>

      <div className="container-main flex min-h-[88px] items-center justify-between gap-4 py-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            aria-label="Menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-stroke/80 bg-card/70 text-slate-100 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="overflow-hidden rounded-2xl border border-cyan-300/25 shadow-[0_0_32px_rgba(34,211,238,0.18)]">
              <Image src="/tonhunters-logo.jpg" alt="Tonhunters" width={52} height={52} className="h-12 w-12 object-cover sm:h-14 sm:w-14" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xl font-semibold tracking-tight text-white sm:text-2xl">Tonhunters</div>
              <div className="truncate text-[11px] uppercase tracking-[0.35em] text-slate-400 sm:text-xs">SpyTON-owned TON board</div>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-slate-300 transition hover:text-white">
              {link.label}
            </Link>
          ))}
          <Link href="/explore" aria-label="Search projects" className="text-slate-200 transition hover:text-white">
            <Search className="h-5 w-5" />
          </Link>
        </nav>

        <Link
          href="/submit"
          className="rounded-[26px] border border-cyan-400/60 bg-gradient-to-r from-fuchsia-500/15 via-violet-500/10 to-cyan-400/10 px-5 py-3 text-center text-base font-medium text-white shadow-[0_0_24px_rgba(34,211,238,0.12)] transition hover:border-cyan-300/80 hover:bg-cyan-400/10"
        >
          Submit Coin
        </Link>
      </div>
    </header>
  );
}
