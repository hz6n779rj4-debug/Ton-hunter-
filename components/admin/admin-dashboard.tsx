'use client';
import { useMemo, useState } from 'react';
import { ListedToken } from '@/lib/types';
import { formatCompact, shortAddress } from '@/lib/utils';

export function AdminDashboard({ tokens, error }: { tokens: ListedToken[]; error?: string }) {
  const [secret, setSecret] = useState('');
  const [tab, setTab] = useState<'pending'|'approved'|'rejected'|'pending_payment'|'all'>('pending');
  const filtered = useMemo(() => tokens.filter((token) => tab === 'all' ? true : (token.status || 'approved') === tab), [tokens, tab]);
  const counts = useMemo(() => ({
    pending: tokens.filter((t)=>t.status === 'pending').length,
    pendingPayment: tokens.filter((t)=>t.status === 'pending_payment').length,
    approved: tokens.filter((t)=>t.status === 'approved').length,
    rejected: tokens.filter((t)=>t.status === 'rejected').length,
    fast: tokens.filter((t)=>t.listing_tier === 'fast').length,
  }), [tokens]);

  return <>
    <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="card p-5">
        <h2 className="text-xl font-semibold text-white">Owner approval control</h2>
        <p className="mt-2 text-sm text-slate-400">Approve free listings, reject spam, or promote a coin manually. Fast listings are now auto-approved only after payment verification.</p>
        <input value={secret} onChange={(e)=>setSecret(e.target.value)} type="password" placeholder="Enter ADMIN_SECRET" className="mt-4 w-full rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 outline-none focus:border-cyan-400/50" />
        {error === 'invalid-secret' ? <p className="mt-3 text-sm text-rose-300">Wrong admin secret.</p> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Mini label="Pending" value={counts.pending} />
        <Mini label="Pending payment" value={counts.pendingPayment} />
        <Mini label="Approved" value={counts.approved} />
        <Mini label="Rejected" value={counts.rejected} />
      </div>
    </div>

    <div className="mb-5 flex flex-wrap gap-2">
      <Tab label={`Pending (${counts.pending})`} active={tab==='pending'} onClick={()=>setTab('pending')} />
      <Tab label={`Payment (${counts.pendingPayment})`} active={tab==='pending_payment'} onClick={()=>setTab('pending_payment')} />
      <Tab label={`Approved (${counts.approved})`} active={tab==='approved'} onClick={()=>setTab('approved')} />
      <Tab label={`Rejected (${counts.rejected})`} active={tab==='rejected'} onClick={()=>setTab('rejected')} />
      <Tab label="All" active={tab==='all'} onClick={()=>setTab('all')} />
    </div>

    <div className="card overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-950/30 text-left text-slate-400">
          <tr>
            <th className="px-4 py-3">Token</th>
            <th className="px-4 py-3">Address</th>
            <th className="px-4 py-3">Tier</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">24h Votes</th>
            <th className="px-4 py-3">Promoted</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((token)=><tr key={token.id} className="border-t border-stroke/70 align-top">
            <td className="px-4 py-4 font-medium text-white">{token.name}<div className="text-slate-500">${token.symbol}</div></td>
            <td className="px-4 py-4 text-slate-400">{shortAddress(token.address)}</td>
            <td className="px-4 py-4 capitalize">{token.listing_tier || 'free'}</td>
            <td className="px-4 py-4 capitalize">{(token.status || 'approved').replace('_', ' ')}</td>
            <td className="px-4 py-4">{formatCompact(token.votes_24h)}</td>
            <td className="px-4 py-4">{token.promoted?'Yes':'No'}</td>
            <td className="px-4 py-4">
              <div className="flex flex-wrap gap-2">
                {(token.status || 'approved') !== 'approved' ? <AdminButton address={token.address} action="approve" secret={secret} label="Approve" /> : null}
                {(token.status || 'approved') !== 'rejected' ? <AdminButton address={token.address} action="reject" secret={secret} label="Reject" /> : null}
                <AdminButton address={token.address} action="promote" secret={secret} label={token.promoted ? 'Unpromote' : 'Promote'} />
              </div>
              {token.payment_tx_hash ? <div className="mt-2 max-w-[260px] truncate text-xs text-slate-500">TX: {token.payment_tx_hash}</div> : null}
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </>;
}

function AdminButton({ address, action, secret, label }: { address: string; action: string; secret: string; label: string }) {
  return <form action="/api/admin" method="post">
    <input type="hidden" name="address" value={address} />
    <input type="hidden" name="action" value={action} />
    <input type="hidden" name="secret" value={secret} />
    <button className="rounded-full border border-stroke px-3 py-2 text-xs hover:border-cyan-400/40">{label}</button>
  </form>;
}

function Mini({ label, value }: { label: string; value: number }) {
  return <div className="panel px-4 py-3"><div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div><div className="mt-2 text-xl font-semibold text-white">{value}</div></div>;
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`rounded-full border px-4 py-2 text-sm transition ${active?'border-cyan-400/40 bg-cyan-400/10 text-cyan-200':'border-stroke bg-card text-slate-300 hover:text-white'}`}>{label}</button>;
}
