// app/sitemap.ts
import { MetadataRoute } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ProductModel } from '@/models/Product';
import { log } from '@/lib/logger';
// import { BlogModel } from '@/models/Blog'; // If you have blog
// import { CategoryModel } from '@/models/Category'; // If you have category model

const BASE_URL = 'https://megaprizemall.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectToDatabase();
  
  const sitemapEntries: MetadataRoute.Sitemap = [];
  const currentDate = new Date();

  // 1. STATIC PAGES (High Priority)
  const staticPages = [
    {
      url: `${BASE_URL}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/terms-and-conditions`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/shipping-policy`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/returns-refunds-policy`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  sitemapEntries.push(...staticPages);

  // 2. PRODUCT LISTING PAGES
  const listingPages = [
    {
      url: `${BASE_URL}/products`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/categories`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ];

  sitemapEntries.push(...listingPages);

  // 3. INDIVIDUAL PRODUCTS (Bulk - Only Active Products)
  try {
    const products = await ProductModel.find({ isActive: true })
      .select('slug updatedAt')
      .lean();

    const productEntries = products.map((product) => ({
      url: `${BASE_URL}/products/${product.slug}`,
      lastModified: product.updatedAt || currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    sitemapEntries.push(...productEntries);
  } catch (error) {
    log.error('Error fetching products for sitemap', { error: error as Error });
    // Continue with other pages even if products fail
  }

  // Auth pages (/login, /register, /forgot-password) are intentionally omitted
  // because robots.ts disallows them.

  // 5. Remove duplicates (just in case)
  const uniqueEntries = Array.from(
    new Map(sitemapEntries.map(entry => [entry.url, entry])).values()
  );

  return uniqueEntries;
}


export async function generateSitemaps() {
  // Return a single sitemap for now
  return [{ id: 'main' }];
}