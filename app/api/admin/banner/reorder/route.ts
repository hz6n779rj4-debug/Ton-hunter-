import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminCookieName, getAdminSecret } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const redirectUrl = new URL('/admin/panel', request.url);
  const secret = getAdminSecret();
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value || '';
  if (!secret || token !== secret) {
    redirectUrl.searchParams.set('error', 'Unauthorized');
    return NextResponse.redirect(redirectUrl, 303);
  }

  const form = await request.formData();
  const id = String(form.get('id') || '');
  const direction = String(form.get('direction') || '');
  if (!supabaseAdmin || !id || !['up', 'down'].includes(direction)) {
    redirectUrl.searchParams.set('error', 'Missing reorder data or database access.');
    return NextResponse.redirect(redirectUrl, 303);
  }

  const { data: allBanners, error } = await supabaseAdmin
    .from('banner_ads')
    .select('id, display_order')
    .order('display_order', { ascending: true });

  if (error || !allBanners) {
    redirectUrl.searchParams.set('error', error?.message || 'Unable to load banner queue.');
    return NextResponse.redirect(redirectUrl, 303);
  }

  const index = allBanners.findIndex((item) => item.id === id);
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || swapIndex < 0 || swapIndex >= allBanners.length) {
    redirectUrl.searchParams.set('message', 'Banner order already at the edge.');
    return NextResponse.redirect(redirectUrl, 303);
  }

  const current = allBanners[index];
  const swap = allBanners[swapIndex];
  const { error: currentError } = await supabaseAdmin.from('banner_ads').update({ display_order: swap.display_order }).eq('id', current.id);
  const { error: swapError } = await supabaseAdmin.from('banner_ads').update({ display_order: current.display_order }).eq('id', swap.id);

  if (currentError || swapError) {
    redirectUrl.searchParams.set('error', currentError?.message || swapError?.message || 'Unable to reorder banner.');
  } else {
    redirectUrl.searchParams.set('message', `Banner moved ${direction}.`);
  }
  return NextResponse.redirect(redirectUrl, 303);
}
