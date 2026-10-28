import { z } from 'zod';

export const promotionTypeSchema = z.enum(['percentage', 'fixed']);
export const promotionAudienceSchema = z.enum(['all', 'first_order', 'group']);
export const promotionScopeSchema = z.enum(['all', 'categories', 'products']);

export const promotionInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Promotion title is required').max(100),
  type: promotionTypeSchema,
  value: z.number().int().positive('Discount value must be greater than 0'),
  maxDiscount: z.number().int().positive().optional(),
  minSpend: z.number().int().min(0, 'Minimum spend must be 0 or positive').default(0),
  audience: promotionAudienceSchema.default('all'),
  appliesTo: promotionScopeSchema.default('all'),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
  isAutomatic: z.boolean().default(false),
  couponCode: z.string().min(3).max(30).toUpperCase().optional(),
  usageLimitTotal: z.number().int().positive().optional(),
  usageLimitPerCustomer: z.number().int().positive().default(1),
  stackable: z.boolean().default(false),
  priority: z.number().int().default(0),
});

export const applyCouponInputSchema = z.object({
  couponCode: z.string().min(3).max(30),
  subtotal: z.number().int().positive(),
  userEmail: z.string().email().optional(),
});

export type PromotionInput = z.infer<typeof promotionInputSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponInputSchema>;
