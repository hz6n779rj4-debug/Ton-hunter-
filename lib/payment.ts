import { supabaseAdmin } from './supabase';
export const PAYMENT_WALLET = process.env.NEXT_PUBLIC_PAYMENT_WALLET || 'UQDQ-Bp7EiOZevivYISInOTR2wZnwxowRMm-1QJFQGYCutEa';
const TONCENTER_BASE = process.env.TONCENTER_BASE_URL || 'https://toncenter.com/api/v2';

const tonHeaders = (): HeadersInit => {
  const apiKey = process.env.TONCENTER_API_KEY;
  return apiKey ? { 'X-API-Key': apiKey } : {};
};

export function tonToNano(amountTon: number) {
  return Math.round(amountTon * 1_000_000_000);
}

export function createPaymentReference(prefix: 'LST' | 'PRM') {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function buildTonTransferLink({ amountTon, reference, redirectUrl }: { amountTon: number; reference: string; redirectUrl?: string }) {
  const params = new URLSearchParams({
    amount: String(tonToNano(amountTon)),
    text: reference,
  });
  if (redirectUrl) {
    params.set('bin', redirectUrl);
  }
  return `ton://transfer/${PAYMENT_WALLET}?${params.toString()}`;
}

async function fetchRecentTransactions() {
  const url = new URL(`${TONCENTER_BASE}/getTransactions`);
  url.searchParams.set('address', PAYMENT_WALLET);
  url.searchParams.set('limit', '30');
  url.searchParams.set('archival', 'true');

  const response = await fetch(url.toString(), { headers: tonHeaders(), next: { revalidate: 10 } });
  if (!response.ok) {
    throw new Error(`TON Center returned ${response.status}`);
  }
  const payload = await response.json();
  return payload?.result || [];
}

function extractMessageText(tx: any) {
  return String(tx?.in_msg?.message || tx?.in_msg?.msg_data?.text || tx?.description || '');
}

function extractValueNano(tx: any) {
  return Number(tx?.in_msg?.value || tx?.value || 0);
}

function extractHash(tx: any) {
  return String(tx?.transaction_id?.hash || tx?.hash || tx?.tx_hash || '');
}

export async function verifyPaymentRequest(reference: string) {
  if (!supabaseAdmin) {
    return { status: 'missing-db' as const };
  }

  const { data: request } = await supabaseAdmin
    .from('payment_requests')
    .select('*')
    .eq('payment_reference', reference)
    .single();

  if (!request) {
    return { status: 'not-found' as const };
  }

  if (request.status === 'paid') {
    return { status: 'paid' as const, request };
  }

  const recentTransactions = await fetchRecentTransactions();
  const match = recentTransactions.find((tx: any) => {
    const message = extractMessageText(tx);
    const amountNano = extractValueNano(tx);
    return message.includes(reference) && amountNano >= tonToNano(request.amount_ton);
  });

  if (!match) {
    return { status: 'pending' as const, request };
  }

  const txHash = extractHash(match);
  const paidAt = new Date().toISOString();
  await supabaseAdmin
    .from('payment_requests')
    .update({ status: 'paid', paid_at: paidAt, payment_tx_hash: txHash })
    .eq('payment_reference', reference);

  if (request.request_type === 'listing') {
    await supabaseAdmin
      .from('tokens')
      .update({
        status: 'approved',
        approved_at: paidAt,
        listing_tier: 'fast',
        payment_tx_hash: txHash,
      })
      .eq('address', request.token_address);
  }

  if (request.request_type === 'promotion') {
    const expiresAt = new Date(Date.now() + (Number(request.duration_days || 1) * 24 * 60 * 60 * 1000)).toISOString();
    await supabaseAdmin
      .from('tokens')
      .update({
        promoted: true,
        payment_tx_hash: txHash,
        feature_expires_at: expiresAt,
      })
      .eq('address', request.token_address);
  }

  return { status: 'paid' as const, request: { ...request, payment_tx_hash: txHash, paid_at: paidAt } };
}
