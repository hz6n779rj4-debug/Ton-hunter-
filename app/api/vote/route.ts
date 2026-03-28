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

function normalizeValue(value: FormDataEntryValue | string | null | undefined) {
  return decodeURIComponent(String(value || '')).trim();
}

function buildStableVoterKey(ip: string, userAgent: string) {
  return createHash('sha256').update(`${ip}|${userAgent}`).digest('hex');
}

function buildRedirect(request: Request, address: string, vote: string, extra?: Record<string, string>) {
  const redirectUrl = new URL(`/token/${encodeURIComponent(address || 'unknown')}`, request.url);
  redirectUrl.searchParams.set('vote', vote);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      redirectUrl.searchParams.set(key, value);
    }
  }
  return redirectUrl;
}

async function readPayload(request: Request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const json = await request.json().catch(() => null);
    return {
      tokenId: normalizeValue(json?.tokenId),
      address: normalizeValue(json?.address),
    };
  }

  const form = await request.formData().catch(() => null);
  return {
    tokenId: normalizeValue(form?.get('tokenId')),
    address: normalizeValue(form?.get('address')),
  };
}

export async function POST(request: Request) {
  const { tokenId, address } = await readPayload(request);

  if (!tokenId && !address) {
    return NextResponse.redirect(buildRedirect(request, 'unknown', 'error', { reason: 'missing_token' }), 303);
  }

  if (!supabaseAdmin) {
    console.error('Vote failed: missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
    return NextResponse.redirect(buildRedirect(request, address || 'unknown', 'error', { reason: 'missing_service_role' }), 303);
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

  let tokenQuery = supabaseAdmin
    .from('tokens')
    .select('id,address,votes_24h,votes_all_time,status')
    .limit(1);

  if (tokenId) {
    tokenQuery = tokenQuery.eq('id', tokenId);
  } else {
    tokenQuery = tokenQuery.eq('address', address);
  }

  const { data: tokenRow, error: tokenError } = await tokenQuery.maybeSingle();

  if (tokenError || !tokenRow) {
    console.error('Token lookup failed during vote:', tokenError || `No token found for ${tokenId || address}`);
    return NextResponse.redirect(buildRedirect(request, address || 'unknown', 'error', { reason: 'token_not_found' }), 303);
  }

  const resolvedAddress = String(tokenRow.address || address || 'unknown').trim();

  const { data: existingVote, error: voteLookupError } = await supabaseAdmin
    .from('vote_logs')
    .select('created_at')
    .eq('token_address', resolvedAddress)
    .eq('voter_key', voterKey)
    .gte('created_at', cutoffIso())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (voteLookupError) {
    console.error('Vote lookup failed:', voteLookupError);
    return NextResponse.redirect(buildRedirect(request, resolvedAddress, 'error', { reason: 'vote_lookup_failed' }), 303);
  }

  if (existingVote?.created_at) {
    const nextVoteAt = new Date(new Date(existingVote.created_at).getTime() + COOLDOWN_HOURS * 60 * 60 * 1000).toISOString();
    const response = NextResponse.redirect(buildRedirect(request, resolvedAddress, 'cooldown', { next: nextVoteAt }), 303);
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
      votes_24h: Number(tokenRow.votes_24h || 0) + 1,
      votes_all_time: Number(tokenRow.votes_all_time || 0) + 1,
    })
    .eq('id', tokenRow.id);

  if (updateError) {
    console.error('Token vote update failed:', updateError);
    return NextResponse.redirect(buildRedirect(request, resolvedAddress, 'error', { reason: 'token_update_failed' }), 303);
  }

  const { error: insertError } = await supabaseAdmin
    .from('vote_logs')
    .insert({ token_address: resolvedAddress, voter_key: voterKey, source: 'site' });

  if (insertError) {
    console.error('Vote log insert failed:', insertError);
  }

  const response = NextResponse.redirect(buildRedirect(request, resolvedAddress, 'success'), 303);
  response.cookies.set(VOTE_COOKIE, voterKey, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
