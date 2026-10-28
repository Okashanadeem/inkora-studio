import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export type UserRole = 'customer' | 'staff' | 'admin';

/**
 * Get current authenticated user session
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Get the role for the authenticated user
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();

  return (data?.role as UserRole) || 'customer';
}

/**
 * Server Action guard: requires staff or admin role
 * Throws an error or returns unauthorized response if check fails
 */
export async function requireStaffOrAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required.');
  }

  const role = await getCurrentUserRole();
  if (role !== 'staff' && role !== 'admin') {
    throw new Error('Access denied: Staff or Admin role required.');
  }

  return { user, role };
}

/**
 * Server Action guard: requires admin role
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required.');
  }

  const role = await getCurrentUserRole();
  if (role !== 'admin') {
    throw new Error('Access denied: Administrator role required.');
  }

  return { user, role };
}

/**
 * Log an administrative action to the audit_log table
 */
export async function logAuditEvent(params: {
  actorId?: string;
  action: string;
  entity: string;
  entityId: string;
  diff?: Record<string, unknown>;
}) {
  const adminClient = createAdminClient();
  await adminClient.from('audit_log').insert({
    actor_id: params.actorId || null,
    action: params.action,
    entity: params.entity,
    entity_id: params.entityId,
    diff: params.diff || null,
  });
}
