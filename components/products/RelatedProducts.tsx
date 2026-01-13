// components/products/RelatedProducts.tsx (Server Component)
import { ProductModel } from '@/models/Product';
import { connectToDatabase } from '@/lib/mongodb';
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
  
  // Fetch related products based on category and tags
  const relatedProducts = await ProductModel.find({
    _id: { $ne: currentProductId },
    isActive: true,
    $or: [
      { category },
      { tags: { $in: tags } },
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
    <div className="mt-16 pt-12 border-t">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
          <p className="text-gray-600 mt-1">You might also like</p>
        </div>
        <Link 
          href={`/products?category=${category}`}
          className="text-[#7C2C78] font-medium hover:underline"
        >
          View all in {category} →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product._id.toString()} product={product} />
        ))}
      </div>
    </div>
  );
}