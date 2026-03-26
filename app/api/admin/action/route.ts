import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminCookieName, getAdminSecret } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const form = await request.formData();
  const action = String(form.get('action') || '');
  const address = String(form.get('address') || '');
  const redirectUrl = new URL('/admin', request.url);

  const secret = getAdminSecret();
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value || '';
  if (!secret || token !== secret) {
    redirectUrl.searchParams.set('error', 'Unauthorized');
    return NextResponse.redirect(redirectUrl, 303);
  }

  if (!supabaseAdmin || !address) {
    redirectUrl.searchParams.set('error', 'Missing admin database access or address.');
    return NextResponse.redirect(redirectUrl, 303);
  }

  if (action === 'approve') {
    const { error } = await supabaseAdmin.from('tokens').update({ status: 'approved' }).eq('address', address);
    if (error) redirectUrl.searchParams.set('error', error.message);
    return NextResponse.redirect(redirectUrl, 303);
  }

  if (action === 'reject') {
    const { error } = await supabaseAdmin.from('tokens').update({ status: 'rejected' }).eq('address', address);
    if (error) redirectUrl.searchParams.set('error', error.message);
    return NextResponse.redirect(redirectUrl, 303);
  }

  if (action === 'toggle-promote') {
    const { data, error } = await supabaseAdmin.from('tokens').select('promoted').eq('address', address).single();
    if (error) {
      redirectUrl.searchParams.set('error', error.message);
      return NextResponse.redirect(redirectUrl, 303);
    }
    const { error: updateError } = await supabaseAdmin.from('tokens').update({ promoted: !data?.promoted }).eq('address', address);
    if (updateError) redirectUrl.searchParams.set('error', updateError.message);
    return NextResponse.redirect(redirectUrl, 303);
  }

  redirectUrl.searchParams.set('error', 'Unknown action');
  return NextResponse.redirect(redirectUrl, 303);
}
