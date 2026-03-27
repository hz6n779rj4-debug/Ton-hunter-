import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminCookieName, getAdminSecret } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

async function logAction(token_address: string, action: string, value?: number, reason?: string) {
  if (!supabaseAdmin) return;
  await supabaseAdmin.from('admin_actions').insert({ token_address, action, value: value ?? null, reason: reason || null });
}

function revalidateTokenPaths(address: string) {
  revalidatePath('/');
  revalidatePath('/explore');
  revalidatePath('/admin/panel');
  if (address) revalidatePath(`/token/${address}`);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const action = String(form.get('action') || '');
  const address = String(form.get('address') || '').trim();
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
    if (error) redirectUrl.searchParams.set('error', error.message); else {
      redirectUrl.searchParams.set('message', 'Token approved.');
      revalidateTokenPaths(address);
    }
    await logAction(address, action);
    return NextResponse.redirect(redirectUrl, 303);
  }

  if (action === 'reject') {
    const { error } = await supabaseAdmin.from('tokens').update({ status: 'rejected' }).eq('address', address);
    if (error) redirectUrl.searchParams.set('error', error.message); else {
      redirectUrl.searchParams.set('message', 'Token rejected.');
      revalidateTokenPaths(address);
    }
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
    if (updateError) redirectUrl.searchParams.set('error', updateError.message); else {
      redirectUrl.searchParams.set('message', `Promotion ${data?.promoted ? 'disabled' : 'enabled'}.`);
      revalidateTokenPaths(address);
    }
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
    const currentAll = Number(data.votes_all_time || 0);

    let nextBoost = currentBoost;
    let next24h = current24h;
    let nextAll = currentAll;

    if (action === 'reset-24h') {
      next24h = 0;
    } else if (action === 'boost-votes') {
      nextBoost = currentBoost + amount;
      next24h = current24h + amount;
      nextAll = currentAll + amount;
    } else if (action === 'remove-votes') {
      const removable = Math.min(currentBoost, amount);
      nextBoost = currentBoost - removable;
      next24h = Math.max(0, current24h - removable);
      nextAll = Math.max(0, currentAll - removable);
    } else if (action === 'set-votes') {
      const targetBoost = amount;
      const delta = targetBoost - currentBoost;
      nextBoost = targetBoost;
      next24h = Math.max(0, current24h + delta);
      nextAll = Math.max(0, currentAll + delta);
    }

    const { error: updateError } = await supabaseAdmin
      .from('tokens')
      .update({
        admin_boost_votes: nextBoost,
        votes_24h: next24h,
        votes_all_time: nextAll,
      })
      .eq('address', address);

    if (updateError) {
      redirectUrl.searchParams.set('error', updateError.message);
    } else {
      redirectUrl.searchParams.set('message',
        action === 'reset-24h'
          ? '24h votes reset.'
          : `Votes updated. Boost ${nextBoost} · 24h ${next24h} · All-time ${nextAll}.`
      );
      revalidateTokenPaths(address);
    }
    await logAction(address, action, amount, reason);
    return NextResponse.redirect(redirectUrl, 303);
  }

  redirectUrl.searchParams.set('error', 'Unknown action');
  return NextResponse.redirect(redirectUrl, 303);
}
