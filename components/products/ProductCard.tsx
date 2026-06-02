// components/products/ProductCard.tsx (Server Component)
import Link from "next/link";
import Image from "next/image";
// import { Product } from '@/models/Product';
import { formatCurrency } from "@/lib/bargain-utils";
import { Badge } from "@/components/ui/badge";
import { Tag, Star, TrendingUp } from "lucide-react";
import { ProductProps } from "@/types";

interface ProductCardProps {
  product: ProductProps;
  /**
   * Mark as the LCP image — passes `priority` to Next/Image so the first
   * above-the-fold card gets eager loading + fetchpriority=high. Off by
   * default so non-LCP cards stay lazy.
   */
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const finalPrice = product.discountedPrice || product.price;
  const discountPercentage = product.discountedPrice
    ? Math.round(
        ((product.price - product.discountedPrice) / product.price) * 100,
      )
    : 0;

  const mainImage = product.images?.[0]?.url || "/placeholder-product.jpg";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative bg-white rounded-xl border border-gray-200 p-4 hover:border-[#7C2C78]/30 hover:shadow-lg transition-all duration-300"
    >
      {/* Badges Container - Top Left */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 max-w-[70%]">
        {product.isFeatured && (
          <Badge 
            className="px-2 py-1 md:px-2.5 md:py-1 rounded-full bg-linear-to-r from-[#EAB75F] to-[#FF9F45] text-white text-[10px] xs:text-[11px] sm:text-xs font-bold shadow-md flex items-center justify-center whitespace-nowrap w-fit"
          >
            <span className="hidden xs:inline">⭐</span>
            <span className="xs:ml-1">Featured</span>
          </Badge>
        )}
        {product.isBestSeller && (
          <Badge 
            className="px-2 py-1 md:px-2.5 md:py-1 rounded-full bg-linear-to-r from-[#7C2C78] to-[#A43875] text-white text-[10px] xs:text-[11px] sm:text-xs font-bold shadow-md flex items-center justify-center whitespace-nowrap w-fit"
          >
            <span className="hidden xs:inline">🔥</span>
            <span className="xs:ml-1">Best Seller</span>
          </Badge>
        )}
      </div>
      
      {/* Top Right Badges Container */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1 max-w-[30%]">
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <Badge 
            className="px-2 py-1 md:px-2.5 md:py-1 rounded-full bg-linear-to-r from-[#10B981] to-[#34D399] text-white text-[10px] xs:text-[11px] sm:text-xs font-bold shadow-md flex items-center justify-center whitespace-nowrap"
          >
            -{discountPercentage}%
          </Badge>
        )}
        
        {/* Bargain Badge */}
        {product.bargainEnabled && (
          <Badge 
            className="px-2 py-1 md:px-2.5 md:py-1 rounded-full bg-linear-to-r from-[#2E297D] to-[#7C2C78] text-white text-[10px] xs:text-[11px] sm:text-xs font-bold shadow-md flex items-center justify-center whitespace-nowrap"
          >
            <span className="hidden xs:inline">💎</span>
            <span className="xs:ml-1">Deal</span>
          </Badge>
        )}
      </div>

      {/* Product Image */}
      <div className="relative h-44 xs:h-36 sm:h-40 md:h-44 lg:h-48 xl:h-52 overflow-hidden bg-gray-100">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            {...(priority ? { priority: true } : { loading: "lazy" })}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
            <div className="text-gray-400">
              <svg
                className="h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-2">

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 group-hover:text-[#7C2C78] line-clamp-2 text-xs sm:text-sm h-8 sm:h-10 mb-1">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 mt-auto">
          <div className="flex flex-col items-baseline">
            <span className="text-sm sm:text-base font-bold text-gray-900">
              {formatCurrency(finalPrice)}
            </span>
            {product.discountedPrice && (
              <span className="text-xs sm:text-sm text-gray-500 line-through ">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* View Details - Only on larger screens */}
          <span className="text-xs sm:text-sm font-medium text-[#7C2C78] group-hover:underline hidden md:inline">
            View →
          </span>

          {/* Mobile Discount Badge */}
          {product.discountedPrice && (
            <span className="text-[10px] sm:hidden bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
              Save {discountPercentage}%
            </span>
          )}
        </div>
      </div>

    </Link>
  );
}
