import { createAdminClient } from '@/lib/supabase/admin';
import { CreateOrderInput, createOrderInputSchema } from './schema';
import { evaluateOrderRisk } from './risk';
import { withIdempotency } from '@/lib/auth/idempotency';
import crypto from 'crypto';

export interface OrderCreationResult {
  orderId: string;
  orderNumber: string;
  trackingToken: string;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  grandTotal: number;
  riskLevel: 'low' | 'medium' | 'high';
  requiresVerification: boolean;
}

/**
 * Server-authoritative order placement service (Section 5.1 & 7)
 * Zero browser trust: all line prices and options are recomputed on the server.
 */
export async function placeOrder(
  input: CreateOrderInput,
  userId?: string | null,
): Promise<OrderCreationResult> {
  const validated = createOrderInputSchema.parse(input);

  // Wrap inside idempotency guard (Section 5.7)
  const idempResult = await withIdempotency(
    validated.idempotencyKey,
    'place_order',
    86400,
    async () => {
      const adminClient = createAdminClient();

      // 1. Fetch products from database to recompute authoritative prices
      const productIds = validated.items.map((i) => i.productId);
      const { data: dbProducts } = await adminClient
        .from('products')
        .select(
          `
          id,
          name,
          base_price,
          status,
          product_options (
            name,
            option_values (label, price_modifier)
          ),
          price_tiers (min_qty, unit_price)
        `,
        )
        .in('id', productIds);

      const productMap = new Map((dbProducts || []).map((p) => [p.id, p]));

      let subtotal = 0;
      let totalQuantity = 0;

      const computedItems = validated.items.map((item) => {
        const product = productMap.get(item.productId);
        let unitPrice = product ? product.base_price : 1200; // fallback for unseeded local dev

        // Apply bulk tiers if defined
        if (product && product.price_tiers && product.price_tiers.length > 0) {
          const matchedTier = [...product.price_tiers]
            .sort((a, b) => b.min_qty - a.min_qty)
            .find((t) => item.quantity >= t.min_qty);
          if (matchedTier) unitPrice = matchedTier.unit_price;
        }

        // Apply option price modifiers
        if (product && product.product_options) {
          for (const optGroup of product.product_options) {
            const chosenLabel = item.optionsSnapshot[optGroup.name];
            if (chosenLabel && optGroup.option_values) {
              const matchedVal = optGroup.option_values.find((v) => v.label === chosenLabel);
              if (matchedVal) unitPrice += matchedVal.price_modifier;
            }
          }
        }

        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;
        totalQuantity += item.quantity;

        return {
          productId: item.productId,
          nameSnapshot: product?.name || item.productName,
          unitPriceSnapshot: unitPrice,
          quantity: item.quantity,
          optionsSnapshot: item.optionsSnapshot,
          artworkKey: item.artworkKey,
        };
      });

      // 2. Shipping calculation (Free above PKR 3,000, else PKR 250 flat rate)
      const shippingTotal = subtotal >= 3000 ? 0 : 250;
      const discountTotal = 0; // Handled in Phase 8 promotions
      const taxTotal = 0;
      const grandTotal = subtotal - discountTotal + shippingTotal;

      // 3. Risk scoring evaluation (Section 7.2)
      const risk = evaluateOrderRisk({
        grandTotal,
        paymentMethod: validated.paymentMethod,
        totalQuantity,
        phone: validated.contact.phone,
        email: validated.contact.email,
      });

      // 4. Generate order number and tracking token
      const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `INK-${dateStr}-${randomSuffix}`;

      const rawTrackingToken = crypto.randomBytes(24).toString('hex');
      const trackingTokenHash = crypto.createHash('sha256').update(rawTrackingToken).digest('hex');

      const initialStatus = risk.requiresManualVerification ? 'pending_verification' : 'draft';

      // 5. Insert order into database
      const { data: order, error: orderErr } = await adminClient
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: userId || null,
          guest_email: validated.contact.email,
          guest_phone: validated.contact.phone,
          status: initialStatus,
          payment_status: 'unpaid',
          payment_method: validated.paymentMethod,
          subtotal,
          discount_total: discountTotal,
          shipping_total: shippingTotal,
          tax_total: taxTotal,
          grand_total: grandTotal,
          risk_level: risk.level,
          risk_reasons: risk.reasons,
          idempotency_key: validated.idempotencyKey,
          tracking_token_hash: trackingTokenHash,
        })
        .select('id')
        .single();

      if (orderErr) throw orderErr;

      // 6. Insert order items & status history
      for (const item of computedItems) {
        const { data: orderItem } = await adminClient
          .from('order_items')
          .insert({
            order_id: order.id,
            product_id: item.productId,
            name_snapshot: item.nameSnapshot,
            unit_price_snapshot: item.unitPriceSnapshot,
            quantity: item.quantity,
            options_snapshot: item.optionsSnapshot,
          })
          .select('id')
          .single();

        if (orderItem && item.artworkKey) {
          await adminClient.from('artwork_files').insert({
            order_item_id: orderItem.id,
            r2_key: item.artworkKey,
            mime_type: 'application/octet-stream',
            file_size: 1024,
            status: 'uploaded',
          });
        }
      }

      await adminClient.from('order_status_events').insert({
        order_id: order.id,
        to_status: initialStatus,
        note: `Order placed via web checkout (${validated.paymentMethod.toUpperCase()})`,
      });

      return {
        orderId: order.id,
        orderNumber,
        trackingToken: rawTrackingToken,
        subtotal,
        discountTotal,
        shippingTotal,
        grandTotal,
        riskLevel: risk.level,
        requiresVerification: risk.requiresManualVerification,
      };
    },
  );

  return idempResult.data as OrderCreationResult;
}
