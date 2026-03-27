'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/submit', label: 'Submit' },
  { href: '/banner-ads', label: 'Banner Ads' },
  { href: '/admin', label: 'Owner Dashboard' },
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
        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-stroke/80 bg-slate-950/90 text-slate-100 shadow-[0_0_22px_rgba(34,211,238,0.12)]"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[500] md:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/80"
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,#020816_0%,#061227_48%,#07182f_100%)] text-white">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-stroke/70 px-5 py-5">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.34em] text-cyan-200/90">Ton Gemz</div>
                  <div className="mt-1 text-2xl font-semibold text-white">Menu</div>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-stroke/80 bg-slate-900/90 text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-5 py-6">
                <div className="space-y-3">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-2xl border border-stroke/70 bg-slate-950/70 px-5 py-4 text-lg font-medium text-slate-100 transition hover:border-cyan-400/35 hover:bg-slate-900/90 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </nav>

              <div className="border-t border-stroke/70 px-5 py-5">
                <Link
                  href="/submit"
                  onClick={() => setOpen(false)}
                  className="block rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950"
                >
                  Submit Token
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
