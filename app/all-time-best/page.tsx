import { TokenCard } from '@/components/token-card';
import { SectionHeading } from '@/components/section-heading';
import { getTokenScore, getTokens } from '@/lib/ton';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const tokens = (await getTokens()).sort((a, b) => getTokenScore(b) - getTokenScore(a));

  return (
    <section className="container-main py-12">
      <SectionHeading title="All-Time Best" subtitle="Long-term leaderboard ranked by total score." />
      {tokens.length ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {tokens.map((t, i) => (
            <TokenCard key={t.id} token={t} rank={i + 1} />
          ))}
        </div>
      ) : (
        <div className="card p-6 text-slate-300">No all-time tokens available right now.</div>
      )}
    </section>
  );
}
