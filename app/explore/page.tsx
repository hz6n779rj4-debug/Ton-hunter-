import Link from 'next/link';
import { SectionHeading } from '@/components/section-heading';
import { TokenCard } from '@/components/token-card';
import { getTokens } from '@/lib/ton';

type ExploreProps = { searchParams?: Promise<{ sort?: string }> };

export default async function ExplorePage({ searchParams }: ExploreProps) {
  const params = (await searchParams) || {};
  const sort = params.sort || 'votes';
  const tokens = await getTokens();
  const sorted = [...tokens].sort((a, b) => {
    if (sort === 'gainers') return (b.change_24h_percent || 0) - (a.change_24h_percent || 0);
    if (sort === 'votes24h') return (b.votes_24h || 0) - (a.votes_24h || 0);
    if (sort === 'latest') return new Date(b.listed_at).getTime() - new Date(a.listed_at).getTime();
    return (b.votes_all_time || 0) - (a.votes_all_time || 0);
  });

  return (
    <section className="container-main py-14">
      <SectionHeading
        title="Explore Coins"
        subtitle="Browse TON listings by all-time votes, 24h votes, gainers, or recent submissions."
        action={
          <div className="flex flex-wrap gap-2 text-sm">
            <Filter href="/explore" active={sort === 'votes'} label="Top voted" />
            <Filter href="/explore?sort=votes24h" active={sort === 'votes24h'} label="Top upvoted 24H" />
            <Filter href="/explore?sort=gainers" active={sort === 'gainers'} label="Top gainers 24H" />
            <Filter href="/explore?sort=latest" active={sort === 'latest'} label="Recently added" />
          </div>
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Sorting</div><div className="mt-2 font-semibold text-white">{labelForSort(sort)}</div></div>
        <div className="panel p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Chain</div><div className="mt-2 font-semibold text-white">TON only</div></div>
        <div className="panel p-4"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">Listing flow</div><div className="mt-2 font-semibold text-white">Submit → Review → Go live</div></div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">{sorted.map((token, index) => <TokenCard key={token.id} token={token} rank={index + 1} />)}</div>
    </section>
  );
}

function Filter({ href, label, active }: { href: string; label: string; active: boolean }) {
  return <Link href={href} className={`rounded-full border px-4 py-2 transition ${active ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200' : 'border-stroke bg-card text-slate-300 hover:text-white'}`}>{label}</Link>;
}

function labelForSort(sort: string) {
  if (sort === 'gainers') return 'Top Gainers 24H';
  if (sort === 'votes24h') return 'Top Upvoted 24H';
  if (sort === 'latest') return 'Recently Added';
  return 'All-Time Top Voted';
}
