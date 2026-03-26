import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { adminCookieName, getAdminSecret } from '@/lib/auth';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const secret = getAdminSecret();
  const token = cookieStore.get(adminCookieName())?.value || '';
  if (!secret || token !== secret) {
    const redirectUrl = new URL('/admin', request.url);
    redirectUrl.searchParams.set('error', 'Admin login required.');
    return NextResponse.redirect(redirectUrl);
  }

  const form = await request.formData();
  const address = String(form.get('address') || '');
  const action = String(form.get('action') || 'approve');

  if (supabaseAdmin && address) {
    if (action === 'approve') await supabaseAdmin.from('tokens').update({ status: 'approved' }).eq('address', address);
    if (action === 'reject') await supabaseAdmin.from('tokens').update({ status: 'rejected' }).eq('address', address);
  }

  return NextResponse.redirect(new URL('/admin', request.url));
}
