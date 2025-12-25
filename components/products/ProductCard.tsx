// components/products/ProductCard.tsx (Server Component)
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/models/Product';
import { formatCurrency } from '@/lib/bargain-utils';
import { Badge } from '@/components/ui/badge';
import { Tag, Star, TrendingUp } from 'lucide-react';

interface ProductCardProps {
  product: Product & { _id: string };
}

export default function ProductCard({ product }: ProductCardProps) {
  const finalPrice = product.discountedPrice || product.price;
  const discountPercentage = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;
  
  const mainImage = product.images?.[0]?.url || '/placeholder-product.jpg';
  
  return (
    <Link 
      href={`/products/${product.slug}`}
      className="group relative bg-white rounded-xl border border-gray-200 p-4 hover:border-[#7C2C78]/30 hover:shadow-lg transition-all duration-300"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.isFeatured && (
          <Badge className="bg-linear-to-r from-[#EAB75F] to-[#A43875] text-white border-0">
            <Star className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
        {product.isBestSeller && (
          <Badge className="bg-linear-to-r from-[#7C2C78] to-[#2E297D] text-white border-0">
            <TrendingUp className="h-3 w-3 mr-1" />
            Best Seller
          </Badge>
        )}
        {product.bargainEnabled && (
          <Badge variant="outline" className="border-[#EAB75F] text-[#EAB75F] bg-white/90">
            <Tag className="h-3 w-3 mr-1" />
            Bargain
          </Badge>
        )}
      </div>
      
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0 z-10">
          {discountPercentage}% OFF
        </Badge>
      )}
      
      {/* Product Image */}
      <div className="relative h-48 w-full mb-4 overflow-hidden rounded-lg bg-gray-100">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-gray-400">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="space-y-2">
        {/* Category */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {product.category}
          </span>
          {product.purchaseCount > 0 && (
            <span className="text-xs text-gray-500">
              {product.purchaseCount} sold
            </span>
          )}
        </div>
        
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 group-hover:text-[#7C2C78] line-clamp-2 h-12">
          {product.name}
        </h3>
        
        {/* Brand */}
        {product.brand && (
          <p className="text-sm text-gray-600">Brand: {product.brand}</p>
        )}
        
        {/* Price */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(finalPrice)}
            </span>
            {product.discountedPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          
          {/* View Details */}
          <span className="text-sm font-medium text-[#7C2C78] group-hover:underline">
            View Details →
          </span>
        </div>
      </div>
      
      {/* Quick Action Button (Appears on hover) */}
      <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-2">
          <button className="w-full py-2 text-sm font-medium text-white bg-linear-to-r from-[#7C2C78] to-[#A43875] rounded-md hover:from-[#6A2566] hover:to-[#8D2F6A] transition-all">
            Quick Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}