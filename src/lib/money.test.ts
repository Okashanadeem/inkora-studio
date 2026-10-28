import { describe, it, expect } from 'vitest';
import { formatPKR, applyPercentageDiscount, paisaToPKR, pkrToPaisa } from './money';

describe('lib/money utilities', () => {
  it('formats PKR values properly', () => {
    expect(formatPKR(2500)).toBe('PKR 2,500');
    expect(formatPKR(0)).toBe('PKR 0');
    expect(formatPKR(150000)).toBe('PKR 150,000');
  });

  it('calculates percentage discounts accurately with integer rounding', () => {
    // 20% of 2500 is 500
    const result = applyPercentageDiscount(2500, 20);
    expect(result.discount).toBe(500);
    expect(result.finalTotal).toBe(2000);
  });

  it('respects maximum discount caps', () => {
    // 20% of 5000 is 1000, capped at 500
    const result = applyPercentageDiscount(5000, 20, 500);
    expect(result.discount).toBe(500);
    expect(result.finalTotal).toBe(4500);
  });

  it('handles minor unit (paisa) conversions cleanly', () => {
    expect(pkrToPaisa(100)).toBe(10000);
    expect(paisaToPKR(10000)).toBe(100);
  });
});
