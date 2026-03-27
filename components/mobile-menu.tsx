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
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
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
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-3 right-3 top-20 mx-auto max-w-[320px] overflow-hidden rounded-[24px] border border-stroke bg-[#071325]/98 p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.22em] text-cyan-200">Menu</div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-stroke/80 bg-black/20 text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action="/explore" method="get" className="mb-4">
              <div className="flex items-center gap-2 rounded-2xl border border-stroke/80 bg-black/25 px-3 py-2.5">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search tokens"
                  className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </form>

            <div className="space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl border border-stroke/70 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-400/35 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
