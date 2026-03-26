import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const PAYMENT_WALLET = process.env.NEXT_PUBLIC_PAYMENT_WALLET || 'UQDQ-Bp7EiOZevivYISInOTR2wZnwxowRMm-1QJFQGYCutEa';

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const address = String(form.get('address') || '');
    const days = Number(form.get('days') || 1);
    const amount = days === 7 ? 25 : days === 3 ? 12 : 5;
    const paymentReference = `TH-PROMO-${randomUUID().slice(0, 8).toUpperCase()}`;

    if (!address) {
      return NextResponse.redirect(new URL('/promote?error=missing-address', request.url), 303);
    }

    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('tokens')
        .update({ payment_reference: paymentReference, promotion_duration_days: days })
        .eq('address', address);

      if (error) {
        const redirectUrl = new URL('/promote/success', request.url);
        redirectUrl.searchParams.set('address', address);
        redirectUrl.searchParams.set('days', String(days));
        redirectUrl.searchParams.set('amount', String(amount));
        redirectUrl.searchParams.set('ref', paymentReference);
        redirectUrl.searchParams.set('wallet', PAYMENT_WALLET);
        redirectUrl.searchParams.set('error', error.message || 'save-failed');
        return NextResponse.redirect(redirectUrl, 303);
      }
    }

    const redirectUrl = new URL('/promote/success', request.url);
    redirectUrl.searchParams.set('address', address);
    redirectUrl.searchParams.set('days', String(days));
    redirectUrl.searchParams.set('amount', String(amount));
    redirectUrl.searchParams.set('ref', paymentReference);
    redirectUrl.searchParams.set('wallet', PAYMENT_WALLET);
    return NextResponse.redirect(redirectUrl, 303);
  } catch (error) {
    const redirectUrl = new URL('/promote/success', request.url);
    redirectUrl.searchParams.set('error', error instanceof Error ? error.message : 'unknown-error');
    return NextResponse.redirect(redirectUrl, 303);
  }
}
