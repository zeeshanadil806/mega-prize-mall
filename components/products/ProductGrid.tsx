// components/products/ProductGrid.tsx (Server Component)
import { ProductModel } from '@/models/Product';
import ProductCard from './ProductCard';
import { connectToDatabase } from '@/lib/mongodb';
import { SortOrder } from 'mongoose';
import { ProductFilter } from '@/types';
import { escapeRegex } from '@/lib/utils';
import Link from 'next/link';
interface ProductGridProps {
  searchParams: {
    page?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    search?: string;
    bargain?: string;
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
    filter.category = searchParams.category;
  }
  // Add bargain filter
if (searchParams.bargain === 'true') {
  filter.bargainEnabled = true;
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
      .select('name price discountedPrice images slug category brand bargainEnabled isFeatured isBestSeller purchaseCount')
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
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product._id.toString()} 
            product={product}
          />
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          totalProducts={totalCount}
        />
      )}
    </>
  );
}

// Pagination Component
function Pagination({ 
  currentPage, 
  totalPages, 
  totalProducts 
}: { 
  currentPage: number; 
  totalPages: number; 
  totalProducts: number;
}) {
  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
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
  
  return (
    <div className="mt-12 border-t pt-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{(currentPage - 1) * 24 + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min(currentPage * 24, totalProducts)}
          </span>{' '}
          of <span className="font-medium">{totalProducts}</span> products
        </p>
        
        <div className="flex items-center space-x-2">
          <Link
            href={`/products?page=${Math.max(1, currentPage - 1)}`}
            className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            aria-disabled={currentPage === 1}
          >
            Previous
          </Link>
          
          {getPageNumbers().map((pageNum, index) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                ...
              </span>
            ) : (
              <Link
                key={pageNum}
                href={`/products?page=${pageNum}`}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === pageNum
                    ? 'bg-[#7C2C78] text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </Link>
            )
          ))}
          
          <Link
            href={`/products?page=${Math.min(totalPages, currentPage + 1)}`}
            className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            aria-disabled={currentPage === totalPages}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}