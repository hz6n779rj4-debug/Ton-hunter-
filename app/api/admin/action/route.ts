// @ts-nocheck
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { adminCookieName, getAdminSecret } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

async function logAction(token_address: string, action: string, value?: number, reason?: string) {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from('admin_actions').insert({ token_address, action, value: value ?? null, reason: reason || null });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const action = String(form.get('action') || '');
  const address = String(form.get('address') || '');
  const requestId = String(form.get('request_id') || '');
  const redirectUrl = new URL('/admin/panel', request.url);

  const secret = getAdminSecret();
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value || '';
  if (!secret || token !== secret) {
    redirectUrl.searchParams.set('error', 'Unauthorized');
    return NextResponse.redirect(redirectUrl, 303);
  }
  if (!supabaseAdmin) {
    redirectUrl.searchParams.set('error', 'Missing admin database access.');
    return NextResponse.redirect(redirectUrl, 303);
  }

  if (action === 'approve-claim' || action === 'reject-claim') {
    if (!requestId) {
      redirectUrl.searchParams.set('error', 'Missing claim request id.');
      return NextResponse.redirect(redirectUrl, 303);
    }
    const { data: claimRow, error: claimLoadError } = await supabaseAdmin.from('claim_requests').select('token_address,telegram_id,username').eq('id', requestId).single();
    if (claimLoadError || !claimRow) {
      redirectUrl.searchParams.set('error', claimLoadError?.message || 'Claim request not found.');
      return NextResponse.redirect(redirectUrl, 303);
    }
    await supabaseAdmin.from('claim_requests').update({ status: action === 'approve-claim' ? 'approved' : 'rejected' }).eq('id', requestId);
    if (action === 'approve-claim') {
      await supabaseAdmin.from('tokens').update({
        is_claimed: true,
        claimed_by_telegram_id: claimRow.telegram_id || null,
        claimed_by_username: claimRow.username || null,
      }).eq('address', claimRow.token_address);
    }
    redirectUrl.searchParams.set('message', action === 'approve-claim' ? 'Claim request approved.' : 'Claim request rejected.');
    revalidatePath('/admin/panel'); revalidatePath('/'); revalidatePath('/explore'); if (claimRow.token_address) revalidatePath(`/token/${claimRow.token_address}`);
    return NextResponse.redirect(redirectUrl, 303);
  }
  if (!address) {
    redirectUrl.searchParams.set('error', 'Missing token address.');
    return NextResponse.redirect(redirectUrl, 303);
  }
  if (action === 'approve') {
    const { error } = await supabaseAdmin.from('tokens').update({ status: 'approved' }).eq('address', address);
    if (error) redirectUrl.searchParams.set('error', error.message); else redirectUrl.searchParams.set('message', 'Token approved.');
  } else if (action === 'reject') {
    const { error } = await supabaseAdmin.from('tokens').update({ status: 'rejected' }).eq('address', address);
    if (error) redirectUrl.searchParams.set('error', error.message); else redirectUrl.searchParams.set('message', 'Token rejected.');
  } else if (action === 'toggle-promote') {
    const { data } = await supabaseAdmin.from('tokens').select('promoted').eq('address', address).single();
    const { error } = await supabaseAdmin.from('tokens').update({ promoted: !data?.promoted }).eq('address', address);
    if (error) redirectUrl.searchParams.set('error', error.message); else redirectUrl.searchParams.set('message', `Promotion ${data?.promoted ? 'disabled' : 'enabled'}.`);
  } else if (action === 'toggle-verified') {
    const { data } = await supabaseAdmin.from('tokens').select('verified_team').eq('address', address).single();
    const { error } = await supabaseAdmin.from('tokens').update({ verified_team: !data?.verified_team }).eq('address', address);
    if (error) redirectUrl.searchParams.set('error', error.message); else redirectUrl.searchParams.set('message', `Verified Team ${data?.verified_team ? 'removed' : 'enabled'}.`);
  } else if (['boost-votes','remove-votes','set-votes','reset-24h'].includes(action)) {
    const parsedAmount = Number(form.get('amount') || 0);
    const amount = Number.isFinite(parsedAmount) ? Math.max(0, parsedAmount) : 0;
    const reason = String(form.get('reason') || '').trim();
    const { data, error } = await supabaseAdmin.from('tokens').select('admin_boost_votes,votes_24h,votes_all_time').eq('address', address).single();
    if (error || !data) {
      redirectUrl.searchParams.set('error', error?.message || 'Unable to load token votes.');
      return NextResponse.redirect(redirectUrl, 303);
    }
    let nextBoost = Number(data.admin_boost_votes || 0), next24 = Number(data.votes_24h || 0), nextAll = Number(data.votes_all_time || 0);
    if (action === 'reset-24h') next24 = 0;
    if (action === 'boost-votes') { nextBoost += amount; next24 += amount; nextAll += amount; }
    if (action === 'remove-votes') { const rem=Math.min(nextBoost, amount); nextBoost=Math.max(0,nextBoost-amount); next24=Math.max(0,next24-rem); nextAll=Math.max(0,nextAll-rem); }
    if (action === 'set-votes') { const delta=amount-nextBoost; nextBoost=amount; next24=Math.max(0,next24+delta); nextAll=Math.max(0,nextAll+delta); }
    const { error: updateError } = await supabaseAdmin.from('tokens').update({ admin_boost_votes: nextBoost, votes_24h: next24, votes_all_time: nextAll }).eq('address', address);
    if (updateError) redirectUrl.searchParams.set('error', updateError.message); else redirectUrl.searchParams.set('message', `Votes updated. Boost: ${nextBoost}.`);
    await logAction(address, action, amount, reason);
  } else {
    redirectUrl.searchParams.set('error', 'Unknown action');
  }
  revalidatePath('/'); revalidatePath('/explore'); revalidatePath('/today-best'); revalidatePath('/all-time-best'); revalidatePath('/new-listings'); revalidatePath('/admin/panel'); revalidatePath(`/token/${address}`);
  return NextResponse.redirect(redirectUrl, 303);
}
