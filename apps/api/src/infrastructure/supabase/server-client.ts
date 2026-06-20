import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { getEnv } from '../config/env';

export interface CookieStore {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options: CookieOptions): void;
  remove(name: string, options: CookieOptions): void;
}

export function createSupabaseServerClient(cookies: CookieStore) {
  const env = getEnv();

  return createServerClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      get: (name) => cookies.get(name)?.value,
      set: (name, value, options) => cookies.set(name, value, options),
      remove: (name, options) => cookies.remove(name, options),
    },
  });
}
