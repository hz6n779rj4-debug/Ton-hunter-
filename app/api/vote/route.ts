import { createHash } from 'crypto';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const VOTE_COOKIE = 'tongemz_voter';
const COOLDOWN_HOURS = 24;

function cutoffIso() {
  return new Date(Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000).toISOString();
}

function normalizeAddress(value: FormDataEntryValue | string | null | undefined) {
  return decodeURIComponent(String(value || '')).trim();
}

function buildStableVoterKey(ip: string, userAgent: string) {
  return createHash('sha256').update(`${ip}|${userAgent}`).digest('hex');
}

async function readAddress(request: Request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const json = await request.json().catch(() => null);
    return normalizeAddress(json?.address);
  }

  const form = await request.formData().catch(() => null);
  return normalizeAddress(form?.get('address'));
}

export async function POST(request: Request) {
  const address = await readAddress(request);
  const redirectUrl = new URL(`/token/${encodeURIComponent(address)}`, request.url);

  if (!address) {
    redirectUrl.searchParams.set('vote', 'error');
    return NextResponse.redirect(redirectUrl, 303);
  }

  if (!supabaseAdmin) {
    console.error('Vote failed: missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
    redirectUrl.searchParams.set('vote', 'error');
    return NextResponse.redirect(redirectUrl, 303);
  }

  const cookieStore = await cookies();
  let voterKey = cookieStore.get(VOTE_COOKIE)?.value || '';
  if (!voterKey) {
    const headerStore = await headers();
    const forwarded = headerStore.get('x-forwarded-for') || '';
    const realIp = headerStore.get('x-real-ip') || '';
    const ip = (forwarded.split(',')[0] || realIp || 'anon').trim();
    const userAgent = (headerStore.get('user-agent') || 'browser').slice(0, 250);
    voterKey = buildStableVoterKey(ip, userAgent);
  }

  const tokenAddressOptions = Array.from(new Set([address, encodeURIComponent(address), decodeURIComponent(address)].map((value) => value.trim()).filter(Boolean)));

  const { data: existingVote, error: voteLookupError } = await supabaseAdmin
    .from('vote_logs')
    .select('created_at')
    .in('token_address', tokenAddressOptions)
    .eq('voter_key', voterKey)
    .gte('created_at', cutoffIso())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (voteLookupError) {
    console.error('Vote lookup failed:', voteLookupError);
    redirectUrl.searchParams.set('vote', 'error');
    return NextResponse.redirect(redirectUrl, 303);
  }

  if (existingVote?.created_at) {
    const nextVoteAt = new Date(new Date(existingVote.created_at).getTime() + COOLDOWN_HOURS * 60 * 60 * 1000).toISOString();
    redirectUrl.searchParams.set('vote', 'cooldown');
    redirectUrl.searchParams.set('next', nextVoteAt);
    const response = NextResponse.redirect(redirectUrl, 303);
    response.cookies.set(VOTE_COOKIE, voterKey, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  const { data: tokenRow, error: tokenError } = await supabaseAdmin
    .from('tokens')
    .select('address,votes_24h,votes_all_time,status')
    .in('address', tokenAddressOptions)
    .order('listed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (tokenError || !tokenRow) {
    console.error('Token lookup failed during vote:', tokenError || `No token found for ${address}`);
    redirectUrl.searchParams.set('vote', 'error');
    return NextResponse.redirect(redirectUrl, 303);
  }

  const resolvedAddress = String(tokenRow.address || address).trim();
  const nextVotes24h = Number(tokenRow.votes_24h || 0) + 1;
  const nextVotesAllTime = Number(tokenRow.votes_all_time || 0) + 1;

  const { error: updateError } = await supabaseAdmin
    .from('tokens')
    .update({ votes_24h: nextVotes24h, votes_all_time: nextVotesAllTime })
    .eq('address', resolvedAddress);

  if (updateError) {
    console.error('Token vote update failed:', updateError);
    redirectUrl.searchParams.set('vote', 'error');
    return NextResponse.redirect(redirectUrl, 303);
  }

  const { error: insertError } = await supabaseAdmin
    .from('vote_logs')
    .insert({ token_address: resolvedAddress, voter_key: voterKey, source: 'site' });

  if (insertError) {
    console.error('Vote log insert failed:', insertError);
  }

  redirectUrl.searchParams.set('vote', 'success');
  const response = NextResponse.redirect(redirectUrl, 303);
  response.cookies.set(VOTE_COOKIE, voterKey, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 365 });
  return response;
}
