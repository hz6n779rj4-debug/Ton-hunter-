import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { adminCookieName, getAdminSecret } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

async function logAction(token_address: string, action: string, value?: number, reason?: string) {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from('admin_actions').insert({ token_address, action, value: value ?? null, reason: reason || null });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const action = String(form.get('action') || '');
  const address = String(form.get('address') || '');
  const redirectUrl = new URL('/admin/panel', request.url);

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
    if (error) redirectUrl.searchParams.set('error', error.message); else { redirectUrl.searchParams.set('message', 'Token approved.'); revalidatePath('/'); revalidatePath('/explore'); revalidatePath('/admin/panel'); revalidatePath(`/token/${address}`); }
    await logAction(address, action);
    return NextResponse.redirect(redirectUrl, 303);
  }

  if (action === 'reject') {
    const { error } = await supabaseAdmin.from('tokens').update({ status: 'rejected' }).eq('address', address);
    if (error) redirectUrl.searchParams.set('error', error.message); else { redirectUrl.searchParams.set('message', 'Token rejected.'); revalidatePath('/'); revalidatePath('/explore'); revalidatePath('/admin/panel'); revalidatePath(`/token/${address}`); }
    await logAction(address, action);
    return NextResponse.redirect(redirectUrl, 303);
  }

  if (action === 'toggle-promote') {
    const { data, error } = await supabaseAdmin.from('tokens').select('promoted').eq('address', address).single();
    if (error) {
      redirectUrl.searchParams.set('error', error.message);
      return NextResponse.redirect(redirectUrl, 303);
    }
    const { error: updateError } = await supabaseAdmin.from('tokens').update({ promoted: !data?.promoted }).eq('address', address);
    if (updateError) redirectUrl.searchParams.set('error', updateError.message); else { redirectUrl.searchParams.set('message', `Promotion ${data?.promoted ? 'disabled' : 'enabled'}.`); revalidatePath('/'); revalidatePath('/explore'); revalidatePath('/admin/panel'); revalidatePath(`/token/${address}`); }
    await logAction(address, action, data?.promoted ? 0 : 1);
    return NextResponse.redirect(redirectUrl, 303);
  }

  if (action === 'boost-votes' || action === 'remove-votes' || action === 'set-votes' || action === 'reset-24h') {
    const amount = Math.max(0, Number(form.get('amount') || 0));
    const reason = String(form.get('reason') || '').trim();
    const { data, error } = await supabaseAdmin
      .from('tokens')
      .select('admin_boost_votes,votes_24h,votes_all_time')
      .eq('address', address)
      .single();

    if (error || !data) {
      redirectUrl.searchParams.set('error', error?.message || 'Unable to load token votes.');
      return NextResponse.redirect(redirectUrl, 303);
    }

    const currentBoost = Number(data.admin_boost_votes || 0);
    const current24h = Number(data.votes_24h || 0);
    const currentAllTime = Number(data.votes_all_time || 0);

    let nextBoostVotes = currentBoost;
    let next24hVotes = current24h;
    let nextAllTimeVotes = currentAllTime;

    if (action === 'reset-24h') {
      next24hVotes = 0;
    } else if (action === 'boost-votes') {
      nextBoostVotes = currentBoost + amount;
      next24hVotes = current24h + amount;
      nextAllTimeVotes = currentAllTime + amount;
    } else if (action === 'remove-votes') {
      const removable = Math.min(currentBoost, amount);
      nextBoostVotes = Math.max(0, currentBoost - amount);
      next24hVotes = Math.max(0, current24h - removable);
      nextAllTimeVotes = Math.max(0, currentAllTime - removable);
    } else if (action === 'set-votes') {
      const delta = amount - currentBoost;
      nextBoostVotes = amount;
      next24hVotes = Math.max(0, current24h + delta);
      nextAllTimeVotes = Math.max(0, currentAllTime + delta);
    }

    const { error: updateError } = await supabaseAdmin
      .from('tokens')
      .update({
        admin_boost_votes: nextBoostVotes,
        votes_24h: next24hVotes,
        votes_all_time: nextAllTimeVotes,
      })
      .eq('address', address);

    if (updateError) {
      redirectUrl.searchParams.set('error', updateError.message);
    } else {
      redirectUrl.searchParams.set('message', `Votes updated. Boost: ${nextBoostVotes}.`);
      revalidatePath('/');
      revalidatePath('/explore');
      revalidatePath('/admin/panel');
      revalidatePath(`/token/${address}`);
    }
    await logAction(address, action, amount, reason);
    return NextResponse.redirect(redirectUrl, 303);
  }


  redirectUrl.searchParams.set('error', 'Unknown action');
  return NextResponse.redirect(redirectUrl, 303);
}
