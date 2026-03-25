import Link from 'next/link';
import { BarChart3, Megaphone, Rocket, ShieldCheck, TrendingUp } from 'lucide-react';
import { SectionHeading } from '@/components/section-heading';
import { TokenCard } from '@/components/token-card';
import { getHomepageData } from '@/lib/ton';
import { formatCompact, formatUsd } from '@/lib/utils';

export default async function HomePage() {
  const { promoted, top24h, topGainers, latest, stats } = await getHomepageData();

  return (
    <section className="container-main py-12">
      <div className="rounded-[2rem] border border-cyan-400/20 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),transparent_45%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] p-8 shadow-[0_0_120px_rgba(34,211,238,0.06)] md:p-12">
        <div className="max-w-4xl">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-100">SpyTON-owned TON launch board</div>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-white md:text-6xl">Discover, review, and boost the next TON gem.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">Tonhunters is the TON-native discovery board from SpyTON. Free listings go under review, fast listings go live after 10 TON payment verification, and paid promotions push projects into the featured board for fixed durations.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/explore" className="rounded-full bg-white px-6 py-3 font-medium text-slate-950">Explore Coins</Link>
            <Link href="/submit" className="rounded-full border border-cyan-400/35 bg-cyan-400/10 px-6 py-3 font-medium text-cyan-100">Submit your token</Link>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Feature icon={<BarChart3 className="h-5 w-5" />} title="Top voted" text="24h and all-time TON community leaderboards." />
        <Feature icon={<Megaphone className="h-5 w-5" />} title="Promoted coins" text="Featured placements with 1, 3, and 7 day TON payment options." />
        <Feature icon={<TrendingUp className="h-5 w-5" />} title="24h gainers" text="Live movers from TON market data when available." />
        <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Review tools" text="Free listings stay pending until you approve them in the owner panel." />
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tokens listed" value={formatCompact(stats.totalTokens)} />
        <StatCard label="24h votes" value={formatCompact(stats.totalVotes24h)} />
        <StatCard label="Promoted now" value={formatCompact(stats.promotedCount)} />
        <StatCard label="Tracked market cap" value={formatUsd(stats.totalMarketCap)} />
      </div>

      <div className="mt-12">
        <SectionHeading eyebrow="Featured board" title="Promoted Coins" subtitle="Boost a live TON token into the homepage board after payment verification." action={<Link href="/submit" className="text-sm text-cyan-200 hover:text-white">Boost yours</Link>} />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">{promoted.map((token) => <TokenCard key={token.address} token={token} />)}</div>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Top 24h" title="Most voted today" />
          <div className="mt-6 grid gap-5">{top24h.map((token) => <TokenCard key={token.address} token={token} compact />)}</div>
        </div>
        <div>
          <SectionHeading eyebrow="Momentum" title="24h gainers" />
          <div className="mt-6 grid gap-5">{topGainers.map((token) => <TokenCard key={token.address} token={token} compact />)}</div>
        </div>
      </div>

      <div className="mt-14">
        <SectionHeading eyebrow="Listing flow" title="Submit → Review → Go live" subtitle="Free listing waits for owner approval. Fast listing and promotion activate after wallet payment is detected." action={<Link href="/admin" className="inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-white"><Rocket className="h-4 w-4" />Owner panel</Link>} />
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{latest.map((token) => <TokenCard key={token.address} token={token} />)}</div>
      </div>
    </section>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="card p-6"><div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-200">{icon}</div><h3 className="mt-6 text-2xl font-semibold text-white">{title}</h3><p className="mt-3 text-slate-400">{text}</p></div>;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return <div className="card p-6"><div className="text-sm uppercase tracking-[0.25em] text-slate-500">{label}</div><div className="mt-3 text-3xl font-bold text-white">{value}</div></div>;
}
