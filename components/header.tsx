import Image from 'next/image';
import Link from 'next/link';

const links = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore Coins' },
  { href: '/submit', label: 'Submit Coin' },
  { href: '/admin', label: 'Admin' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-stroke/60 bg-bg/80 backdrop-blur-xl">
      <div className="container-main flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="overflow-hidden rounded-2xl border border-cyan-300/25">
            <Image src="/tonhunters-logo.jpg" alt="Tonhunters" width={44} height={44} className="h-11 w-11 object-cover" />
          </div>
          <div>
            <div className="text-base font-semibold sm:text-lg">Tonhunters</div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">SpyTON-owned TON board</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-slate-300 transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/submit" className="rounded-full border border-cyan-400/35 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/15">
          List your project
        </Link>
      </div>
    </header>
  );
}
