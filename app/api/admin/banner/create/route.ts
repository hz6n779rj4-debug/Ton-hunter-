import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminCookieName, getAdminSecret } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { uploadBannerImage } from '@/lib/banner-ads';

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

  if (!supabaseAdmin) {
    redirectUrl.searchParams.set('error', 'Missing Supabase admin access for banner ads.');
    return NextResponse.redirect(redirectUrl, 303);
  }

  try {
    const form = await request.formData();
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
  } catch (error) {
    redirectUrl.searchParams.set('error', error instanceof Error ? error.message : 'Failed to publish banner ad.');
    return NextResponse.redirect(redirectUrl, 303);
  }
}
