import Link from 'next/link';
export const dynamic = 'force-dynamic';
import Image from 'next/image';
import { ArrowRight, CircleDollarSign, Rocket, ShieldCheck, Vote, Megaphone, BadgeCheck } from 'lucide-react';
import { getHomepageData } from '@/lib/ton';
import { getPrimaryBannerAd } from '@/lib/banner-ads';
import { TokenCard } from '@/components/token-card';
import { SectionHeading } from '@/components/section-heading';
import { formatCompact, formatUsd } from '@/lib/utils';

export default async function HomePage() {
  const { promoted, todaysBest, allTimeBest, newListings, verifiedTeam } = await getHomepageData();
  const bannerAd = await getPrimaryBannerAd();
  const stats = {
    totalTokens: newListings.length + Math.max(allTimeBest.length - newListings.length, 0),
    totalVotes24h: todaysBest.reduce((sum, token) => sum + (token.votes_24h || 0), 0),
    promotedCount: promoted.length,
    verifiedCount: verifiedTeam.length,
  };

  return (
    <div className="bg-hero">
      <section className="container-main py-12 sm:py-16">
        <div className="mb-8 overflow-hidden rounded-[30px] border border-fuchsia-400/25 bg-gradient-to-r from-fuchsia-500/20 via-violet-500/15 to-cyan-400/15 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/40 bg-lime-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-lime-200"><Megaphone className="h-3.5 w-3.5" /> Banner ad slot</div>
              <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">{bannerAd?.title || 'Premium header banner placement'}</h2>
              <p className="mt-2 max-w-2xl text-slate-200/85">Want your project shown at the top of Ton Gemz? Book the main banner area for launch pushes, boosts, and ecosystem campaigns.</p>
            </div>
            {bannerAd ? (
              <a href={bannerAd.target_url} className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-black/25 p-3 pr-4">
                <Image src={bannerAd.image_url} alt={bannerAd.title} width={108} height={48} className="h-12 w-24 rounded-xl object-cover" unoptimized />
                <span className="rounded-full bg-white px-5 py-3 text-center font-semibold text-slate-950 shadow-lg shadow-black/20">Open banner</span>
              </a>
            ) : <Link href="/banner-ads" className="rounded-full bg-white px-5 py-3 text-center font-semibold text-slate-950 shadow-lg shadow-black/20">Book banner ad</Link>}
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-cyan-200">TON token discovery platform</div>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-6xl">Discover <span className="gradient-text">today’s best</span>, all-time winners, and new TON launches.</h1>
            <p className="mt-5 max-w-2xl text-base text-slate-300 sm:text-lg">Ton Gemz is a premium TON board with stronger discovery pages, verified team badges, project claims, banner ads, promoted placements, and community voting.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/today-best" className="rounded-full bg-white px-6 py-3 font-medium text-slate-950 transition hover:opacity-90">Today's Best</Link>
              <Link href="/claim-project" className="rounded-full border border-cyan-400/35 bg-card px-6 py-3 font-medium transition hover:border-cyan-400/50">Claim Project</Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Feature title="Today's Best" icon={<Vote className="h-4 w-4" />} text="Daily leaderboard ranked by 24h votes." />
              <Feature title="All-Time Best" icon={<Rocket className="h-4 w-4" />} text="Long-term winners ranked by total score." />
              <Feature title="New Listings" icon={<ShieldCheck className="h-4 w-4" />} text="Fresh approved launches shown first." />
              <Feature title="Verified Team" icon={<BadgeCheck className="h-4 w-4" />} text="Highlight trusted projects with a clear badge." />
            </div>
          </div>
          <div className="card grid-lines relative overflow-hidden p-5 shadow-soft">
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-cyan-300/10 to-transparent" />
            <div className="relative mb-5 flex items-center justify-between"><div><div className="text-xs uppercase tracking-[0.22em] text-cyan-200">Featured board</div><h2 className="mt-1 text-2xl font-semibold">Promoted Coins</h2></div><Link href="/submit" className="text-sm text-cyan-300 hover:text-cyan-200">Boost yours</Link></div>
            <div className="space-y-4">{promoted.map((token, index) => <TokenCard key={token.id} token={token} compact rank={index + 1} />)}</div>
          </div>
        </div>
      </section>

      <section className="container-main pb-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric label="Tokens listed" value={formatCompact(stats.totalTokens)} icon={<Rocket className="h-4 w-4" />} />
          <Metric label="Votes in 24H" value={formatCompact(stats.totalVotes24h)} icon={<Vote className="h-4 w-4" />} />
          <Metric label="Promoted slots" value={formatCompact(stats.promotedCount)} icon={<ShieldCheck className="h-4 w-4" />} />
          <Metric label="Verified teams" value={formatCompact(stats.verifiedCount)} icon={<CircleDollarSign className="h-4 w-4" />} />
        </div>
      </section>

      <section className="container-main py-10">
        <SectionHeading title="Today's Best" subtitle="Daily leaderboard ranked by 24h votes." action={<Link href="/today-best" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">View all <ArrowRight className="h-4 w-4" /></Link>} />
        <div className="grid gap-4 lg:grid-cols-3">{todaysBest.map((token, index) => <TokenCard key={token.id} token={token} rank={index + 1} />)}</div>
      </section>

      <section className="container-main py-10">
        <SectionHeading title="All-Time Best" subtitle="Projects with the strongest total score on Ton Gemz." action={<Link href="/all-time-best" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">View all <ArrowRight className="h-4 w-4" /></Link>} />
        <div className="grid gap-4 lg:grid-cols-3">{allTimeBest.map((token, index) => <TokenCard key={token.id} token={token} rank={index + 1} />)}</div>
      </section>

      <section className="container-main py-10">
        <SectionHeading title="New Listings" subtitle="Fresh approved TON launches, newest first." action={<Link href="/new-listings" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">View all <ArrowRight className="h-4 w-4" /></Link>} />
        <div className="grid gap-4 lg:grid-cols-3">{newListings.map((token) => <TokenCard key={token.id} token={token} />)}</div>
      </section>

      <section className="container-main py-10">
        <SectionHeading title="Verified Team" subtitle="Projects with a manually approved verified team badge." action={<Link href="/claim-project" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">Claim yours <ArrowRight className="h-4 w-4" /></Link>} />
        <div className="grid gap-4 lg:grid-cols-3">{verifiedTeam.map((token, index) => <TokenCard key={token.id} token={token} rank={index + 1} />)}</div>
      </section>
    </div>
  );
}

function Feature({ title, text, icon }: { title: string; text: string; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-stroke/70 bg-card/70 p-4"><div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-200">{icon}</div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-slate-400">{text}</p></div>;
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="panel p-5"><div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-200">{icon}</div><div className="text-sm text-slate-400">{label}</div><div className="mt-2 text-2xl font-semibold text-white">{value}</div></div>;
}
