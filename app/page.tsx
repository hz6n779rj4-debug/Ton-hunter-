import Link from 'next/link';
export const dynamic = 'force-dynamic';
import { ArrowRight, Rocket, ShieldCheck, Vote, Megaphone } from 'lucide-react';
import { getHomepageData } from '@/lib/ton';
import { getPrimaryBannerAd } from '@/lib/banner-ads';
import { TokenCard } from '@/components/token-card';
import { SectionHeading } from '@/components/section-heading';
import { formatCompact } from '@/lib/utils';

export default async function HomePage() {
  const { promoted, trending, allTimeBest, newListings, topGainers } = await getHomepageData();
  const bannerAd = await getPrimaryBannerAd();
  const stats = {
    totalTokens: Math.max(newListings.length, trending.length, allTimeBest.length),
    totalVotes24h: trending.reduce((sum, token) => sum + (token.votes_24h || 0), 0),
    promotedCount: promoted.length,
  };

  return (
    <div>
      <section className="container-main py-8 sm:py-10">
        <div className="grid gap-4">
          <div className="overflow-hidden rounded-[28px] border border-fuchsia-400/20 bg-[linear-gradient(90deg,rgba(92,45,180,0.78),rgba(53,91,194,0.80),rgba(38,146,220,0.82))] shadow-soft">
            <div className="flex min-h-[230px] flex-col justify-between gap-5 p-5 sm:min-h-[280px] sm:p-7">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/40 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-lime-200"><Megaphone className="h-3.5 w-3.5" /> Banner Ad Slot</div>
                <h2 className="mt-5 max-w-[16ch] text-4xl font-bold leading-tight text-white sm:text-5xl">{bannerAd?.title || 'Book a TON Gemz banner'}</h2>
              </div>

              <div className="flex items-center gap-4 rounded-[28px] bg-slate-950/18 p-4 sm:p-5">
                <a href={bannerAd?.target_url || '/banner-ads'} className="block min-w-0 flex-1 overflow-hidden rounded-[22px] border border-white/10 bg-slate-950/20">
                  <img
                    src={bannerAd?.image_url || '/tongemz-logo.png'}
                    alt={bannerAd?.title || 'Ton Gemz banner'}
                    className="h-28 w-full object-cover sm:h-40"
                  />
                </a>
                <Link href="/banner-ads" className="shrink-0 rounded-full bg-white px-6 py-4 text-base font-semibold text-slate-950 sm:px-8">Open banner</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-main pb-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="Tokens listed" value={formatCompact(stats.totalTokens)} icon={<Rocket className="h-4 w-4" />} />
          <Metric label="Votes in 24H" value={formatCompact(stats.totalVotes24h)} icon={<Vote className="h-4 w-4" />} />
          <Metric label="Promoted slots" value={formatCompact(stats.promotedCount)} icon={<Megaphone className="h-4 w-4" />} />
        </div>
      </section>

      <section id="trending" className="container-main py-8"><SectionHeading title="Trending" subtitle="Ranked by 24h votes, boost votes, and promoted placement." action={<Link href="/today-best" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">View all <ArrowRight className="h-4 w-4" /></Link>} /><div className="grid gap-4 lg:grid-cols-3">{trending.map((token, index) => <TokenCard key={token.id} token={token} rank={index + 1} />)}</div></section>
      <section id="top-gainers" className="container-main py-8"><SectionHeading title="Top Gainers" subtitle="Sorted by strongest positive change, with volume supporting the rank." action={<Link href="/top-gainers" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">Explore <ArrowRight className="h-4 w-4" /></Link>} /><div className="grid gap-4 lg:grid-cols-3">{topGainers.map((token, index) => <TokenCard key={token.id} token={token} rank={index + 1} />)}</div></section>
      <section id="new-listings" className="container-main py-8"><SectionHeading title="New Listings" subtitle="Fresh approved TON listings, newest first." action={<Link href="/new-listings" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">View all <ArrowRight className="h-4 w-4" /></Link>} /><div className="grid gap-4 lg:grid-cols-3">{newListings.map((token) => <TokenCard key={token.id} token={token} />)}</div></section>
      <section id="all-time-best" className="container-main py-8"><SectionHeading title="All Time Best" subtitle="Projects with the strongest long-term score on Ton Gemz." action={<Link href="/all-time-best" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">View all <ArrowRight className="h-4 w-4" /></Link>} /><div className="grid gap-4 lg:grid-cols-3">{allTimeBest.map((token, index) => <TokenCard key={token.id} token={token} rank={index + 1} />)}</div></section>
      <section className="container-main py-8"><SectionHeading title="Promoted" subtitle="Featured projects and bought placements." action={<Link href="/promote" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">Promote yours <ArrowRight className="h-4 w-4" /></Link>} /><div className="grid gap-4 lg:grid-cols-3">{promoted.map((token, index) => <TokenCard key={token.id} token={token} rank={index + 1} />)}</div></section>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="panel p-5"><div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-200">{icon}</div><div className="text-sm text-slate-400">{label}</div><div className="mt-2 text-2xl font-semibold text-white">{value}</div></div>;
}
