import { TokenCard } from '@/components/token-card';
import { SectionHeading } from '@/components/section-heading';
import { getTokens } from '@/lib/ton';
export const dynamic = 'force-dynamic';
export default async function Page(){ const tokens = (await getTokens()).sort((a,b)=>(b.votes_24h||0)-(a.votes_24h||0)); return <section className="container-main py-12"><SectionHeading title="Today's Best" subtitle="Daily ranking powered by 24-hour votes." /><div className="grid gap-4 lg:grid-cols-3">{tokens.map((t,i)=><TokenCard key={t.id} token={t} rank={i+1} />)}</div></section> }
