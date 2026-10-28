import { describe, it, expect } from 'vitest';
import { calculateBestPromotion, PromotionCandidate } from './engine';

describe('Promotion Engine', () => {
  const promotions: PromotionCandidate[] = [
    {
      id: 'promo-1',
      name: 'WELCOME20',
      type: 'percentage',
      value: 20,
      minSpend: 0,
      isAutomatic: false,
      couponCode: 'WELCOME20',
      stackable: false,
      priority: 1,
    },
    {
      id: 'promo-2',
      name: 'Spend PKR 2,000 Save 20%',
      type: 'percentage',
      value: 20,
      minSpend: 2000,
      maxDiscount: 500, // PKR 500 cap
      isAutomatic: true,
      stackable: false,
      priority: 2,
    },
  ];

  it('correctly calculates WELCOME20 coupon discount (20% off)', () => {
    // 20% of 2500 is 500
    const result = calculateBestPromotion(2500, promotions, 'WELCOME20');
    expect(result.isApplied).toBe(true);
    expect(result.discountAmount).toBe(500);
    expect(result.finalTotal).toBe(2000);
    expect(result.appliedPromotion?.couponCode).toBe('WELCOME20');
  });

  it('automatically applies PKR 2,000 spend promotion when subtotal qualifies', () => {
    // Subtotal 2500 qualifies for Spend 2000 Save 20%, capped at 500
    const result = calculateBestPromotion(2500, promotions);
    expect(result.isApplied).toBe(true);
    expect(result.discountAmount).toBe(500);
    expect(result.finalTotal).toBe(2000);
  });

  it('enforces maximum discount caps', () => {
    // 20% of 5000 is 1000, but capped at 500
    const result = calculateBestPromotion(5000, promotions);
    expect(result.discountAmount).toBe(500);
    expect(result.finalTotal).toBe(4500);
  });

  it('rejects coupon when below required minimum spend', () => {
    const minSpendPromo: PromotionCandidate[] = [
      {
        id: 'promo-3',
        name: 'VIP1000',
        type: 'fixed',
        value: 1000,
        minSpend: 5000,
        isAutomatic: false,
        couponCode: 'VIP1000',
        stackable: false,
        priority: 1,
      },
    ];

    const result = calculateBestPromotion(2500, minSpendPromo, 'VIP1000');
    expect(result.isApplied).toBe(false);
    expect(result.discountAmount).toBe(0);
    expect(result.finalTotal).toBe(2500);
  });
});
