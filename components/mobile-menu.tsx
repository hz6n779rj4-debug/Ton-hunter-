'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, Search, X, Gem, LayoutGrid, Shield, Megaphone, Settings2 } from 'lucide-react';

const links = [
  { href: '/', label: 'Home', icon: LayoutGrid },
  { href: '/explore', label: 'Explore', icon: Search },
  { href: '/submit', label: 'Submit', icon: Gem },
  { href: '/banner-ads', label: 'Banner Ads', icon: Megaphone },
  { href: '/admin', label: 'Owner', icon: Settings2 },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    return () => document.body.classList.remove('menu-open');
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-stroke/80 bg-slate-950/70 text-slate-100 shadow-[0_0_18px_rgba(34,211,238,0.08)]"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[140] md:hidden">
          <button
            type="button"
            aria-label="Close menu backdrop"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[#020617]/88 backdrop-blur-md"
          />

          <div className="relative z-10 flex h-full w-full items-start justify-center px-3 pb-4 pt-4">
            <div className="w-full max-w-sm overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(4,8,20,0.98),rgba(3,12,32,0.98))] shadow-[0_18px_80px_rgba(2,8,23,0.72)]">
              <div className="flex items-center justify-between border-b border-stroke/70 px-5 py-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.32em] text-cyan-200">Menu</div>
                  <div className="mt-1 text-sm text-slate-400">Ton Gemz navigation</div>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-stroke/80 bg-slate-900 text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 px-4 py-4">
                <form action="/explore" method="get">
                  <div className="flex items-center gap-2 rounded-[22px] border border-stroke/80 bg-slate-950 px-3.5 py-3 shadow-soft">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="q"
                      placeholder="Search tokens"
                      className="w-full min-w-0 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                    />
                  </div>
                </form>

                <div className="grid gap-3">
                  {links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-[22px] border border-stroke/70 bg-slate-950/90 px-4 py-4 text-base text-slate-100 transition hover:border-cyan-400/35 hover:text-white"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/5 text-cyan-200">
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="rounded-[22px] border border-lime-400/20 bg-lime-400/5 p-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-black/15 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-lime-200">
                    <Shield className="h-3.5 w-3.5" /> Featured
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Book a banner or submit a token for premium placement directly from Ton Gemz.
                  </p>
                  <Link
                    href="/banner-ads"
                    onClick={() => setOpen(false)}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-lime-400 px-4 py-3 text-sm font-semibold text-slate-950"
                  >
                    Book banner
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
