import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { storageBucket, supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const PAYMENT_WALLET = process.env.NEXT_PUBLIC_PAYMENT_WALLET || 'UQDQ-Bp7EiOZevivYISInOTR2wZnwxowRMm-1QJFQGYCutEa';

export async function POST(request: Request) {
  const form = await request.formData();
  const logo = form.get('logo');
  const listingTier = String(form.get('listing_tier') || 'free') as 'free' | 'fast';
  const paymentReference = `TH-${randomUUID().slice(0, 8).toUpperCase()}`;

  let logoPath = '/placeholder-token.png';
  if (logo instanceof File && supabaseAdmin) {
    try {
      const ext = (logo.name.split('.').pop() || 'png').toLowerCase();
      const fileName = `${Date.now()}-${randomUUID()}.${ext}`;
      const arrayBuffer = await logo.arrayBuffer();
      const { error } = await supabaseAdmin.storage.from(storageBucket).upload(fileName, Buffer.from(arrayBuffer), {
        contentType: logo.type || 'image/png',
        upsert: false,
      });
      if (!error) logoPath = fileName;
    } catch {
      logoPath = '/placeholder-token.png';
    }
  }

  const payload = {
    name: String(form.get('name') || ''),
    symbol: String(form.get('symbol') || ''),
    address: String(form.get('address') || ''),
    logo_url: logoPath,
    website: String(form.get('website') || ''),
    telegram: String(form.get('telegram') || ''),
    twitter: String(form.get('twitter') || ''),
    description: String(form.get('description') || ''),
    listed_at: new Date().toISOString(),
    promoted: false,
    votes_24h: 0,
    votes_all_time: 0,
    listing_tier: listingTier,
    status: 'pending',
    payment_reference: paymentReference,
  };

  if (supabaseAdmin) {
    await supabaseAdmin.from('tokens').insert(payload);
  }

  const redirectUrl = new URL('/submit/success', request.url);
  redirectUrl.searchParams.set('tier', listingTier);
  redirectUrl.searchParams.set('ref', paymentReference);
  redirectUrl.searchParams.set('wallet', PAYMENT_WALLET);
  redirectUrl.searchParams.set('address', payload.address);
  return NextResponse.redirect(redirectUrl, 303);
}
