import { supabaseAdmin } from './supabase';

const WALLET = process.env.NEXT_PUBLIC_PAYMENT_WALLET || 'UQDQ-Bp7EiOZevivYISInOTR2wZnwxowRMm-1QJFQGYCutEa';
const TONCENTER = process.env.TONCENTER_BASE_URL || 'https://toncenter.com/api/v2';
const TONCENTER_KEY = process.env.TONCENTER_API_KEY || '';

type TxLike = Record<string, any>;

function buildHeaders(): HeadersInit {
  const headers: HeadersInit = {};
  if (TONCENTER_KEY) headers['X-API-Key'] = TONCENTER_KEY;
  return headers;
}

function toNano(ton: number) {
  return Math.round(ton * 1_000_000_000);
}

function getIncomingValue(tx: TxLike) {
  const raw = tx?.in_msg?.value ?? tx?.inMessage?.value ?? tx?.value ?? 0;
  return Number(raw || 0);
}

function getComment(tx: TxLike) {
  return String(
    tx?.in_msg?.message ||
    tx?.in_msg?.comment ||
    tx?.inMessage?.message ||
    tx?.description ||
    tx?.memo ||
    ''
  );
}

async function fetchTransactions() {
  const url = `${TONCENTER}/getTransactions?address=${encodeURIComponent(WALLET)}&limit=30`;
  const response = await fetch(url, { headers: buildHeaders(), cache: 'no-store' });
  const json = await response.json().catch(() => null);
  return json?.result || [];
}

export async function verifyWalletPayment(reference: string, amountTon: number) {
  try {
    const txs = await fetchTransactions();
    const expected = toNano(amountTon);
    for (const tx of txs) {
      const comment = getComment(tx);
      const value = getIncomingValue(tx);
      if (comment.includes(reference) && value >= expected) {
        return { ok: true, tx };
      }
    }
    return { ok: false };
  } catch {
    return { ok: false };
  }
}

export async function verifyFastListingPayment(reference: string) {
  return verifyWalletPayment(reference, 10);
}

export async function verifyPromotionPayment(reference: string, days: number) {
  const amount = days === 7 ? 25 : days === 3 ? 12 : 5;
  return verifyWalletPayment(reference, amount);
}

export async function approveFastListing(address: string) {
  if (!supabaseAdmin) return false;
  const { error } = await supabaseAdmin
    .from('tokens')
    .update({ status: 'approved' })
    .eq('address', address);
  return !error;
}

export async function activatePromotion(address: string, days: number) {
  if (!supabaseAdmin) return false;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabaseAdmin
    .from('tokens')
    .update({ promoted: true, promotion_duration_days: days, promotion_expires_at: expiresAt })
    .eq('address', address);
  return !error;
}
