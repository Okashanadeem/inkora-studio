import { z } from 'zod';

export const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'image/svg+xml',
];

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB cap

export const presignUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE_BYTES, 'File size exceeds maximum 50MB limit'),
  mimeType: z
    .string()
    .refine(
      (mime) => ALLOWED_MIME_TYPES.includes(mime),
      'File type not allowed. Please upload PNG, JPG, WebP, PDF, or SVG.',
    ),
  isPrivateArtwork: z.boolean().default(true),
});

export const confirmUploadSchema = z.object({
  orderItemId: z.string().uuid().optional(),
  r2Key: z.string().min(1),
  mimeType: z.string().min(1),
  fileSize: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  dpi: z.number().int().positive().optional(),
});

/**
 * Calculate effective DPI for a given print dimension in inches
 */
export function calculatePrintDPI(
  pixelDimension: number,
  printInches: number,
): { dpi: number; quality: 'optimal' | 'acceptable' | 'low' } {
  if (printInches <= 0) return { dpi: 0, quality: 'low' };

  const dpi = Math.round(pixelDimension / printInches);

  if (dpi >= 300) {
    return { dpi, quality: 'optimal' };
  } else if (dpi >= 150) {
    return { dpi, quality: 'acceptable' };
  } else {
    return { dpi, quality: 'low' };
  }
}
