import { z } from 'zod';

export const productStatusSchema = z.enum(['draft', 'published', 'archived']);

export const productOptionValueSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1, 'Option label is required'),
  priceModifier: z.number().int().default(0), // PKR delta
  sortOrder: z.number().int().default(0),
});

export const productOptionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Option group name is required (e.g. Size, Material)'),
  sortOrder: z.number().int().default(0),
  values: z.array(productOptionValueSchema).min(1, 'At least one option value is required'),
});

export const priceTierSchema = z.object({
  id: z.string().uuid().optional(),
  minQty: z.number().int().positive('Minimum quantity must be greater than 0'),
  unitPrice: z.number().int().positive('Unit price must be greater than 0 in PKR'),
});

export const productInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Product name must have at least 2 characters').max(120),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lower-case alphanumeric with hyphens'),
  description: z.string().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  basePrice: z.number().int().positive('Base price must be greater than 0 in PKR'),
  status: productStatusSchema.default('draft'),
  isCustomizable: z.boolean().default(true),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  options: z.array(productOptionSchema).default([]),
  priceTiers: z.array(priceTierSchema).default([]),
  imageKeys: z.array(z.string()).default([]),
});

export const categoryInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Category name must have at least 2 characters').max(60),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lower-case alphanumeric with hyphens'),
  parentId: z.string().uuid().nullable().optional(),
  imageKey: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
});

export type ProductInput = z.infer<typeof productInputSchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;
