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
    const previousOverflow = document.body.style.overflow;
    const previousTouch = document.body.style.touchAction;
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouch;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-stroke/80 bg-card/70 text-slate-100"
      >
        <Menu className="h-4.5 w-4.5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[120] bg-[#030817] md:hidden">
          <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-6 pt-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.28em] text-cyan-200">Menu</div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke/80 bg-slate-900 text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action="/explore" method="get" className="mb-4">
              <div className="flex items-center gap-2 rounded-2xl border border-stroke/80 bg-slate-950 px-3 py-3 shadow-soft">
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
                  className="block rounded-2xl border border-stroke/70 bg-slate-950 px-4 py-4 text-base text-slate-100 transition hover:border-cyan-400/35 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
