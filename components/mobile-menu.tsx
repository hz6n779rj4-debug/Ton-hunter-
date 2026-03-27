'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    return () => document.body.classList.remove('menu-open');
  }, [open]);

  const overlay = open ? (
    <div className="fixed inset-0 z-[9999] md:hidden">
      <button
        type="button"
        aria-label="Close menu overlay"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-slate-950/82 backdrop-blur-sm"
      />

      <aside className="absolute inset-y-0 left-0 w-full max-w-none bg-[linear-gradient(180deg,#020816_0%,#07162d_100%)] text-white shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between border-b border-stroke/70 px-5 pb-5 pt-10">
            <div>
              <div className="text-xs uppercase tracking-[0.34em] text-cyan-200">Ton Gemz</div>
              <div className="mt-3 text-4xl font-semibold text-white">Menu</div>
            </div>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-stroke/80 bg-slate-900/90 text-slate-200"
            >
              <X className="h-7 w-7" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-6">
            <div className="space-y-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-[22px] border border-stroke/70 bg-slate-950/92 px-6 py-5 text-2xl font-medium text-white transition hover:border-cyan-400/35"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </aside>
    </div>
  ) : null;

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
      {mounted ? createPortal(overlay, document.body) : null}
    </>
  );
}
