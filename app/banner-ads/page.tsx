import Link from 'next/link';
import { Gem, Megaphone, Sparkles } from 'lucide-react';

const plans = [
  { title: '1 day banner', price: '8 TON', note: 'Top header banner placement for 24 hours.' },
  { title: '3 day banner', price: '20 TON', note: 'Extended premium visibility on the header banner slot.' },
  { title: '7 day banner', price: '42 TON', note: 'Full-week premium banner exposure with priority display.' },
];

export default function BannerAdsPage() {
  return (
    <section className="container-main py-14">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
        <div className="card p-7">
          <div className="mb-4 inline-flex rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-fuchsia-200">
            Header banner ads
          </div>
          <h1 className="text-4xl font-bold text-white">Book a premium banner slot</h1>
          <p className="mt-4 text-slate-300">
            Put your project directly inside the Ton Gemz header banner area and drive instant visibility to your token, portal, or campaign.
          </p>
          <div className="mt-8 space-y-4">
            <Benefit icon={<Megaphone className="h-5 w-5" />} title="Top-of-site exposure" text="Visible before users even reach the listings board." />
            <Benefit icon={<Sparkles className="h-5 w-5" />} title="Premium neon placement" text="Styled for a clean premium layout built for TON launches." />
            <Benefit icon={<Gem className="h-5 w-5" />} title="Fits launches and boosts" text="Use it for launches, event pushes, portal links, and ecosystem visibility." />
          </div>
        </div>

        <div className="card p-7">
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.title} className="rounded-[24px] border border-stroke/70 bg-slate-950/35 p-5">
                <div className="text-lg font-semibold text-white">{plan.title}</div>
                <div className="mt-2 text-2xl font-bold text-cyan-300">{plan.price}</div>
                <p className="mt-3 text-sm text-slate-400">{plan.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 rounded-[28px] border border-fuchsia-400/20 bg-gradient-to-r from-fuchsia-500/10 via-violet-500/10 to-cyan-400/10 p-6">
            <div className="text-sm uppercase tracking-[0.24em] text-slate-400">How to book</div>
            <p className="mt-3 text-slate-200">
              Submit your project first, then contact support with your banner creative and preferred duration. Banner ad approval is handled by the owner after payment confirmation.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="https://t.me/DevAtSpyTON" className="rounded-full bg-white px-5 py-3 font-medium text-slate-950">Contact support</a>
              <Link href="/submit" className="rounded-full border border-cyan-400/35 px-5 py-3 font-medium text-cyan-200">Submit project first</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Benefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[22px] border border-stroke/70 bg-slate-950/30 p-4">
      <div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-200">{icon}</div>
      <div className="font-semibold text-white">{title}</div>
      <p className="mt-1 text-sm text-slate-400">{text}</p>
    </div>
  );
}
