import { NextResponse } from 'next/server';
import { activatePromotion, approveFastListing, verifyFastListingPayment, verifyPromotionPayment } from '@/lib/payments';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const mode = String(form.get('mode') || 'fast');
    const address = String(form.get('address') || '');
    const reference = String(form.get('reference') || '');
    const days = Number(form.get('days') || 1);
    const amount = days === 7 ? 25 : days === 3 ? 12 : 5;
    const wallet = process.env.NEXT_PUBLIC_PAYMENT_WALLET || '';

    if (!address || !reference) {
      return NextResponse.redirect(new URL('/submit?error=missing-payment-data', request.url), 303);
    }

    if (mode === 'promote') {
      const verified = await verifyPromotionPayment(reference, days);
      const redirectUrl = new URL('/promote/success', request.url);
      redirectUrl.searchParams.set('address', address);
      redirectUrl.searchParams.set('days', String(days));
      redirectUrl.searchParams.set('amount', String(amount));
      redirectUrl.searchParams.set('ref', reference);
      redirectUrl.searchParams.set('wallet', wallet);

      if (verified.ok) {
        await activatePromotion(address, days);
        redirectUrl.searchParams.set('verified', '1');
      } else {
        redirectUrl.searchParams.set('error', 'not-found');
      }

      return NextResponse.redirect(redirectUrl, 303);
    }

    const redirectUrl = new URL('/submit/success', request.url);
    redirectUrl.searchParams.set('tier', 'fast');
    redirectUrl.searchParams.set('ref', reference);
    redirectUrl.searchParams.set('wallet', wallet);
    redirectUrl.searchParams.set('address', address);

    const verified = await verifyFastListingPayment(reference);
    if (verified.ok) {
      await approveFastListing(address);
      redirectUrl.searchParams.set('verified', '1');
    } else {
      redirectUrl.searchParams.set('error', 'not-found');
    }

    return NextResponse.redirect(redirectUrl, 303);
  } catch {
    return NextResponse.redirect(new URL('/submit/success', request.url), 303);
  }
}
