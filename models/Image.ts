import { z } from 'zod';

export const ImageSchema = z.object({
  id: z.string().min(1), // Unique ID for each image
  url: z.string().url(), // Cloudflare Images CDN URL
  // r2Key: z.string(), // Original R2 storage key
  alt: z.string().min(3).max(255).optional(), // SEO alt text
  order: z.number().int().min(0).default(0), // Display order
  // blurHash: z.string().optional(), // For image placeholders
  metadata: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    size: z.number().int().positive(), // bytes
    format: z.enum(['webp', 'jpg', 'png', 'jpeg']),
    // uploadedAt: z.date().default(() => new Date()),
  }),
});

export type Image = z.infer<typeof ImageSchema>;