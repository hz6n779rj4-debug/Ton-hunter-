'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { Menu, X, Rocket, Megaphone, ShieldCheck, LayoutDashboard, Flame, Trophy, PlusCircle, Home, TrendingUp } from 'lucide-react';

const shortcuts = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/today-best', label: 'Trending', icon: Flame },
  { href: '/new-listings', label: 'New Listings', icon: PlusCircle },
  { href: '/top-gainers', label: 'Top Gainers', icon: TrendingUp },
  { href: '/all-time-best', label: 'All Time Best', icon: Trophy },
  { href: '/submit', label: 'Apply For Listing', icon: Rocket },
  { href: '/promote', label: 'Promote Coin', icon: Megaphone },
  { href: '/banner-ads', label: 'Book Banner', icon: ShieldCheck },
  { href: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
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
        className="absolute inset-0 bg-slate-950/88 backdrop-blur-sm"
      />

      <aside className="absolute inset-0 bg-[linear-gradient(180deg,#020816_0%,#07162d_100%)] text-white shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between border-b border-stroke/70 px-5 pb-5 pt-8">
            <div>
              <div className="text-xs uppercase tracking-[0.34em] text-cyan-200">Ton Gemz</div>
              <div className="mt-3 text-3xl font-semibold text-white">Menu</div>
            </div>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stroke/80 bg-slate-900/90 text-slate-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-5">
            <div className="space-y-3">
              {shortcuts.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-[20px] border border-cyan-400/18 bg-[linear-gradient(90deg,rgba(8,28,52,0.95),rgba(8,24,46,0.75))] px-4 py-4 text-base font-medium text-white"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  {label}
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
