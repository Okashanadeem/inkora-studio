import { z } from 'zod';

export const checkoutContactSchema = z.object({
  fullName: z.string().min(2, 'Full name must have at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .min(10, 'Please enter a valid phone number')
    .max(16)
    .regex(/^[0-9+ -]+$/, 'Phone number can only contain digits, spaces, hyphens, and +'),
  marketingConsent: z.boolean().default(false), // Optional and unchecked by default (Section 13)
});

export const checkoutAddressSchema = z.object({
  addressLine1: z.string().min(5, 'Delivery address is required'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postalCode: z.string().optional(),
});

export const orderItemInputSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().min(1),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  optionsSnapshot: z.record(z.string(), z.string()).default({}), // e.g. { Size: "A3", Frame: "Black Wooden Frame" }
  artworkKey: z.string().optional(), // R2 storage key
});

export const createOrderInputSchema = z.object({
  contact: checkoutContactSchema,
  shipping: checkoutAddressSchema,
  items: z.array(orderItemInputSchema).min(1, 'Cart cannot be empty'),
  paymentMethod: z.enum(['cod', 'bank_transfer', 'online', 'quotation']).default('cod'),
  idempotencyKey: z.string().min(10, 'Idempotency key required'),
  couponCode: z.string().optional(),
});

export type CheckoutContact = z.infer<typeof checkoutContactSchema>;
export type CheckoutAddress = z.infer<typeof checkoutAddressSchema>;
export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;
