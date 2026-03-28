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
  const rawAddress = String(form.get('address') || '').trim();
  const decodedAddress = decodeURIComponent(rawAddress || '').trim();
  const candidateAddresses = Array.from(
    new Set([rawAddress, decodedAddress].filter(Boolean))
  );

  if (!candidateAddresses.length) {
    return redirectWithReason(request, 'unknown', 'missing_address');
  }

  if (!supabaseAdmin) {
    return redirectWithReason(request, candidateAddresses[0], 'missing_service_role');
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

  const { data: tokenRows, error: tokenError } = await supabaseAdmin
    .from('tokens')
    .select('id,address,votes_24h,votes_all_time,status')
    .in('address', candidateAddresses)
    .limit(5);

  if (tokenError) {
    return redirectWithReason(request, candidateAddresses[0], `token_read_failed`);
  }

  const token =
    tokenRows?.find((row) => row.address === rawAddress) ||
    tokenRows?.find((row) => row.address === decodedAddress) ||
    tokenRows?.[0];

  if (!token) {
    return redirectWithReason(request, candidateAddresses[0], 'token_not_found');
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

  const nextVotes24h = Number(token.votes_24h || 0) + 1;
  const nextVotesAllTime = Number(token.votes_all_time || 0) + 1;

  const { error: updateError } = await supabaseAdmin
    .from('tokens')
    .update({
      votes_24h: nextVotes24h,
      votes_all_time: nextVotesAllTime,
    })
    .eq('id', token.id);

  if (updateError) {
    return redirectWithReason(request, token.address, 'token_update_failed');
  }

  const { error: logInsertError } = await supabaseAdmin
    .from('vote_logs')
    .insert({
      token_address: token.address,
      voter_key: voterKey,
      source: 'site',
    });

  if (logInsertError) {
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
