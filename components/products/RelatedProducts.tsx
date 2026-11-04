// components/products/RelatedProducts.tsx (Server Component)
import { ProductModel } from '@/models/Product';
import { connectToDatabase } from '@/lib/mongodb';
import { resolveCategoryQuery } from '@/features/product/domain';
import ProductCard from './ProductCard';
import Link from 'next/link';

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
  tags: string[];
}

export default async function RelatedProducts({
  currentProductId,
  category,
  tags,
}: RelatedProductsProps) {
  await connectToDatabase();
  
  const categoryFilter = { category: resolveCategoryQuery(category) };

  // Fetch related products based on category and tags
  const relatedProducts = await ProductModel.find({
    _id: { $ne: currentProductId },
    isActive: true,
    $or: [
      categoryFilter,
      ...(tags && tags.length > 0 ? [{ tags: { $in: tags } }] : []),
      { isFeatured: true },
      { isBestSeller: true },
    ],
  })
    .select('name price discountedPrice images slug category brand bargainEnabled isFeatured isBestSeller purchaseCount')
    .limit(8)
    .lean();
  
  if (relatedProducts.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-3.5 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200/80">
      <div className="flex items-end justify-between gap-3 mb-2.5 sm:mb-3.5">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
            Related Products
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            You might also like
          </p>
        </div>
        <Link 
          href={`/products?category=${encodeURIComponent(category)}`}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#011b54] bg-[#011b54]/5 hover:bg-[#011b54] hover:text-white border border-[#011b54]/15 shadow-2xs hover:shadow-xs transition-all shrink-0 whitespace-nowrap"
        >
          <span className="hidden sm:inline">View all in {category}</span>
          <span className="sm:hidden">View All</span>
          <span className="text-[13px] leading-none">→</span>
        </Link>
      </div>
      
      <div className="flex sm:grid overflow-x-auto sm:overflow-visible scroll-smooth snap-x snap-mandatory no-scrollbar -mx-4 px-4 pt-1 pb-2 sm:pb-0 gap-3 sm:gap-4 md:gap-5 lg:gap-6 items-stretch sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 scroll-pl-4 scroll-pr-4">
        {relatedProducts.map((product) => (
          <ProductCard
            key={product._id.toString()}
            product={product}
            className="w-[78vw] max-w-[295px] sm:w-auto shrink-0 snap-start sm:snap-align-none"
          />
        ))}
      </div>
    </div>
  );
}