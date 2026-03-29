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
          <div className="overflow-hidden rounded-[28px] border border-cyan-400/15 bg-[linear-gradient(90deg,rgba(8,28,52,0.95),rgba(10,16,26,0.92))] shadow-soft">
            <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200"><Rocket className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-lg font-semibold text-white">Fast Track Listing <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-emerald-300">New</span></div>
                  <p className="text-sm text-slate-400">Skip the queue • Priority review • Fast placement</p>
                </div>
              </div>
              <Link href="/submit" className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-950 transition hover:bg-emerald-300">Fast Track</Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-fuchsia-400/20 bg-[linear-gradient(90deg,rgba(97,69,187,0.88),rgba(56,91,183,0.82),rgba(44,118,193,0.84))] shadow-soft">
            <div className="flex min-h-[220px] flex-col justify-between gap-5 p-5 sm:min-h-[250px] sm:p-6">
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/40 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-lime-200"><Megaphone className="h-3.5 w-3.5" /> Banner ad slot</div>
                <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl">{bannerAd?.title || 'Book a Ton Gemz banner'}</h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-100/85">Want your project shown at the top of Ton Gemz? Book the main banner area for launch pushes, boosts, and ecosystem campaigns.</p>
              </div>

              <div className="flex items-center gap-4 rounded-[24px] bg-slate-950/20 p-4 backdrop-blur-sm">
                <div className="h-16 w-28 overflow-hidden rounded-[18px] border border-white/10 bg-slate-950/30 sm:h-20 sm:w-36">
                  <img src={bannerAd?.image_url || '/tongemz-logo.png'} alt={bannerAd?.title || 'TonGemz banner'} className="h-full w-full object-cover" />
                </div>
                {bannerAd ? (
                  <a href={bannerAd.target_url} className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-slate-100">Open banner</a>
                ) : (
                  <Link href="/banner-ads" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-slate-100">Book banner</Link>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-cyan-400/15 bg-[linear-gradient(90deg,rgba(0,0,0,0.85),rgba(7,26,48,0.9),rgba(16,86,95,0.75))] shadow-soft">
            <div className="grid gap-4 p-5 sm:grid-cols-[1.1fr_0.9fr] sm:items-center">
              <div>
                <div className="text-sm uppercase tracking-[0.22em] text-cyan-300">Official links only</div>
                <h2 className="mt-2 text-3xl font-bold text-white">Scam Alert</h2>
                <p className="mt-2 max-w-xl text-sm text-slate-300">Use only the official TonGemz links from this website. Ignore fake bots, fake channels, and copied listing pages.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/submit" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white">Apply For Listing</Link>
                </div>
              </div>
              <div className="hidden justify-end sm:flex"><div className="hero-orb flex h-[180px] w-full max-w-[280px] items-center justify-center rounded-[30px] border border-white/10"><ShieldCheck className="h-20 w-20 text-amber-300" /></div></div>
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

      <section className="container-main py-8"><SectionHeading title="Trending" subtitle="Ranked by 24h votes, boost votes, and promoted placement." action={<Link href="/today-best" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">View all <ArrowRight className="h-4 w-4" /></Link>} /><div className="grid gap-4 lg:grid-cols-3">{trending.map((token, index) => <TokenCard key={token.id} token={token} rank={index + 1} />)}</div></section>
      <section className="container-main py-8"><SectionHeading title="Top Gainers" subtitle="Sorted by strongest positive change, with volume supporting the rank." action={<Link href="/explore" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">Explore <ArrowRight className="h-4 w-4" /></Link>} /><div className="grid gap-4 lg:grid-cols-3">{topGainers.map((token, index) => <TokenCard key={token.id} token={token} rank={index + 1} />)}</div></section>
      <section className="container-main py-8"><SectionHeading title="New Listings" subtitle="Fresh approved TON listings, newest first." action={<Link href="/new-listings" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">View all <ArrowRight className="h-4 w-4" /></Link>} /><div className="grid gap-4 lg:grid-cols-3">{newListings.map((token) => <TokenCard key={token.id} token={token} />)}</div></section>
      <section className="container-main py-8"><SectionHeading title="All Time Best" subtitle="Projects with the strongest long-term score on Ton Gemz." action={<Link href="/all-time-best" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">View all <ArrowRight className="h-4 w-4" /></Link>} /><div className="grid gap-4 lg:grid-cols-3">{allTimeBest.map((token, index) => <TokenCard key={token.id} token={token} rank={index + 1} />)}</div></section>
      <section className="container-main py-8"><SectionHeading title="Promoted" subtitle="Featured projects and bought placements." action={<Link href="/promote" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">Promote yours <ArrowRight className="h-4 w-4" /></Link>} /><div className="grid gap-4 lg:grid-cols-3">{promoted.map((token, index) => <TokenCard key={token.id} token={token} rank={index + 1} />)}</div></section>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="panel p-5"><div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-200">{icon}</div><div className="text-sm text-slate-400">{label}</div><div className="mt-2 text-2xl font-semibold text-white">{value}</div></div>;
}
