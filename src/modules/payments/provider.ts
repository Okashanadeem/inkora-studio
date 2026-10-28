/**
 * Inkora Studio Payment Provider Abstraction (Section 8 & Decisions D10, D22, D24)
 * Decouples order management from specific Pakistani payment gateways
 * (COD, Bank Transfer with Raast/IBFT proof, JazzCash/Easypaisa, Quotation).
 */

export interface PaymentIntent {
  paymentId: string;
  orderId: string;
  amount: number; // PKR Integer
  status: 'pending' | 'paid' | 'failed';
  redirectUrl?: string;
  instructions?: string;
}

export interface VerifiedEvent {
  isValid: boolean;
  orderId: string;
  amount: number;
  providerRef: string;
  rawPayload: Record<string, unknown>;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

export interface PaymentProvider {
  id: 'cod' | 'bank_transfer' | 'online' | 'quotation';
  name: string;
  createPayment(orderId: string, grandTotal: number): Promise<PaymentIntent>;
  verifyWebhook(req: Request): Promise<VerifiedEvent>;
  refund(paymentId: string, amount: number): Promise<RefundResult>;
}

/**
 * Cash on Delivery (COD) Provider Implementation
 */
export class CashOnDeliveryProvider implements PaymentProvider {
  id = 'cod' as const;
  name = 'Cash on Delivery';

  async createPayment(orderId: string, grandTotal: number): Promise<PaymentIntent> {
    return {
      paymentId: `cod-${orderId}`,
      orderId,
      amount: grandTotal,
      status: 'pending',
      instructions:
        'Pay in cash upon arrival. Order requires phone/WhatsApp confirmation before production starts.',
    };
  }

  async verifyWebhook(): Promise<VerifiedEvent> {
    throw new Error('Webhooks not applicable for Cash on Delivery');
  }

  async refund(): Promise<RefundResult> {
    return { success: true };
  }
}

/**
 * Direct Bank Transfer (IBFT / Raast) Provider Implementation
 */
export class BankTransferProvider implements PaymentProvider {
  id = 'bank_transfer' as const;
  name = 'Direct Bank Transfer / Raast';

  async createPayment(orderId: string, grandTotal: number): Promise<PaymentIntent> {
    return {
      paymentId: `ibft-${orderId}`,
      orderId,
      amount: grandTotal,
      status: 'pending',
      instructions:
        'Transfer to Meezan Bank / Raast ID: 03111257119. Upload screenshot proof via tracking link.',
    };
  }

  async verifyWebhook(): Promise<VerifiedEvent> {
    throw new Error('Bank transfers are verified manually by staff');
  }

  async refund(): Promise<RefundResult> {
    return { success: true };
  }
}

export function getPaymentProvider(method: string): PaymentProvider {
  switch (method) {
    case 'bank_transfer':
      return new BankTransferProvider();
    case 'cod':
    default:
      return new CashOnDeliveryProvider();
  }
}
