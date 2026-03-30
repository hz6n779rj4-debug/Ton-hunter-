import Image from 'next/image';
import Link from 'next/link';
import { Search, Shield, Rocket } from 'lucide-react';
import { getPrimaryBannerAd } from '@/lib/banner-ads';
import { MobileMenu } from '@/components/mobile-menu';

const links = [
  { href: '/', label: 'Home' },
  { href: '/today-best', label: 'Trending' },
  { href: '/new-listings', label: 'New Listings' },
  { href: '/top-gainers', label: 'Top Gainers' },
  { href: '/all-time-best', label: 'All Time Best' },
  { href: '/promote', label: 'Promote' },
  { href: '/banner-ads', label: 'Banner Ads' },
  { href: '/admin', label: 'Owner' },
];

export async function Header() {
  const bannerAd = await getPrimaryBannerAd();
  const bannerHref = bannerAd?.target_url || '/banner-ads';
  const bannerTitle = bannerAd?.title || 'Book a KYRON banner';

  return (
    <header className="sticky top-0 z-40 border-b border-stroke/70 bg-[#040814]/92 backdrop-blur-2xl">
      <div className="border-b border-fuchsia-400/20 bg-gradient-to-r from-fuchsia-500/70 via-violet-500/55 to-cyan-400/30">
        <div className="container-main flex items-center justify-between gap-2 py-1 text-[9px] uppercase tracking-[0.16em] text-white/90 sm:text-[10px]">
          <Link href={bannerHref} className="inline-flex min-w-0 max-w-[60vw] items-center gap-1.5 rounded-full border border-lime-300/35 bg-black/25 px-2 py-1 font-semibold text-lime-200 transition hover:bg-black/35 sm:max-w-none">
            <Shield className="h-2.5 w-2.5" />
            <span className="rounded-md bg-lime-400 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-normal text-slate-950">Ad</span>
            <span className="max-w-[30vw] truncate sm:max-w-[45vw]">{bannerTitle}</span>
          </Link>
          <Link href="/banner-ads" className="inline-flex min-w-[124px] items-center justify-center rounded-full border border-lime-300/45 bg-lime-400/90 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-950 transition hover:bg-lime-300 sm:min-w-[138px]">Book banner</Link>
        </div>
      </div>

      <div className="container-main py-2">
        <div className="mx-auto flex min-h-[54px] max-w-6xl items-center justify-between gap-2 overflow-hidden">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="md:hidden"><MobileMenu /></div>
            <Link href="/" className="flex min-w-0 items-center gap-2 justify-center">
              <div className="overflow-hidden rounded-2xl border border-cyan-300/25 shadow-[0_0_32px_rgba(34,211,238,0.18)]">
                <Image src="/kyron-logo.png" alt="KYRON" width={40} height={40} className="h-9 w-9 object-cover sm:h-10 sm:w-10" />
              </div>
              <div className="min-w-0 whitespace-nowrap text-lg font-semibold tracking-[0.05em] text-white sm:text-[1.65rem]">KYRON</div>
            </Link>
          </div>

          <div className="flex flex-1 justify-center px-1 md:px-4 lg:px-8">
            <form action="/explore" method="get" className="w-full max-w-[180px] sm:max-w-xl">
              <div className="flex items-center gap-2 rounded-[22px] border border-stroke/80 bg-card/65 px-4 py-3 shadow-soft">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search"
                  className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </form>
          </div>

          <nav className="hidden items-center gap-5 xl:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-slate-300 transition hover:text-white">{link.label}</Link>
            ))}
          </nav>

          <Link href="/submit" className="inline-flex items-center gap-2 rounded-[20px] border border-cyan-400/55 bg-gradient-to-r from-fuchsia-500/15 via-violet-500/10 to-cyan-400/10 px-4 py-2 text-center text-sm font-medium text-white shadow-[0_0_20px_rgba(34,211,238,0.10)] transition hover:border-cyan-300/80 hover:bg-cyan-400/10 sm:px-5 sm:py-2.5">
            <Rocket className="hidden h-4 w-4 sm:block" />Submit
          </Link>
        </div>
      </div>
    </header>
  );
}
