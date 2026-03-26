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
  if (!supabaseAdmin || !id) {
    redirectUrl.searchParams.set('error', 'Missing banner ad id or database access.');
    return NextResponse.redirect(redirectUrl, 303);
  }

  const { data, error } = await supabaseAdmin.from('banner_ads').select('is_active').eq('id', id).single();
  if (error) {
    redirectUrl.searchParams.set('error', error.message);
    return NextResponse.redirect(redirectUrl, 303);
  }

  const { error: updateError } = await supabaseAdmin.from('banner_ads').update({ is_active: !data?.is_active }).eq('id', id);
  if (updateError) redirectUrl.searchParams.set('error', updateError.message);
  else redirectUrl.searchParams.set('message', `Banner turned ${data?.is_active ? 'off' : 'on'}.`);
  return NextResponse.redirect(redirectUrl, 303);
}
