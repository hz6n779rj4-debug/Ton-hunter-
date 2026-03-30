import { cookies } from 'next/headers';

const ADMIN_COOKIE = 'kyron_admin';

export function getAdminSecret() {
  return process.env.ADMIN_SECRET || '';
}

export async function isAdminAuthenticated() {
  const secret = getAdminSecret();
  if (!secret) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value || '';
  return token === secret;
}

export function adminCookieName() {
  return ADMIN_COOKIE;
}
