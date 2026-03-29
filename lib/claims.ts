import { supabaseAdmin } from './supabase';
import type { ClaimRequest } from './types';

export async function getClaimRequests(status?: ClaimRequest['status']) {
  if (!supabaseAdmin) return [] as ClaimRequest[];
  let query = supabaseAdmin.from('claim_requests').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data } = await query;
  return (data || []) as ClaimRequest[];
}
