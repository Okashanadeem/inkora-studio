import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Execute an operation with an idempotency key to prevent double submits (Section 5.7)
 */
export async function withIdempotency<T>(
  key: string,
  scope: string,
  ttlSeconds: number = 86400,
  operation: () => Promise<T>,
): Promise<{ success: boolean; data?: T; isDuplicate?: boolean }> {
  const adminClient = createAdminClient();

  // 1. Check if key already exists
  const { data: existing } = await adminClient
    .from('idempotency_keys')
    .select('key, response_hash, expires_at')
    .eq('key', key)
    .single();

  if (existing) {
    return {
      success: true,
      isDuplicate: true,
    };
  }

  // 2. Execute the underlying operation
  const result = await operation();

  // 3. Store idempotency key
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  await adminClient.from('idempotency_keys').insert({
    key,
    scope,
    expires_at: expiresAt,
  });

  return {
    success: true,
    data: result,
    isDuplicate: false,
  };
}
