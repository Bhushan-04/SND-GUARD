import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getEnv } from '../config/env';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const env = getEnv();
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY);
  }
  return supabaseClient;
}
