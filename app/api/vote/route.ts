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

function redirectWithReason(request: Request, address: string, reason: string) {
  const url = new URL(`/token/${encodeURIComponent(address)}`, request.url);
  url.searchParams.set('vote', 'error');
  url.searchParams.set('reason', reason);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const tokenId = String(form.get('tokenId') || '').trim();

  if (!tokenId) {
    const fallback = String(form.get('address') || 'unknown').trim() || 'unknown';
    return redirectWithReason(request, fallback, 'missing_token_id');
  }

  if (!supabaseAdmin) {
    return redirectWithReason(request, 'unknown', 'missing_service_role');
  }

  const cookieStore = await cookies();
  let voterKey = cookieStore.get(VOTE_COOKIE)?.value || '';

  if (!voterKey) {
    const headerStore = await headers();
    const forwarded = headerStore.get('x-forwarded-for') || '';
    const userAgent = headerStore.get('user-agent') || 'browser';
    const ip = forwarded.split(',')[0]?.trim() || 'anon';
    voterKey = `${ip}:${userAgent.slice(0, 80)}:${randomUUID().slice(0, 8)}`;
  }

  const { data: token, error: tokenError } = await supabaseAdmin
    .from('tokens')
    .select('id,address,votes_24h,votes_all_time')
    .eq('id', tokenId)
    .maybeSingle();

  if (tokenError || !token) {
    return redirectWithReason(request, 'unknown', 'token_not_found');
  }

  const { data: existingVote, error: existingVoteError } = await supabaseAdmin
    .from('vote_logs')
    .select('created_at')
    .eq('token_address', token.address)
    .eq('voter_key', voterKey)
    .gte('created_at', cutoffIso())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingVoteError) {
    return redirectWithReason(request, token.address, 'vote_log_read_failed');
  }

  if (existingVote?.created_at) {
    const nextVoteAt = new Date(
      new Date(existingVote.created_at).getTime() + COOLDOWN_HOURS * 60 * 60 * 1000
    ).toISOString();

    const url = new URL(`/token/${encodeURIComponent(token.address)}`, request.url);
    url.searchParams.set('vote', 'cooldown');
    url.searchParams.set('next', nextVoteAt);

    const response = NextResponse.redirect(url, 303);
    response.cookies.set(VOTE_COOKIE, voterKey, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  const { error: updateError } = await supabaseAdmin
    .from('tokens')
    .update({
      votes_24h: Number(token.votes_24h || 0) + 1,
      votes_all_time: Number(token.votes_all_time || 0) + 1,
    })
    .eq('id', token.id);

  if (updateError) {
    return redirectWithReason(request, token.address, 'token_update_failed');
  }

  const { error: insertError } = await supabaseAdmin
    .from('vote_logs')
    .insert({
      token_address: token.address,
      voter_key: voterKey,
      source: 'site',
    });

  if (insertError) {
    return redirectWithReason(request, token.address, 'vote_log_insert_failed');
  }

  const url = new URL(`/token/${encodeURIComponent(token.address)}`, request.url);
  url.searchParams.set('vote', 'success');

  const response = NextResponse.redirect(url, 303);
  response.cookies.set(VOTE_COOKIE, voterKey, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
