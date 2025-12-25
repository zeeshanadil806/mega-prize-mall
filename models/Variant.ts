import { z } from 'zod';

export const VariantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50), // e.g., "Color", "Size"
  value: z.string().min(1).max(50), // e.g., "Red", "128GB"
  priceAdjustment: z.number().default(0), // +/- price
  stock: z.number().int().min(0).default(0),
  skuSuffix: z.string().optional(), // "-RED", "-128GB"
  isActive: z.boolean().default(true),
});

export type Variant = z.infer<typeof VariantSchema>;