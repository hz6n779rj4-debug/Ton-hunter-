import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { PAYMENT_WALLET, createPaymentReference } from '@/lib/payment';

const PRICES: Record<number, number> = { 1: 5, 3: 12, 7: 25 };

export async function POST(request: Request) {
  const form = await request.formData();
  const address = String(form.get('address') || '');
  const durationDays = Number(form.get('duration_days') || 1);
  const amountTon = PRICES[durationDays] || 5;

  if (!supabaseAdmin || !address) {
    return NextResponse.redirect(new URL(`/token/${address}`, request.url));
  }

  const reference = createPaymentReference('PRM');
  await supabaseAdmin.from('payment_requests').insert({
    token_address: address,
    request_type: 'promotion',
    status: 'pending',
    amount_ton: amountTon,
    duration_days: durationDays,
    payment_reference: reference,
    payment_wallet: PAYMENT_WALLET,
  });

  return NextResponse.redirect(new URL(`/pay/${reference}`, request.url));
}
