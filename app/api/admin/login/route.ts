import { adminCookieName, getAdminSecret } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get('password') || '');
  const secret = getAdminSecret();
  const redirectUrl = new URL('/admin', request.url);

  if (!secret || password !== secret) {
    redirectUrl.searchParams.set('error', 'Wrong admin password.');
    return NextResponse.redirect(redirectUrl, 303);
  }

  const response = NextResponse.redirect(redirectUrl, 303);
  response.cookies.set(adminCookieName(), secret, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
