'use server';

import { getCurrentUser } from '@/lib/auth/guards';
import { placeOrder } from './service';
import { CreateOrderInput } from './schema';

export async function placeOrderAction(input: CreateOrderInput) {
  const user = await getCurrentUser();
  return await placeOrder(input, user?.id || null);
}
