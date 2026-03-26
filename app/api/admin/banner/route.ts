import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminCookieName, getAdminSecret } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { uploadBannerImage } from '@/lib/banner-ads';

export const runtime = 'nodejs';

async function ensureAdmin(request: Request) {
  const redirectUrl = new URL('/admin/panel', request.url);
  const secret = getAdminSecret();
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value || '';
  if (!secret || token !== secret) {
    redirectUrl.searchParams.set('error', 'Unauthorized');
    return { ok: false as const, redirectUrl };
  }
  return { ok: true as const, redirectUrl };
}

export async function POST(request: Request) {
  const auth = await ensureAdmin(request);
  if (!auth.ok) return NextResponse.redirect(auth.redirectUrl, 303);

  const redirectUrl = auth.redirectUrl;
  const form = await request.formData();
  const action = String(form.get('action') || 'create').trim();

  if (!supabaseAdmin) {
    redirectUrl.searchParams.set('error', 'Missing Supabase admin access for banner ads.');
    return NextResponse.redirect(redirectUrl, 303);
  }

  try {
    if (action === 'create') {
      const title = String(form.get('title') || '').trim();
      const target_url = String(form.get('target_url') || '').trim();
      const starts_at = String(form.get('starts_at') || '').trim();
      const ends_at = String(form.get('ends_at') || '').trim();
      const image = form.get('image');

      if (!title || !target_url || !starts_at || !ends_at || !(image instanceof File)) {
        redirectUrl.searchParams.set('error', 'Fill all banner fields before publishing.');
        return NextResponse.redirect(redirectUrl, 303);
      }

      const { data: lastBanner } = await supabaseAdmin
        .from('banner_ads')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle();

      const imagePath = await uploadBannerImage(image);
      const nextOrder = Number(lastBanner?.display_order || 0) + 1;

      const { error } = await supabaseAdmin.from('banner_ads').insert({
        title,
        image_url: imagePath,
        target_url,
        starts_at: new Date(starts_at).toISOString(),
        ends_at: new Date(ends_at).toISOString(),
        is_active: true,
        display_order: nextOrder,
      });

      if (error) {
        redirectUrl.searchParams.set('error', error.message);
        return NextResponse.redirect(redirectUrl, 303);
      }

      redirectUrl.searchParams.set('message', 'Banner ad published.');
      return NextResponse.redirect(redirectUrl, 303);
    }

    const id = String(form.get('id') || '').trim();
    if (!id) {
      redirectUrl.searchParams.set('error', 'Missing banner ad id.');
      return NextResponse.redirect(redirectUrl, 303);
    }

    if (action === 'toggle') {
      const { data, error } = await supabaseAdmin.from('banner_ads').select('is_active').eq('id', id).single();
      if (error) {
        redirectUrl.searchParams.set('error', error.message);
        return NextResponse.redirect(redirectUrl, 303);
      }

      const { error: updateError } = await supabaseAdmin
        .from('banner_ads')
        .update({ is_active: !data?.is_active })
        .eq('id', id);

      if (updateError) redirectUrl.searchParams.set('error', updateError.message);
      else redirectUrl.searchParams.set('message', `Banner turned ${data?.is_active ? 'off' : 'on'}.`);
      return NextResponse.redirect(redirectUrl, 303);
    }

    if (action === 'reorder') {
      const direction = String(form.get('direction') || '').trim();
      if (!['up', 'down'].includes(direction)) {
        redirectUrl.searchParams.set('error', 'Missing reorder direction.');
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
      const { error: currentError } = await supabaseAdmin
        .from('banner_ads')
        .update({ display_order: swap.display_order })
        .eq('id', current.id);
      const { error: swapError } = await supabaseAdmin
        .from('banner_ads')
        .update({ display_order: current.display_order })
        .eq('id', swap.id);

      if (currentError || swapError) {
        redirectUrl.searchParams.set('error', currentError?.message || swapError?.message || 'Unable to reorder banner.');
      } else {
        redirectUrl.searchParams.set('message', `Banner moved ${direction}.`);
      }
      return NextResponse.redirect(redirectUrl, 303);
    }

    if (action === 'delete') {
      const { error } = await supabaseAdmin.from('banner_ads').delete().eq('id', id);
      if (error) redirectUrl.searchParams.set('error', error.message);
      else redirectUrl.searchParams.set('message', 'Banner deleted.');
      return NextResponse.redirect(redirectUrl, 303);
    }

    redirectUrl.searchParams.set('error', 'Unknown banner action.');
    return NextResponse.redirect(redirectUrl, 303);
  } catch (error) {
    redirectUrl.searchParams.set('error', error instanceof Error ? error.message : 'Banner action failed.');
    return NextResponse.redirect(redirectUrl, 303);
  }
}
