import { adminCookieName } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/admin', request.url), 303);
  response.cookies.set(adminCookieName(), '', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 0 });
  return response;
}
