import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-stroke/70 py-10 text-sm text-slate-400">
      <div className="container-main flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-medium text-slate-200">Tonhunters</p>
          <p className="mt-1 max-w-xl">SpyTON&apos;s TON discovery board with review-based listings, paid fast-track listings, promoted placements, and live market stats.</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/explore" className="hover:text-white">Explore</Link>
            <Link href="/submit" className="hover:text-white">Submit Coin</Link>
            <Link href="/admin" className="hover:text-white">Admin</Link>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-cyan-200">
            <Link href="https://t.me/DevAtSpyTON" target="_blank" className="hover:text-white">Support</Link>
            <Link href="https://t.me/SpyTonCommunity" target="_blank" className="hover:text-white">Official Telegram</Link>
            <Link href="https://x.com/hubspyton" target="_blank" className="hover:text-white">Twitter</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
