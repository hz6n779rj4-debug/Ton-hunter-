import Image from 'next/image';
import Link from 'next/link';
export const dynamic = 'force-dynamic';
import { ArrowRight } from 'lucide-react';
import { getHomepageData } from '@/lib/ton';
import { getPrimaryBannerAd } from '@/lib/banner-ads';
import { TokenCard } from '@/components/token-card';
import { SectionHeading } from '@/components/section-heading';

export default async function HomePage() {
  const { promoted, trending, allTimeBest, newListings, topGainers } = await getHomepageData();
  const bannerAd = await getPrimaryBannerAd();
  const bannerHref = bannerAd?.target_url || '/banner-ads';
  const bannerTitle = bannerAd?.title || 'Book a Ton Gemz banner';
  const bannerImage = bannerAd?.image_url || '/tongemz-logo.png';

  return (
    <div>
      <section className="container-main py-6 sm:py-8">
        <Link href={bannerHref} className="block overflow-hidden rounded-[30px] border border-cyan-400/15 bg-[linear-gradient(90deg,rgba(86,52,184,0.82),rgba(36,90,190,0.78),rgba(26,123,186,0.76))] shadow-soft transition hover:border-cyan-300/30">
          <div className="grid min-h-[260px] gap-5 p-5 sm:min-h-[320px] sm:grid-cols-[1.15fr_0.85fr] sm:items-center sm:p-7 lg:min-h-[360px] lg:p-8">
            <div className="flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/40 bg-black/15 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-lime-200">
                  Banner ad slot
                </div>
                <h1 className="mt-5 max-w-xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                  {bannerTitle}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-8 text-white/85 sm:text-lg">
                  Big homepage banner placement for promotions, ecosystem campaigns, token pushes, and brand visibility.
                </p>
              </div>

              <div className="mt-6 inline-flex w-fit items-center gap-4 rounded-[26px] bg-slate-950/20 p-3 pr-4 backdrop-blur-sm sm:mt-8">
                <div className="overflow-hidden rounded-[22px] border border-white/10 bg-slate-950/25">
                  <Image
                    src={bannerImage}
                    alt={bannerTitle}
                    width={320}
                    height={180}
                    className="h-20 w-36 object-cover sm:h-24 sm:w-44"
                    unoptimized
                  />
                </div>
                <span className="rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-950 sm:px-8 sm:text-lg">
                  Open banner
                </span>
              </div>
            </div>

            <div className="hidden items-center justify-end sm:flex">
              <div className="relative h-full min-h-[220px] w-full overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/20 lg:min-h-[280px]">
                <Image
                  src={bannerImage}
                  alt={bannerTitle}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-cyan-300/10" />
              </div>
            </div>
          </div>
        </Link>
      </section>

      <section className="container-main py-8"><SectionHeading title="Trending" subtitle="Ranked by 24h votes, boost votes, and promoted placement." action={<Link href="/today-best" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">View all <ArrowRight className="h-4 w-4" /></Link>} /><div className="grid gap-4 lg:grid-cols-3">{trending.map((token, index) => <TokenCard key={token.id} token={token} rank={index + 1} />)}</div></section>
      <section className="container-main py-8"><SectionHeading title="Top Gainers" subtitle="Sorted by strongest positive change, with volume supporting the rank." action={<Link href="/explore" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">Explore <ArrowRight className="h-4 w-4" /></Link>} /><div className="grid gap-4 lg:grid-cols-3">{topGainers.map((token, index) => <TokenCard key={token.id} token={token} rank={index + 1} />)}</div></section>
      <section className="container-main py-8"><SectionHeading title="New Listings" subtitle="Fresh approved TON listings, newest first." action={<Link href="/new-listings" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">View all <ArrowRight className="h-4 w-4" /></Link>} /><div className="grid gap-4 lg:grid-cols-3">{newListings.map((token) => <TokenCard key={token.id} token={token} />)}</div></section>
      <section className="container-main py-8"><SectionHeading title="All Time Best" subtitle="Projects with the strongest long-term score on Ton Gemz." action={<Link href="/all-time-best" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">View all <ArrowRight className="h-4 w-4" /></Link>} /><div className="grid gap-4 lg:grid-cols-3">{allTimeBest.map((token, index) => <TokenCard key={token.id} token={token} rank={index + 1} />)}</div></section>
      <section className="container-main py-8"><SectionHeading title="Promoted" subtitle="Featured projects and bought placements." action={<Link href="/promote" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">Promote yours <ArrowRight className="h-4 w-4" /></Link>} /><div className="grid gap-4 lg:grid-cols-3">{promoted.map((token, index) => <TokenCard key={token.id} token={token} rank={index + 1} />)}</div></section>
    </div>
  );
}
