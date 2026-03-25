'use client';
import { useState } from 'react';

export function SubmitForm(){
  const [tier,setTier]=useState<'free'|'fast'>('free');
  const [preview,setPreview]=useState<string | null>(null);

  return <form action="/api/submit" method="post" encType="multipart/form-data" className="grid gap-4">
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Project name" name="name" placeholder="Resistance Dog" required />
      <Field label="Ticker" name="symbol" placeholder="REDO" required />
    </div>
    <Field label="Token address" name="address" placeholder="EQ..." required />
    <label className="grid gap-2 text-sm">
      <span className="text-slate-300">Project logo upload</span>
      <input name="logo_file" type="file" accept="image/*" required className="rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 outline-none focus:border-cyan-400/50 file:mr-3 file:rounded-full file:border-0 file:bg-cyan-400/15 file:px-3 file:py-2 file:text-cyan-200"
        onChange={(e)=>{
          const file=e.target.files?.[0];
          if(!file){setPreview(null);return;}
          setPreview(URL.createObjectURL(file));
        }} />
      <span className="text-xs text-slate-500">Upload the project logo directly from your device. No logo URL is needed.</span>
    </label>
    {preview ? <div className="panel flex items-center gap-4 p-4"><img src={preview} alt="Preview" className="h-16 w-16 rounded-2xl object-cover" /><div className="text-sm text-slate-300">Logo preview ready.</div></div> : null}
    <Field label="Website" name="website" placeholder="https://..." />
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Telegram" name="telegram" placeholder="https://t.me/..." />
      <Field label="X / Twitter" name="twitter" placeholder="https://x.com/..." />
    </div>
    <label className="grid gap-2 text-sm"><span className="text-slate-300">Description</span><textarea name="description" rows={6} required className="rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 outline-none focus:border-cyan-400/50" placeholder="Tell people why your TON project matters." /></label>
    <div className="grid gap-3 md:grid-cols-2">
      <label className={`panel cursor-pointer p-4 ${tier==='free'?'border-cyan-400/40':''}`}>
        <input type="radio" name="listing_tier" value="free" checked={tier==='free'} onChange={()=>setTier('free')} className="sr-only" />
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Free listing</div>
        <div className="mt-2 text-lg font-semibold text-white">Under review</div>
        <div className="mt-1 text-sm text-slate-400">Project goes into pending review and only appears after you approve it in the owner admin panel.</div>
      </label>
      <label className={`panel cursor-pointer p-4 ${tier==='fast'?'border-cyan-400/40':''}`}>
        <input type="radio" name="listing_tier" value="fast" checked={tier==='fast'} onChange={()=>setTier('fast')} className="sr-only" />
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Fast listing</div>
        <div className="mt-2 text-lg font-semibold text-white">10 TON auto-listing</div>
        <div className="mt-1 text-sm text-slate-400">Creates a payment page, opens your TON wallet, and auto-verifies the payment comment before the listing goes live.</div>
      </label>
    </div>
    <button className="mt-2 rounded-full bg-white px-5 py-3 font-medium text-slate-950">{tier==='fast'?'Continue to payment':'Submit listing for review'}</button>
  </form>;
}

function Field({label,name,placeholder,required=false}:{label:string;name:string;placeholder:string;required?:boolean}){return <label className="grid gap-2 text-sm"><span className="text-slate-300">{label}</span><input name={name} required={required} placeholder={placeholder} className="rounded-2xl border border-stroke bg-slate-950/30 px-4 py-3 outline-none focus:border-cyan-400/50" /></label>;}
