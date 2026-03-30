import Link from 'next/link';
import { SectionHeading } from '@/components/section-heading';
import { TokenCard } from '@/components/token-card';
import { getTokenScore, getTokens } from '@/lib/ton';

type ExploreProps = { searchParams?: Promise<{ sort?: string; q?: string; category?: string; verified?: string }> };

export default async function ExplorePage({ searchParams }: ExploreProps) {
  const params = (await searchParams) || {};
  const sort = params.sort || 'alltime';
  const q = (params.q || '').toLowerCase().trim();
  const category = params.category || '';
  const verified = params.verified === '1';
  const tokens = await getTokens();
  const filtered = tokens.filter((token) => {
    const matchesQ = q ? [token.name, token.symbol, token.address].some((value) => value?.toLowerCase().includes(q)) : true;
    const matchesCategory = category ? token.category === category : true;
    const matchesVerified = verified ? token.verified_team : true;
    return matchesQ && matchesCategory && matchesVerified;
  });
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'today') return (b.votes_24h || 0) - (a.votes_24h || 0);
    if (sort === 'new') return new Date(b.listed_at).getTime() - new Date(a.listed_at).getTime();
    return getTokenScore(b) - getTokenScore(a);
  });

  return (
    <section className="container-main py-12">
      <SectionHeading title="Explore KYRON" subtitle="Browse today's best, all-time leaders, new listings, and featured projects." />
      <div className="mb-6 flex flex-wrap gap-3">
        <Filter href="/explore?sort=today" label="Today's Best" active={sort === 'today'} />
        <Filter href="/explore?sort=alltime" label="All-Time Best" active={sort === 'alltime'} />
        <Filter href="/explore?sort=new" label="New Listings" active={sort === 'new'} />
        <Filter href="/explore?category=Meme" label="Meme" active={category === 'Meme'} />
        <Filter href="/explore?category=New%20Launches" label="New Launches" active={category === 'New Launches'} />
        <Filter href="/explore?verified=1" label="Verified Team" active={verified} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">{sorted.map((token, index) => <TokenCard key={token.id} token={token} rank={index + 1} />)}</div>
    </section>
  );
}

function Filter({ href, label, active }: { href: string; label: string; active: boolean }) {
  return <Link href={href} className={`rounded-full border px-4 py-2 transition ${active ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200' : 'border-stroke bg-card text-slate-300 hover:text-white'}`}>{label}</Link>;
}
