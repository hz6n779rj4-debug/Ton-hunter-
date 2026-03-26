import { adminCookieName, getAdminSecret } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get('password') || '');
  const secret = getAdminSecret();
  const loginUrl = new URL('/admin', request.url);
  const panelUrl = new URL('/admin/panel', request.url);

  if (!secret) {
    loginUrl.searchParams.set('error', 'ADMIN_SECRET is missing on the deployment.');
    return NextResponse.redirect(loginUrl, 303);
  }

  if (password !== secret) {
    loginUrl.searchParams.set('error', 'Wrong owner password.');
    return NextResponse.redirect(loginUrl, 303);
  }

  panelUrl.searchParams.set('message', 'Private dashboard unlocked.');
  const response = NextResponse.redirect(panelUrl, 303);
  response.cookies.set(adminCookieName(), secret, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
