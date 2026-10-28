import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

/**
 * Service Role Supabase Client
 * SECURITY RULE:
 * This client bypasses Row Level Security (RLS).
 * It must ONLY be imported and called inside server-side Route Handlers or internal modules.
 * NEVER import or expose to Client Components.
 */
export function createAdminClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for administrative operations.');
  }

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
