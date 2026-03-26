import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  const form = await request.formData();
  const address = String(form.get('address') || '');
  const action = String(form.get('action') || 'approve');

  if (supabaseAdmin && address) {
    if (action === 'approve') await supabaseAdmin.from('tokens').update({ status: 'approved' }).eq('address', address);
    if (action === 'reject') await supabaseAdmin.from('tokens').update({ status: 'rejected' }).eq('address', address);
  }

  return NextResponse.redirect(new URL('/admin', request.url));
}
