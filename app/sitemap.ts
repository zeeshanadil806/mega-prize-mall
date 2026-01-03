// app/sitemap.ts
import { MetadataRoute } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { ProductModel } from '@/models/Product';
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
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/bargain`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const, // Changed to daily since bargain deals change
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/lucky-draw-info`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/shipping`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/refund`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    // Add FAQ pages
    {
      url: `${BASE_URL}/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    // Add How it works page
    {
      url: `${BASE_URL}/how-it-works`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
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
    // Add filtered product pages (without query params)
    {
      url: `${BASE_URL}/products/bargain`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/products/featured`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/products/best-sellers`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  sitemapEntries.push(...listingPages);

  // 3. INDIVIDUAL PRODUCTS (Bulk - Only Active Products)
  try {
    const products = await ProductModel.find({ isActive: true })
      .select('slug updatedAt')
      .limit(100) // Start with 100 products for testing
      .lean();

    const productEntries = products.map((product) => ({
      url: `${BASE_URL}/products/${product.slug}`,
      lastModified: product.updatedAt || currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    sitemapEntries.push(...productEntries);
    console.log(`✅ Added ${productEntries.length} products to sitemap`);
  } catch (error) {
    console.error('❌ Error fetching products for sitemap:', error);
    // Continue with other pages even if products fail
  }

  // 5. AUTH PAGES (Low priority, but important for indexing)
  const authPages = [
    {
      url: `${BASE_URL}/login`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.1,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.1,
    },
    {
      url: `${BASE_URL}/forgot-password`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.1,
    },
  ];

  sitemapEntries.push(...authPages);

  // 6. Add pagination for products (if you have pagination)
  // Example: First 5 pages of products
  for (let i = 1; i <= 5; i++) {
    sitemapEntries.push({
      url: `${BASE_URL}/products?page=${i}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    });
  }

  // 7. SORT/FILTER PAGES (Important for e-commerce)
  const sortPages = [
    'price-low-to-high',
    'price-high-to-low',
    'new-arrivals',
    'most-popular',
    'best-rated'
  ];

  sortPages.forEach(sort => {
    sitemapEntries.push({
      url: `${BASE_URL}/products?sort=${sort}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.5,
    });
  });

  // 8. Remove duplicates (just in case)
  const uniqueEntries = Array.from(
    new Map(sitemapEntries.map(entry => [entry.url, entry])).values()
  );

  console.log(`📊 Total unique URLs in sitemap: ${uniqueEntries.length}`);
  console.log(`🏆 Sitemap generated successfully at: ${new Date().toISOString()}`);
  
  return uniqueEntries;
}

// Generate dynamic sitemaps if you have more than 50,000 URLs
// export async function generateSitemaps() {
//   // If you expect to have > 50,000 products, split them
//   const productCount = await ProductModel.countDocuments({ isActive: true });
  
//   if (productCount > 20000) {
//     // Split into multiple sitemaps
//     const sitemapCount = Math.ceil(productCount / 10000);
//     const sitemaps = [];
    
//     for (let i = 0; i < sitemapCount; i++) {
//       sitemaps.push({ id: `products-${i}` });
//     }
    
//     // Add main pages sitemap
//     sitemaps.push({ id: 'main-pages' });
    
//     return sitemaps;
//   }
  
//   // Single sitemap for small to medium sites
//   return [{ id: 'main' }];
// }

export async function generateSitemaps() {
  // Return a single sitemap for now
  return [{ id: 'main' }];
}