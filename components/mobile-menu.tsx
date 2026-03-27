'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/submit', label: 'Submit' },
  { href: '/banner-ads', label: 'Banner Ads' },
  { href: '/admin', label: 'Owner' },
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
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-stroke/80 bg-card/70 text-slate-100 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
      >
        <Menu className="h-4.5 w-4.5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[120] md:hidden">
          <button
            type="button"
            aria-label="Close menu backdrop"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[#020814]/88 backdrop-blur-xl"
          />

          <aside className="absolute inset-y-0 left-0 flex w-[86vw] max-w-[360px] flex-col border-r border-cyan-500/20 bg-[linear-gradient(180deg,rgba(2,8,20,0.98),rgba(4,12,30,0.99))] shadow-[0_0_45px_rgba(15,23,42,0.65)]">
            <div className="flex items-center justify-between border-b border-stroke/70 px-5 py-5">
              <div>
                <div className="text-xs uppercase tracking-[0.34em] text-cyan-200">Menu</div>
                <div className="mt-1 text-sm text-slate-400">Navigate Ton Gemz</div>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-stroke/80 bg-slate-900/90 text-slate-200"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <form action="/explore" method="get" className="mb-5">
                <div className="flex items-center gap-2 rounded-2xl border border-stroke/80 bg-slate-950 px-3.5 py-3.5 shadow-soft">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search tokens"
                    className="w-full min-w-0 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </form>

              <nav className="grid gap-3">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl border border-stroke/70 bg-slate-950/95 px-4 py-4 text-base font-medium text-slate-100 transition hover:border-cyan-400/35 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
