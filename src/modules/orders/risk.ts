export interface RiskEvaluationResult {
  score: number; // 0 - 100
  level: 'low' | 'medium' | 'high';
  reasons: string[];
  requiresManualVerification: boolean;
}

export interface RiskInputParams {
  grandTotal: number;
  paymentMethod: string;
  totalQuantity: number;
  phone: string;
  email: string;
  ipAddress?: string;
}

/**
 * Inkora Order Risk Evaluation Engine (Section 7.2 & Decision D9)
 * Protects against COD refusal abuse, automated bots, and fake bulk orders.
 */
export function evaluateOrderRisk(params: RiskInputParams): RiskEvaluationResult {
  let score = 0;
  const reasons: string[] = [];

  // 1. High value Cash on Delivery risk (threshold: PKR 10,000)
  if (params.paymentMethod === 'cod' && params.grandTotal >= 10000) {
    score += 40;
    reasons.push(`High value COD order (${params.grandTotal} PKR exceeds 10,000 PKR threshold)`);
  }

  // 2. High bulk volume order (threshold: >50 total quantity)
  if (params.totalQuantity >= 50) {
    score += 30;
    reasons.push(
      `High volume order (${params.totalQuantity} items require staff production confirmation)`,
    );
  }

  // 3. Disposable/suspicious email patterns
  if (
    params.email.includes('tempmail') ||
    params.email.includes('throwaway') ||
    params.email.includes('guerrillamail')
  ) {
    score += 50;
    reasons.push('Disposable or suspicious email domain detected');
  }

  // 4. Incomplete/suspicious phone number format
  const cleanPhone = params.phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length < 10) {
    score += 35;
    reasons.push('Abnormal phone number digit length');
  }

  // Determine risk level
  let level: 'low' | 'medium' | 'high' = 'low';
  let requiresManualVerification = false;

  if (score >= 60) {
    level = 'high';
    requiresManualVerification = true;
  } else if (score >= 30) {
    level = 'medium';
    requiresManualVerification = params.paymentMethod === 'cod';
  }

  return {
    score,
    level,
    reasons,
    requiresManualVerification,
  };
}
