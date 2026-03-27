import Image from 'next/image';
import Link from 'next/link';
import { Menu, Search, Shield, Megaphone } from 'lucide-react';
import { getPrimaryBannerAd } from '@/lib/banner-ads';

const links = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/submit', label: 'Submit' },
  { href: '/banner-ads', label: 'Banner Ads' },
  { href: '/admin', label: 'Owner' },
];

export async function Header() {
  const bannerAd = await getPrimaryBannerAd();
  const bannerHref = bannerAd?.target_url || '/banner-ads';
  const bannerTitle = bannerAd?.title || 'Banner slot available';

  return (
    <header className="sticky top-0 z-40 border-b border-stroke/70 bg-[#040814]/92 backdrop-blur-2xl">
      <div className="border-b border-fuchsia-400/20 bg-gradient-to-r from-fuchsia-500/70 via-violet-500/55 to-cyan-400/30">
        <div className="container-main flex items-center justify-between gap-2 py-1 text-[9px] uppercase tracking-[0.16em] text-white/90 sm:text-[10px]">
          <Link
            href={bannerHref}
            className="inline-flex min-w-0 max-w-[60vw] items-center gap-1.5 rounded-full border border-lime-300/35 bg-black/25 px-2 py-1 font-semibold text-lime-200 transition hover:bg-black/35 sm:max-w-none"
          >
            <Shield className="h-2.5 w-2.5" />
            <span className="rounded-md bg-lime-400 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-normal text-slate-950">Ad</span>
            <span className="max-w-[30vw] truncate sm:max-w-[45vw]">{bannerTitle}</span>
          </Link>
          <Link
            href="/banner-ads"
            className="inline-flex min-w-[124px] items-center justify-center rounded-full border border-lime-300/45 bg-lime-400/90 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-950 transition hover:bg-lime-300 sm:min-w-[138px]"
          >
            Book banner
          </Link>
        </div>
      </div>

      <div className="container-main py-1.5">
        <div className="mx-auto flex min-h-[54px] max-w-5xl items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <details className="relative md:hidden">
              <summary className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-xl border border-stroke/80 bg-card/70 text-slate-100 marker:content-none">
                <Menu className="h-4.5 w-4.5" />
              </summary>
              <div className="absolute left-0 top-12 w-72 rounded-[24px] border border-stroke bg-[#071325]/95 p-4 shadow-soft backdrop-blur-xl">
                <form action="/explore" method="get" className="mb-4">
                  <div className="flex items-center gap-2 rounded-2xl border border-stroke/80 bg-black/25 px-3 py-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="q"
                      placeholder="Search tokens"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />
                  </div>
                </form>
                <div className="space-y-2">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block rounded-2xl border border-stroke/70 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-400/35 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </details>

            <Link href="/" className="flex min-w-0 items-center gap-2 justify-center">
              <div className="overflow-hidden rounded-2xl border border-cyan-300/25 shadow-[0_0_32px_rgba(34,211,238,0.18)]">
                <Image src="/tongemz-logo.png" alt="Ton Gemz" width={40} height={40} className="h-9 w-9 object-cover sm:h-10 sm:w-10" />
              </div>
              <div className="min-w-0">
                <div className="whitespace-nowrap text-lg font-semibold tracking-[0.05em] text-white sm:text-[1.65rem]">TON GEMZ</div>
              </div>
            </Link>
          </div>

          <div className="hidden flex-1 px-4 md:block lg:px-8">
            <form action="/explore" method="get">
              <div className="mx-auto flex max-w-xl items-center gap-2 rounded-[22px] border border-stroke/80 bg-card/65 px-4 py-3 shadow-soft">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search tokens by name, symbol or address"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </form>
          </div>

          <nav className="hidden items-center gap-6 lg:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-slate-300 transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/submit"
            className="rounded-[20px] border border-cyan-400/55 bg-gradient-to-r from-fuchsia-500/15 via-violet-500/10 to-cyan-400/10 px-4 py-2 text-center text-sm font-medium text-white shadow-[0_0_20px_rgba(34,211,238,0.10)] transition hover:border-cyan-300/80 hover:bg-cyan-400/10 sm:px-5 sm:py-2.5"
          >
            Submit
          </Link>
        </div>
      </div>
    </header>
  );
}
