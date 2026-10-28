import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/lib/auth/guards';

/**
 * Confirm a payment manually (for Bank Transfer proof or verified COD delivery)
 * Rule: Only verified confirmation marks an order paid (Decision D10).
 */
export async function verifyPayment(params: {
  orderId: string;
  provider: string;
  providerRef: string;
  amount: number;
  actorId?: string;
}) {
  const adminClient = createAdminClient();

  // 1. Insert into payments table
  const { data: payment, error: pError } = await adminClient
    .from('payments')
    .insert({
      order_id: params.orderId,
      provider: params.provider,
      provider_ref: params.providerRef,
      amount: params.amount,
      status: 'paid',
      raw_event: { verified_by: params.actorId || 'system', verified_at: new Date().toISOString() },
    })
    .select('id')
    .single();

  if (pError) throw pError;

  // 2. Update order payment status
  const { error: oError } = await adminClient
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'artwork_review', // moves to artwork review once paid
    })
    .eq('id', params.orderId);

  if (oError) throw oError;

  // 3. Log order status transition
  await adminClient.from('order_status_events').insert({
    order_id: params.orderId,
    from_status: 'awaiting_payment',
    to_status: 'artwork_review',
    actor_id: params.actorId || null,
    note: `Payment verified via ${params.provider} (Ref: ${params.providerRef})`,
  });

  // 4. Record audit log
  await logAuditEvent({
    actorId: params.actorId,
    action: 'order.payment_verified',
    entity: 'orders',
    entityId: params.orderId,
    diff: { amount: params.amount, provider: params.provider, paymentId: payment.id },
  });

  return { success: true, paymentId: payment.id };
}

/**
 * Cancel an order and issue status updates (Audit Log compliant)
 */
export async function cancelOrder(params: { orderId: string; reason: string; actorId?: string }) {
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from('orders')
    .update({
      status: 'cancelled',
    })
    .eq('id', params.orderId);

  if (error) throw error;

  await adminClient.from('order_status_events').insert({
    order_id: params.orderId,
    to_status: 'cancelled',
    actor_id: params.actorId || null,
    note: `Order cancelled: ${params.reason}`,
  });

  await logAuditEvent({
    actorId: params.actorId,
    action: 'order.cancelled',
    entity: 'orders',
    entityId: params.orderId,
    diff: { reason: params.reason },
  });

  return { success: true };
}
