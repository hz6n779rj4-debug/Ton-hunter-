import { randomUUID } from 'crypto';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const VOTE_COOKIE = 'tongemz_voter';
const COOLDOWN_HOURS = 24;

function cutoffIso() {
  return new Date(Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000).toISOString();
}

export async function POST(request: Request) {
  const form = await request.formData();
  const address = String(form.get('address') || '').trim();
  const redirectUrl = new URL(`/token/${address}`, request.url);
  if (!address || !supabaseAdmin) {
    redirectUrl.searchParams.set('vote', 'error');
    return NextResponse.redirect(redirectUrl, 303);
  }

  const cookieStore = await cookies();
  let voterKey = cookieStore.get(VOTE_COOKIE)?.value || '';
  if (!voterKey) {
    const headerStore = await headers();
    const forwarded = headerStore.get('x-forwarded-for') || '';
    const userAgent = headerStore.get('user-agent') || 'browser';
    voterKey = `${forwarded.split(',')[0] || 'anon'}:${userAgent.slice(0, 80)}:${randomUUID().slice(0, 8)}`;
  }

  const { data: existingVote } = await supabaseAdmin
    .from('vote_logs')
    .select('created_at')
    .eq('token_address', address)
    .eq('voter_key', voterKey)
    .gte('created_at', cutoffIso())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingVote?.created_at) {
    const nextVoteAt = new Date(new Date(existingVote.created_at).getTime() + COOLDOWN_HOURS * 60 * 60 * 1000).toISOString();
    redirectUrl.searchParams.set('vote', 'cooldown');
    redirectUrl.searchParams.set('next', nextVoteAt);
    const response = NextResponse.redirect(redirectUrl, 303);
    response.cookies.set(VOTE_COOKIE, voterKey, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  const { data, error } = await supabaseAdmin.from('tokens').select('votes_24h,votes_all_time').eq('address', address).single();
  if (error || !data) {
    redirectUrl.searchParams.set('vote', 'error');
    return NextResponse.redirect(redirectUrl, 303);
  }

  const { error: updateError } = await supabaseAdmin
    .from('tokens')
    .update({ votes_24h: Number(data.votes_24h || 0) + 1, votes_all_time: Number(data.votes_all_time || 0) + 1 })
    .eq('address', address);

  if (updateError) {
    redirectUrl.searchParams.set('vote', 'error');
    return NextResponse.redirect(redirectUrl, 303);
  }

  await supabaseAdmin.from('vote_logs').insert({ token_address: address, voter_key: voterKey, source: 'site' });
  redirectUrl.searchParams.set('vote', 'success');
  const response = NextResponse.redirect(redirectUrl, 303);
  response.cookies.set(VOTE_COOKIE, voterKey, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 365 });
  return response;
}
