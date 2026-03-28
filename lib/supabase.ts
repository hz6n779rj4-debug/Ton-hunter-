import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

export const supabasePublic = url && anon ? createClient(url, anon, clientOptions) : null;
export const supabaseAdmin = url && service ? createClient(url, service, clientOptions) : null;
export const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'token-logos';
