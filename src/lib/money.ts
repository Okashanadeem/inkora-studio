/**
 * Inkora Studio Money Utilities
 * Rule: Money is stored strictly as integer minor units (paisa) or integer PKR.
 * Never use floating-point numbers for storage or mathematical calculations.
 */

export interface FormattedMoney {
  amount: number;
  formatted: string;
  currency: 'PKR';
}

/**
 * Format an integer PKR amount with the currency symbol.
 * Example: 2500 -> "PKR 2,500"
 */
export function formatPKR(amount: number): string {
  const rounded = Math.round(amount);
  return `PKR ${new Intl.NumberFormat('en-PK').format(rounded)}`;
}

/**
 * Calculate percentage discount safely using integer arithmetic.
 * Returns the discounted amount in integer PKR.
 */
export function applyPercentageDiscount(
  subtotal: number,
  percentage: number,
  maxDiscount?: number,
): { discount: number; finalTotal: number } {
  if (percentage <= 0 || subtotal <= 0) {
    return { discount: 0, finalTotal: subtotal };
  }

  // Integer math: subtotal * percentage / 100
  let rawDiscount = Math.round((subtotal * percentage) / 100);

  if (maxDiscount !== undefined && maxDiscount > 0) {
    rawDiscount = Math.min(rawDiscount, maxDiscount);
  }

  const discount = Math.min(rawDiscount, subtotal);
  const finalTotal = Math.max(0, subtotal - discount);

  return { discount, finalTotal };
}

/**
 * Convert Paisa (minor units) to PKR integer
 */
export function paisaToPKR(paisa: number): number {
  return Math.round(paisa / 100);
}

/**
 * Convert PKR to Paisa (minor units)
 */
export function pkrToPaisa(pkr: number): number {
  return Math.round(pkr * 100);
}
