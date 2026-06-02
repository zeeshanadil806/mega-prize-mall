// lib/product-utils.ts
import { ProductModel } from '@/models/Product';
import { connectToDatabase } from './mongodb';
import { escapeRegex } from './utils';

// Cache categories and price range for 5 minutes
let cachedCategories: string[] | null = null;
let cachedPriceRange: { min: number; max: number } | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCategories(): Promise<string[]> {
  const now = Date.now();
  
  if (cachedCategories && now - cacheTimestamp < CACHE_DURATION) {
    return cachedCategories;
  }
  
  await connectToDatabase();
  
  const categories = await ProductModel.distinct('category', { isActive: true });
  
  cachedCategories = categories;
  cacheTimestamp = now;
  
  return categories;
}

export async function getPriceRange(): Promise<{ min: number; max: number }> {
  const now = Date.now();
  
  if (cachedPriceRange && now - cacheTimestamp < CACHE_DURATION) {
    return cachedPriceRange;
  }
  
  await connectToDatabase();
  
  const [minResult, maxResult] = await Promise.all([
    ProductModel.findOne({ isActive: true }).sort({ price: 1 }).select('price').lean(),
    ProductModel.findOne({ isActive: true }).sort({ price: -1 }).select('price').lean(),
  ]);
  
  const priceRange = {
    min: minResult?.price || 0,
    max: maxResult?.price || 10000,
  };
  
  cachedPriceRange = priceRange;
  cacheTimestamp = now;
  
  return priceRange;
}

/**
 * Lightweight fetch of products matching the listing-page filters, used to
 * build the `ItemList` JSON-LD on the products page. Returns only the fields
 * required for structured data (no images/specs) and the total match count.
 */
export interface ProductListingFilters {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  bargain?: string;
}

export interface ListingProductForSchema {
  name: string;
  slug: string;
  price: number;
  discountedPrice?: number;
  stock: number;
  bargainEnabled: boolean;
}

export async function getProductsForListingSchema(
  filters: ProductListingFilters,
  limit = 24,
): Promise<{ products: ListingProductForSchema[]; totalCount: number }> {
  await connectToDatabase();

  // Build the same filter ProductGrid uses so the JSON-LD matches what
  // the user actually sees on the page.
  const query: Record<string, unknown> = { isActive: true };

  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.bargain === 'true') {
    query.bargainEnabled = true;
  }
  if (filters.minPrice || filters.maxPrice) {
    const price: { $gte?: number; $lte?: number } = {};
    if (filters.minPrice) price.$gte = parseFloat(filters.minPrice);
    if (filters.maxPrice) price.$lte = parseFloat(filters.maxPrice);
    query.price = price;
  }
  if (filters.search) {
    const safe = escapeRegex(filters.search);
    query.$or = [
      { name: { $regex: safe, $options: 'i' } },
      { description: { $regex: safe, $options: 'i' } },
      { tags: { $regex: safe, $options: 'i' } },
    ];
  }

  const [products, totalCount] = await Promise.all([
    ProductModel.find(query)
      .select('name slug price discountedPrice stock bargainEnabled')
      .limit(limit)
      .lean<ListingProductForSchema[]>(),
    ProductModel.countDocuments(query),
  ]);

  return { products, totalCount };
}

// Pagination helper
export function generatePaginationLinks(
  currentPage: number,
  totalPages: number,
  baseUrl: string
): Array<{ page: number | string; url: string; isCurrent: boolean }> {
  const links = [];
  
  // Always show first page
  links.push({
    page: 1,
    url: `${baseUrl}?page=1`,
    isCurrent: currentPage === 1,
  });
  
  // Calculate range of pages to show
  let startPage = Math.max(2, currentPage - 2);
  let endPage = Math.min(totalPages - 1, currentPage + 2);
  
  // Adjust if we're near the beginning
  if (currentPage <= 3) {
    endPage = Math.min(5, totalPages - 1);
  }
  
  // Adjust if we're near the end
  if (currentPage >= totalPages - 2) {
    startPage = Math.max(2, totalPages - 4);
  }
  
  // Add ellipsis if needed
  if (startPage > 2) {
    links.push({ page: '...', url: '#', isCurrent: false });
  }
  
  // Add middle pages
  for (let i = startPage; i <= endPage; i++) {
    links.push({
      page: i,
      url: `${baseUrl}?page=${i}`,
      isCurrent: i === currentPage,
    });
  }
  
  // Add ellipsis if needed
  if (endPage < totalPages - 1) {
    links.push({ page: '...', url: '#', isCurrent: false });
  }
  
  // Always show last page if there is more than 1 page
  if (totalPages > 1) {
    links.push({
      page: totalPages,
      url: `${baseUrl}?page=${totalPages}`,
      isCurrent: currentPage === totalPages,
    });
  }
  
  return links;
}