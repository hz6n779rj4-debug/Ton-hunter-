import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  const form = await request.formData();
  const address = String(form.get('address') || '').trim();
  const action = String(form.get('action') || '').trim();

  if (!supabaseAdmin || !address || !action) {
    return NextResponse.redirect(new URL('/admin', request.url), { status: 303 });
  }

  if (action === 'approve') {
    await supabaseAdmin.from('tokens').update({ status: 'approved' }).eq('address', address);
  }

  if (action === 'reject') {
    await supabaseAdmin.from('tokens').update({ status: 'rejected' }).eq('address', address);
  }

  return NextResponse.redirect(new URL('/admin', request.url), { status: 303 });
}
