// Server-side fetchers for homepage product sections. Each function returns
// CustomerProductProps-compatible POJOs so they can be passed directly to the
// homepage section components (which previously fetched the same shape from
// the /api/products endpoint).
import { connectToDatabase } from '@/lib/mongodb';
import { ProductModel } from '@/models/Product';
import { CustomerProductProps, ImageProps } from '@/types';
import { Types } from 'mongoose';

// Image sub-docs in Mongoose carry an ObjectId `_id` that React Server
// Components can't serialize across the boundary, so we strip it in `transform`.
// `RawImage` reflects what `.lean()` actually returns rather than the wire shape.
interface RawImage {
  _id?: Types.ObjectId;
  id?: string;
  url: string;
  alt?: string;
  order?: number;
  metadata?: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
}

interface RawProduct {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
  costPrice?: number;
  images?: RawImage[];
  category: string;
  tags?: string[];
  brand: string;
  sku: string;
  stock: number;
  features?: string[];
  specifications?: Record<string, string>;
  color?: string;
  bargainEnabled: boolean;
  minBargainPrice?: number;
  maxBargainRounds?: number;
  bargainValidityHours?: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  purchaseCount?: number;
  bargainCount?: number;
  viewCount?: number;
  createdAt: Date;
  updatedAt?: Date;
}

function sanitizeImages(images?: RawImage[]): ImageProps[] {
  if (!images) return [];
  return images.map((img, idx) => ({
    // Prefer the author-supplied stable `id`; fall back to ObjectId string,
    // then to index, so the wire object never carries a Mongoose ObjectId.
    id: img.id ?? img._id?.toString() ?? String(idx),
    url: img.url,
    alt: img.alt,
    order: img.order ?? idx,
    metadata: img.metadata ?? { width: 0, height: 0, size: 0, format: '' },
  }));
}

function transform(p: RawProduct): CustomerProductProps {
  return {
    _id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.shortDescription ?? '',
    price: p.price,
    discountedPrice: p.discountedPrice ?? 0,
    costPrice: p.costPrice ?? 0,
    category: p.category,
    tags: p.tags ?? [],
    brand: p.brand,
    sku: p.sku,
    stock: p.stock,
    features: p.features ?? [],
    specifications: p.specifications ?? {},
    color: p.color ?? '',
    bargainEnabled: p.bargainEnabled,
    minBargainPrice: p.minBargainPrice ?? 0,
    maxBargainRounds: p.maxBargainRounds ?? 0,
    bargainValidityHours: p.bargainValidityHours ?? 24,
    images: sanitizeImages(p.images),
    metaTitle: p.metaTitle ?? '',
    metaDescription: p.metaDescription ?? '',
    keywords: p.keywords ?? [],
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    isNewArrival: p.isNewArrival,
    purchaseCount: p.purchaseCount ?? 0,
    bargainCount: p.bargainCount ?? 0,
    viewCount: p.viewCount ?? 0,
    createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
    discountPercentage: p.discountedPrice
      ? Math.round(((p.price - p.discountedPrice) / p.price) * 100)
      : 0,
  };
}

export async function getFeaturedProducts(limit = 12): Promise<CustomerProductProps[]> {
  await connectToDatabase();
  const products = await ProductModel.find({ isActive: true, isFeatured: true })
    .sort({ isFeatured: -1, isBestSeller: -1, createdAt: -1 })
    .limit(limit)
    .lean<RawProduct[]>();
  return products.map(transform);
}

export async function getNewArrivals(limit = 5): Promise<CustomerProductProps[]> {
  await connectToDatabase();
  const products = await ProductModel.find({ isActive: true, isNewArrival: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<RawProduct[]>();
  return products.map(transform);
}

export async function getBargainProducts(limit = 4): Promise<CustomerProductProps[]> {
  await connectToDatabase();
  const products = await ProductModel.find({ isActive: true, bargainEnabled: true })
    .sort({ bargainCount: -1, createdAt: -1 })
    .limit(limit)
    .lean<RawProduct[]>();
  return products.map(transform);
}

export interface CategoryStat {
  category: string;
  count: number;
}

export async function getCategoryStats(): Promise<CategoryStat[]> {
  await connectToDatabase();
  const stats = await ProductModel.aggregate<CategoryStat>([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);
  return stats;
}
