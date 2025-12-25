// lib/home-data.ts
import { ProductModel } from '@/models/Product';
import { connectToDatabase } from './mongodb';
import { ProductProps } from '@/types';

// Cache for 5 minutes
let cachedFeaturedProducts: ProductProps[] | null = null;
let cachedCategories: ProductProps[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export async function getFeaturedProducts() {
  const now = Date.now();
  
  if (cachedFeaturedProducts && now - cacheTimestamp < CACHE_DURATION) {
    return cachedFeaturedProducts;
  }
  
  await connectToDatabase();
  
  const products = await ProductModel.find({
    isActive: true,
    $or: [
      { isFeatured: true },
      { isBestSeller: true },
      { bargainEnabled: true },
    ],
  })
    .select('name price discountedPrice images slug category brand bargainEnabled isFeatured isBestSeller')
    .limit(8)
    .sort({ purchaseCount: -1, createdAt: -1 })
    .lean();
  
  cachedFeaturedProducts = products;
  cacheTimestamp = now;
  
  return products;
}

export async function getCategoriesWithCount() {
  const now = Date.now();
  
  if (cachedCategories && now - cacheTimestamp < CACHE_DURATION) {
    return cachedCategories;
  }
  
  await connectToDatabase();
  
  const categories = await ProductModel.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
    { 
      $project: {
        name: '$_id',
        count: 1,
        _id: 0,
      }
    }
  ]);
  
  cachedCategories = categories;
  cacheTimestamp = now;
  
  return categories;
}