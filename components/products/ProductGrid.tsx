// components/products/ProductGrid.tsx (Server Component)
import { ProductModel } from '@/models/Product';
import ProductCard from './ProductCard';
import { connectToDatabase } from '@/lib/mongodb';
import { SortOrder } from 'mongoose';
import { ProductFilter } from '@/types';
import { escapeRegex } from '@/lib/utils';
import { resolveCategoryQuery } from '@/features/product/domain';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
interface ProductGridProps {
  searchParams: {
    page?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    search?: string;
    bargain?: string;
    new?: string;
  };
}

export default async function ProductGrid({ searchParams }: ProductGridProps) {
  await connectToDatabase();
  
  // Parse query parameters
  const page = parseInt(searchParams.page || '1');
  const limit = 24; // Items per page
  const skip = (page - 1) * limit;
  
  // Build filter query
  const filter: ProductFilter = { isActive: true };
  
  if (searchParams.category) {
    filter.category = resolveCategoryQuery(searchParams.category);
  }
  // Add bargain & new arrivals filter
  if (searchParams.bargain === 'true') {
    filter.bargainEnabled = true;
  }
  if (searchParams.new === 'true') {
    filter.isNewArrival = true;
  }
  
  if (searchParams.minPrice || searchParams.maxPrice) {
    filter.price = {};
    if (searchParams.minPrice) {
      filter.price.$gte = parseFloat(searchParams.minPrice);
    }
    if (searchParams.maxPrice) {
      filter.price.$lte = parseFloat(searchParams.maxPrice);
    }
  }
  
  if (searchParams.search) {
    const safe = escapeRegex(searchParams.search);
    filter.$or = [
      { name: { $regex: safe, $options: 'i' } },
      { description: { $regex: safe, $options: 'i' } },
      { tags: { $regex: safe, $options: 'i' } },
    ];
  }
  
  // Build sort query
let sort: Record<string, SortOrder> = { createdAt: -1 };  switch (searchParams.sortBy) {
    case 'price_asc':
      sort = { price: 1 };
      break;
    case 'price_desc':
      sort = { price: -1 };
      break;
    case 'popular':
      sort = { purchaseCount: -1 };
      break;
  }
  
  // Fetch products with pagination (using lean for performance)
  const [products, totalCount] = await Promise.all([
    ProductModel.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('name price discountedPrice images slug category brand bargainEnabled isFeatured isBestSeller isNewArrival purchaseCount')
      .lean(),
    ProductModel.countDocuments(filter)
  ]);
  
  const totalPages = Math.ceil(totalCount / limit);
  
  // If no products found but we have search, show alternative
  if (products.length === 0 && searchParams.search) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No products found for &quot;{searchParams.search}&quot;
        </h3>
        <p className="text-gray-600">Try different search terms or filters</p>
      </div>
    );
  }
  
  return (
    <>
      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 items-stretch">
        {products.map((product, idx) => (
          <ProductCard
            key={product._id.toString()}
            product={product}
            // First row (up to xl:grid-cols-4) is above the fold on the
            // listing page — give those cards eager loading + fetchpriority.
            priority={idx < 4}
          />
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          totalProducts={totalCount}
          searchParams={searchParams}
        />
      )}
    </>
  );
}

// Pagination Component - Zero Mobile Overflow
function Pagination({ 
  currentPage, 
  totalPages, 
  totalProducts,
  searchParams,
}: { 
  currentPage: number; 
  totalPages: number; 
  totalProducts: number;
  searchParams: Record<string, string | undefined>;
}) {
  const createPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams || {}).forEach(([k, v]) => {
      if (k !== 'page' && v) {
        params.set(k, v);
      }
    });
    params.set('page', targetPage.toString());
    return `/products?${params.toString()}`;
  };

  // Generate numbered list for tablet/desktop
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const startItem = (currentPage - 1) * 24 + 1;
  const endItem = Math.min(currentPage * 24, totalProducts);

  return (
    <nav 
      aria-label="Pagination" 
      className="mt-8 sm:mt-12 border-t border-gray-150 pt-5 sm:pt-6 w-full max-w-full overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-4 w-full">
        {/* Results Counter */}
        <p className="text-xs sm:text-sm text-gray-500 font-medium text-center sm:text-left">
          Showing <span className="font-bold text-gray-900">{startItem}</span>–<span className="font-bold text-gray-900">{endItem}</span> of{' '}
          <span className="font-bold text-gray-900">{totalProducts}</span> products
        </p>
        
        {/* Mobile-Optimized Pagination Bar (Fits within 320px+ with zero horizontal overflow) */}
        <div className="flex sm:hidden items-center justify-between w-full max-w-xs px-2 gap-2">
          {currentPage === 1 ? (
            <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 bg-gray-50 border border-gray-150 cursor-not-allowed">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </span>
          ) : (
            <Link
              href={createPageUrl(currentPage - 1)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:border-[#011b54] active:bg-gray-100 shadow-2xs transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </Link>
          )}

          <span className="text-xs font-bold text-gray-700 whitespace-nowrap px-2">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage === totalPages ? (
            <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 bg-gray-50 border border-gray-150 cursor-not-allowed">
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          ) : (
            <Link
              href={createPageUrl(currentPage + 1)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:border-[#011b54] active:bg-gray-100 shadow-2xs transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Desktop Numbered Pagination (Hidden on mobile to guarantee zero overflow) */}
        <div className="hidden sm:flex items-center gap-1.5">
          {currentPage === 1 ? (
            <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-gray-300 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </span>
          ) : (
            <Link
              href={createPageUrl(currentPage - 1)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Link>
          )}

          {getPageNumbers().map((pageNum, index) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2.5 py-2 text-xs font-bold text-gray-400">
                ...
              </span>
            ) : (
              <Link
                key={pageNum}
                href={createPageUrl(Number(pageNum))}
                className={`inline-flex items-center justify-center min-w-[34px] h-[34px] px-2 rounded-lg text-xs font-bold transition-all ${
                  currentPage === pageNum
                    ? 'bg-[#011b54] text-white shadow-2xs'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </Link>
            )
          ))}

          {currentPage === totalPages ? (
            <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-gray-300 cursor-not-allowed">
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          ) : (
            <Link
              href={createPageUrl(currentPage + 1)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}