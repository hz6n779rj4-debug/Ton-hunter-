import Image from 'next/image';
import Link from 'next/link';
import type { TokenRecord } from '@/lib/types';

export function TokenCard({ token }: { token: TokenRecord }) {
  return (
    <div className="rounded-[28px] border border-cyan-400/20 bg-[#07142d] p-6 shadow-glow">
      <div className="flex items-start gap-4">
        <Image
          src={token.logo_url || '/project-placeholder.png'}
          alt={token.name}
          width={72}
          height={72}
          className="h-[72px] w-[72px] rounded-2xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="truncate text-2xl font-bold">{token.name}</h3>
            <span className="rounded-full border border-cyan-400/30 px-3 py-1 text-xs uppercase tracking-[0.3em] text-cyan-200">
              {token.listing_tier === 'fast' ? 'Fast listed' : 'Community listed'}
            </span>
          </div>
          <p className="mt-1 text-white/70">${token.ticker} • {token.address.slice(0, 6)}...{token.address.slice(-4)}</p>
          <p className="mt-4 text-white/80">{token.description || 'No description yet.'}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/70">
        {token.website ? <a href={token.website} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-3 py-2">Website</a> : null}
        {token.telegram ? <a href={token.telegram} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-3 py-2">Telegram</a> : null}
        {token.twitter ? <a href={token.twitter} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-3 py-2">Twitter</a> : null}
        <Link href={`/token/${encodeURIComponent(token.address)}`} className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-cyan-100">View listing</Link>
      </div>
    </div>
  );
}
