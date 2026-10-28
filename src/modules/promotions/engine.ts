import { applyPercentageDiscount } from '@/lib/money';

export interface PromotionCandidate {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxDiscount?: number;
  minSpend: number;
  isAutomatic: boolean;
  couponCode?: string;
  stackable: boolean;
  priority: number;
}

export interface PromotionCalculationResult {
  discountAmount: number;
  finalTotal: number;
  appliedPromotion: PromotionCandidate | null;
  message: string;
  isApplied: boolean;
}

/**
 * Inkora Studio Promotion Engine (Section 9.3)
 * Rule: Evaluates eligible merchandise subtotal BEFORE shipping.
 * Default: Picks best single offer unless stacking is explicitly permitted.
 */
export function calculateBestPromotion(
  subtotal: number,
  activePromotions: PromotionCandidate[],
  enteredCouponCode?: string,
): PromotionCalculationResult {
  if (subtotal <= 0 || activePromotions.length === 0) {
    return {
      discountAmount: 0,
      finalTotal: subtotal,
      appliedPromotion: null,
      message: '',
      isApplied: false,
    };
  }

  // Filter eligible promotions
  const eligiblePromos = activePromotions.filter((promo) => {
    // Check minimum spend threshold
    if (subtotal < promo.minSpend) {
      return false;
    }

    // If promo is coupon-based, require exact match
    if (promo.couponCode) {
      return (
        enteredCouponCode && promo.couponCode.toUpperCase() === enteredCouponCode.toUpperCase()
      );
    }

    // Automatic promotion
    return promo.isAutomatic;
  });

  if (eligiblePromos.length === 0) {
    return {
      discountAmount: 0,
      finalTotal: subtotal,
      appliedPromotion: null,
      message: enteredCouponCode ? 'Coupon code is invalid or minimum spend not met' : '',
      isApplied: false,
    };
  }

  // Calculate discount for each eligible promo and pick the best single offer
  let bestDiscount = 0;
  let bestPromo: PromotionCandidate | null = null;

  for (const promo of eligiblePromos) {
    let calculated = 0;
    if (promo.type === 'percentage') {
      const res = applyPercentageDiscount(subtotal, promo.value, promo.maxDiscount);
      calculated = res.discount;
    } else {
      // Fixed PKR discount
      calculated = Math.min(promo.value, subtotal);
    }

    if (calculated > bestDiscount) {
      bestDiscount = calculated;
      bestPromo = promo;
    }
  }

  const finalTotal = Math.max(0, subtotal - bestDiscount);

  return {
    discountAmount: bestDiscount,
    finalTotal,
    appliedPromotion: bestPromo,
    message: bestPromo ? `Applied: ${bestPromo.name}` : '',
    isApplied: bestDiscount > 0,
  };
}
