import { TokenCard } from '@/components/token-card';
import { SectionHeading } from '@/components/section-heading';
import { getTokens } from '@/lib/ton';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const tokens = (await getTokens())
    .filter((token) => Number(token.change_24h_percent || 0) > 0)
    .sort((a, b) => {
      const changeDiff = Number(b.change_24h_percent || 0) - Number(a.change_24h_percent || 0);
      if (changeDiff !== 0) return changeDiff;
      return Number(b.volume_24h_usd || 0) - Number(a.volume_24h_usd || 0);
    });

  return (
    <section className="container-main py-12">
      <SectionHeading
        title="Top Gainers"
        subtitle="Sorted by strongest positive change, with volume supporting the rank."
      />
      {tokens.length ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {tokens.map((t, i) => (
            <TokenCard key={t.id} token={t} rank={i + 1} />
          ))}
        </div>
      ) : (
        <div className="card p-6 text-slate-300">No gainers available right now.</div>
      )}
    </section>
  );
}
