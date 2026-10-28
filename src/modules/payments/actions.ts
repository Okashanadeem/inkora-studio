'use server';

import { requireStaffOrAdmin } from '@/lib/auth/guards';
import { verifyPayment, cancelOrder } from './service';

export async function verifyPaymentAction(params: {
  orderId: string;
  provider: string;
  providerRef: string;
  amount: number;
}) {
  const { user } = await requireStaffOrAdmin();
  return await verifyPayment({ ...params, actorId: user.id });
}

export async function cancelOrderAction(params: { orderId: string; reason: string }) {
  const { user } = await requireStaffOrAdmin();
  return await cancelOrder({ ...params, actorId: user.id });
}
