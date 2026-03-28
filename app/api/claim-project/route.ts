// @ts-nocheck
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const form = await request.formData();
  const token_address = String(form.get('token_address') || '').trim();
  const username = String(form.get('username') || '').trim();
  const proof = String(form.get('proof') || '').trim();
  const redirectUrl = new URL('/claim-project', request.url);
  if (!supabaseAdmin || !token_address || !proof) {
    redirectUrl.searchParams.set('error', 'Missing claim details.');
    return NextResponse.redirect(redirectUrl, 303);
  }
  const { error } = await supabaseAdmin.from('claim_requests').insert({ token_address, username, proof, status: 'pending' });
  redirectUrl.searchParams.set(error ? 'error' : 'message', error?.message || 'Claim request submitted.');
  return NextResponse.redirect(redirectUrl, 303);
}
