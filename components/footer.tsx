import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-stroke/70 py-10 text-sm text-slate-400">
      <div className="container-main flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-slate-200">Tonhunters</p>
          <p className="mt-1">TON project discovery, voting, promoted placements, and listing review tools by SpyTON.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/explore" className="hover:text-white">Explore</Link>
          <Link href="/submit" className="hover:text-white">Submit Coin</Link>
          <Link href="/admin" className="hover:text-white">Admin</Link>
          <a href="https://t.me/DevAtSpyTON" className="hover:text-white">Support</a>
          <a href="https://t.me/SpyTonCommunity" className="hover:text-white">Telegram</a>
          <a href="https://x.com/hubspyton" className="hover:text-white">Twitter</a>
        </div>
      </div>
    </footer>
  );
}
