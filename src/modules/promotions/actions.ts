'use server';

import { getActivePromotions } from './queries';
import { calculateBestPromotion } from './engine';

export async function applyCouponAction(subtotal: number, couponCode: string) {
  const activePromotions = await getActivePromotions();
  return calculateBestPromotion(subtotal, activePromotions, couponCode);
}
