import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { PAYMENT_WALLET, createPaymentReference } from '@/lib/payment';

async function fileToDataUrl(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type || 'image/png'};base64,${buffer.toString('base64')}`;
}

async function uploadLogo(file: File) {
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'token-logos';
  if (!supabaseAdmin) return fileToDataUrl(file);

  const path = `logos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
  const upload = await supabaseAdmin.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type || 'image/png',
  });

  if (upload.error) {
    return fileToDataUrl(file);
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function POST(request:Request){
  const form=await request.formData();
  const listingTier = String(form.get('listing_tier') || 'free') === 'fast' ? 'fast' : 'free';
  const logoFile = form.get('logo_file');
  let logoUrl = String(form.get('logo_url') || '');
  if (logoFile instanceof File && logoFile.size > 0) {
    logoUrl = await uploadLogo(logoFile);
  }

  const address=String(form.get('address')||'');
  const isFast = listingTier === 'fast';
  const now = new Date().toISOString();
  const payload={
    name:String(form.get('name')||''),
    symbol:String(form.get('symbol')||'').replace(/^\$/,''),
    address,
    logo_url:logoUrl || '/tonhunters-logo.jpg',
    website:String(form.get('website')||''),
    telegram:String(form.get('telegram')||''),
    twitter:String(form.get('twitter')||''),
    description:String(form.get('description')||''),
    listed_at:now,
    promoted:false,
    status:isFast?'pending_payment':'pending',
    listing_tier:listingTier,
    approved_at:null,
    votes_24h:0,
    votes_all_time:0,
  };

  if(supabaseAdmin){
    await supabaseAdmin.from('tokens').upsert(payload, { onConflict: 'address' });
    if (isFast) {
      const reference = createPaymentReference('LST');
      await supabaseAdmin.from('payment_requests').insert({
        token_address: address,
        request_type: 'listing',
        status: 'pending',
        amount_ton: 10,
        payment_reference: reference,
        payment_wallet: PAYMENT_WALLET,
        created_at: now,
      });
      return NextResponse.redirect(new URL(`/pay/${reference}`,request.url));
    }
  }

  return NextResponse.redirect(new URL('/admin?tab=pending',request.url));
}
