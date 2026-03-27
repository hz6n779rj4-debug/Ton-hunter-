'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/submit', label: 'Submit Token' },
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
        <div className="fixed inset-0 z-[400] md:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/88 backdrop-blur-md"
          />

          <aside className="absolute inset-0 flex h-full w-full flex-col bg-[linear-gradient(180deg,#020816_0%,#051229_100%)] text-white">
            <div className="flex items-start justify-between border-b border-stroke/70 px-6 py-6">
              <div>
                <div className="text-xs uppercase tracking-[0.34em] text-cyan-200">TON GEMZ</div>
                <div className="mt-3 text-4xl font-semibold tracking-tight text-white">Menu</div>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-stroke/80 bg-slate-900/90 text-slate-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-[22px] border border-stroke/70 bg-slate-950/85 px-6 py-5 text-2xl font-medium text-slate-100 transition hover:border-cyan-400/35 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
